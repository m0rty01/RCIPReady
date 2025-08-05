import { OpenAI } from 'openai';
import axios from 'axios';
import { prisma } from '../lib/prisma';

interface VerificationResult {
  isVerified: boolean;
  score: number;
  reasons: string[];
  warnings: string[];
  lastVerified: Date;
  verificationMethod: string;
}

interface EmployerRanking {
  employerId: string;
  overallScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  strengths: string[];
  considerations: string[];
}

export class EmployerVerifier {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async verifyEmployer(employerId: string): Promise<VerificationResult> {
    try {
      const employer = await prisma.rCIPEmployer.findUnique({
        where: { id: employerId },
        include: {
          community: true,
          jobs: {
            where: { isActive: true },
          },
        },
      });

      if (!employer) {
        throw new Error('Employer not found');
      }

      // Perform multiple verification checks
      const [
        websiteCheck,
        communityCheck,
        businessCheck,
        socialMediaCheck,
      ] = await Promise.all([
        this.verifyWebsite(employer),
        this.verifyCommunityListing(employer),
        this.verifyBusinessRegistration(employer),
        this.verifySocialMedia(employer),
      ]);

      // Analyze verification results using AI
      const verificationResult = await this.analyzeVerification(
        employer,
        {
          websiteCheck,
          communityCheck,
          businessCheck,
          socialMediaCheck,
        }
      );

      // Update employer verification status
      await prisma.rCIPEmployer.update({
        where: { id: employerId },
        data: {
          isVerified: verificationResult.isVerified,
          lastVerified: verificationResult.lastVerified,
          verificationDetails: JSON.stringify({
            score: verificationResult.score,
            reasons: verificationResult.reasons,
            warnings: verificationResult.warnings,
            method: verificationResult.verificationMethod,
          }),
        },
      });

      return verificationResult;
    } catch (error) {
      console.error('Error verifying employer:', error);
      throw new Error('Failed to verify employer');
    }
  }

  static async rankEmployer(employerId: string): Promise<EmployerRanking> {
    const employer = await prisma.rCIPEmployer.findUnique({
      where: { id: employerId },
      include: {
        community: true,
        jobs: {
          where: { isActive: true },
        },
      },
    });

    if (!employer) {
      throw new Error('Employer not found');
    }

    const prompt = `
      Analyze this RCIP employer and provide a detailed ranking:
      
      Employer: ${JSON.stringify(employer, null, 2)}
      
      Consider:
      1. Job quality and variety
      2. Salary competitiveness
      3. Immigration track record
      4. Community involvement
      5. Industry stability
      6. Company size and growth
      
      Return a JSON object with:
      {
        "overallScore": number 0-100,
        "categories": array of {name, score, description},
        "strengths": array of strings,
        "considerations": array of strings
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RCIP employer analyst.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const ranking = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      employerId,
      ...ranking,
    };
  }

  private static async verifyWebsite(employer: any): Promise<boolean> {
    if (!employer.website) return false;

    try {
      const response = await axios.get(employer.website);
      // Check if website content matches employer info
      const content = response.data.toLowerCase();
      return (
        content.includes(employer.name.toLowerCase()) &&
        content.includes(employer.community.name.toLowerCase())
      );
    } catch (error) {
      return false;
    }
  }

  private static async verifyCommunityListing(employer: any): Promise<boolean> {
    // Check if employer is listed on official community RCIP page
    const communityUrl = employer.community.website;
    if (!communityUrl) return false;

    try {
      const response = await axios.get(communityUrl);
      const content = response.data.toLowerCase();
      return content.includes(employer.name.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  private static async verifyBusinessRegistration(employer: any): Promise<boolean> {
    // This would typically involve checking government business registries
    // For MVP, we'll assume true if the employer has a website and is listed on community page
    return employer.website && await this.verifyCommunityListing(employer);
  }

  private static async verifySocialMedia(employer: any): Promise<boolean> {
    // Check major social media platforms for employer presence
    // This is a simplified check for the MVP
    const companyName = encodeURIComponent(employer.name);
    const platforms = [
      `https://www.linkedin.com/company/${companyName}`,
      `https://www.facebook.com/${companyName}`,
    ];

    const results = await Promise.all(
      platforms.map(async (url) => {
        try {
          await axios.get(url);
          return true;
        } catch (error) {
          return false;
        }
      })
    );

    return results.some(result => result);
  }

  private static async analyzeVerification(
    employer: any,
    checks: {
      websiteCheck: boolean;
      communityCheck: boolean;
      businessCheck: boolean;
      socialMediaCheck: boolean;
    }
  ): Promise<VerificationResult> {
    const prompt = `
      Analyze these verification results for an RCIP employer:
      
      Employer: ${JSON.stringify(employer, null, 2)}
      
      Verification Checks:
      - Website Verification: ${checks.websiteCheck}
      - Community Listing: ${checks.communityCheck}
      - Business Registration: ${checks.businessCheck}
      - Social Media Presence: ${checks.socialMediaCheck}
      
      Provide a verification assessment as JSON with:
      {
        "isVerified": boolean,
        "score": number 0-100,
        "reasons": array of strings,
        "warnings": array of strings
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in RCIP employer verification.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      ...analysis,
      lastVerified: new Date(),
      verificationMethod: 'automated',
    };
  }
}