import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import * as pdfParse from 'pdf-parse';

interface ResumeAnalysis {
  skills: string[];
  experience: {
    years: number;
    relevantPositions: string[];
  };
  education: {
    level: string;
    field: string;
  };
  languages: {
    name: string;
    level: string;
  }[];
}

interface JobMatch {
  jobId: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

interface EmailSuggestion {
  subject: string;
  body: string;
  followUpPoints: string[];
  customization: {
    whatToHighlight: string[];
    whatToResearch: string[];
  };
}

export class ResumeAnalyzer {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async analyzeResume(resumeBuffer: Buffer): Promise<ResumeAnalysis> {
    try {
      // Extract text from PDF
      const { text } = await pdfParse(resumeBuffer);

      const prompt = `
        Analyze this resume and extract key information:
        ${text}

        Return a JSON object with:
        {
          "skills": array of technical and soft skills,
          "experience": {
            "years": total years of relevant experience,
            "relevantPositions": array of relevant job titles
          },
          "education": {
            "level": highest education level,
            "field": field of study
          },
          "languages": array of { name, level }
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyzer for immigration purposes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  static async calculateJobMatch(
    resumeAnalysis: ResumeAnalysis,
    jobId: string
  ): Promise<JobMatch> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const prompt = `
      Compare this candidate's profile with the job requirements:

      Resume Analysis:
      ${JSON.stringify(resumeAnalysis, null, 2)}

      Job Details:
      ${JSON.stringify(job, null, 2)}

      Consider:
      1. Skills match
      2. Experience relevance
      3. Education requirements
      4. Language requirements
      5. RCIP eligibility

      Return a JSON object with:
      {
        "matchScore": number 0-100,
        "strengths": array of matching qualifications,
        "gaps": array of missing or weak qualifications,
        "suggestions": array of improvement recommendations
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert job match analyzer for RCIP applications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      jobId,
      ...analysis,
    };
  }

  static async generateOutreachEmail(
    resumeAnalysis: ResumeAnalysis,
    jobMatch: JobMatch,
    jobId: string
  ): Promise<EmailSuggestion> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const prompt = `
      Create a customized outreach email for this RCIP job application:

      Candidate Profile:
      ${JSON.stringify(resumeAnalysis, null, 2)}

      Job Match Analysis:
      ${JSON.stringify(jobMatch, null, 2)}

      Job and Employer:
      ${JSON.stringify(job, null, 2)}

      Create a professional email that:
      1. Shows understanding of the company and role
      2. Highlights relevant experience and skills
      3. Demonstrates RCIP eligibility
      4. Includes specific achievements
      5. Shows enthusiasm and cultural fit

      Return a JSON object with:
      {
        "subject": email subject line,
        "body": full email body,
        "followUpPoints": key points to mention in follow-up,
        "customization": {
          "whatToHighlight": specific points to emphasize,
          "whatToResearch": company/role aspects to research further
        }
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in crafting RCIP job application emails.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }
}