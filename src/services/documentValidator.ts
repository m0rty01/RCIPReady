import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export class DocumentValidator {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async validateDocument(
    fileBuffer: Buffer,
    documentType: string,
    fileName: string
  ): Promise<ValidationResult> {
    try {
      // Extract text from PDF
      const { text } = await pdfParse(fileBuffer);

      // Define validation rules based on document type
      const validationRules = this.getValidationRules(documentType);

      // Use OpenAI to analyze the document
      const analysis = await this.analyzeDocument(text, validationRules);

      // Save document and analysis to database
      await this.saveDocumentAnalysis(fileName, documentType, analysis);

      return analysis;
    } catch (error) {
      console.error('Error validating document:', error);
      throw new Error('Failed to validate document');
    }
  }

  private static getValidationRules(documentType: string): string {
    const rules: Record<string, string> = {
      'IELTS': `
        - Must be Academic IELTS (not General Training)
        - Test result must be less than 2 years old
        - Minimum scores required:
          * Speaking: 6.0
          * Listening: 6.0
          * Reading: 6.0
          * Writing: 6.0
          * Overall: 6.5
      `,
      'ECA': `
        - Must be from an approved organization
        - Must be less than 5 years old
        - Must include degree equivalency assessment
        - Must reference the specific qualification being assessed
      `,
      'PROOF_OF_FUNDS': `
        - Must show minimum required amount based on family size
        - Bank statements must be less than 60 days old
        - Must be official bank documents
        - Must show consistent fund availability
      `,
    };

    return rules[documentType] || 'No specific validation rules defined';
  }

  private static async analyzeDocument(
    text: string,
    rules: string
  ): Promise<ValidationResult> {
    const prompt = `
      You are an expert RCIP document validator. Analyze the provided document text
      according to these rules:
      ${rules}
      
      Provide a JSON response with:
      - isValid: boolean indicating if document meets all requirements
      - score: number from 0-100 indicating compliance level
      - issues: array of specific problems found
      - suggestions: array of improvement recommendations
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in RCIP document validation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private static async saveDocumentAnalysis(
    fileName: string,
    type: string,
    analysis: ValidationResult
  ) {
    return await prisma.document.create({
      data: {
        fileName,
        type,
        status: analysis.isValid ? 'VALID' : 'INVALID',
        aiReviewScore: analysis.score,
        aiComments: JSON.stringify({
          issues: analysis.issues,
          suggestions: analysis.suggestions,
        }),
      },
    });
  }

  static async generateImprovementEmail(documentId: string): Promise<string> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const aiComments = JSON.parse(document.aiComments || '{}');
    
    const prompt = `
      Create a professional email explaining the issues found in the ${document.type} document
      and providing clear steps for improvement. Use these specific issues and suggestions:
      Issues: ${JSON.stringify(aiComments.issues)}
      Suggestions: ${JSON.stringify(aiComments.suggestions)}
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional immigration document specialist writing an email to an RCIP applicant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content || '';
  }
}