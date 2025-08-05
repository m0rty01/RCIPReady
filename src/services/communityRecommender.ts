import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';

interface ApplicantProfile {
  occupation: string;
  noc: string;
  teerLevel: number;
  preferredProvince?: string;
  familySize: number;
  languageScores: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  workExperience: number; // in years
  education: string;
  hasJobOffer?: boolean;
  preferredIndustry?: string;
  remoteWorkPreference?: boolean;
}

interface CommunityRecommendation {
  communityId: string;
  communityName: string;
  matchScore: number;
  reasons: string[];
  considerations: string[];
  jobOpportunities: number;
  costOfLivingIndex: number;
  immigrantSupportScore: number;
  restrictions?: string[];
}

export class CommunityRecommender {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async recommendCommunities(
    profile: ApplicantProfile
  ): Promise<CommunityRecommendation[]> {
    try {
      // Get all communities data
      const communities = await this.getCommunityData();
      
      // Get job market data
      const jobMarketData = await this.getJobMarketData(profile.noc);
      
      // Analyze communities using AI
      const recommendations = await this.analyzeCommunities(
        profile,
        communities,
        jobMarketData
      );
      
      // Sort and return top recommendations
      return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error('Error recommending communities:', error);
      throw new Error('Failed to recommend communities');
    }
  }

  private static async getCommunityData() {
    return await prisma.community.findMany({
      include: {
        employers: {
          include: {
            jobs: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  private static async getJobMarketData(noc: string) {
    return await prisma.job.findMany({
      where: {
        noc,
        isActive: true,
      },
      include: {
        employer: {
          include: {
            community: true,
          },
        },
      },
    });
  }

  private static async analyzeCommunities(
    profile: ApplicantProfile,
    communities: any[],
    jobMarketData: any[]
  ): Promise<CommunityRecommendation[]> {
    const prompt = `
      Analyze RCIP communities for an applicant with the following profile:
      ${JSON.stringify(profile, null, 2)}

      Community Data:
      ${JSON.stringify(communities, null, 2)}

      Job Market Data for NOC ${profile.noc}:
      ${JSON.stringify(jobMarketData, null, 2)}

      For each community, provide:
      1. Match score (0-100)
      2. Key reasons for recommendation
      3. Important considerations
      4. Any restrictions or limitations
      5. Analysis of job opportunities
      6. Cost of living assessment
      7. Immigrant support services evaluation

      Return as JSON array of community recommendations.
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RCIP consultant analyzing community matches for immigrants.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '[]');
  }

  static async generateCommunityInsights(
    communityId: string,
    profile: ApplicantProfile
  ): Promise<string> {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        employers: {
          include: {
            jobs: {
              where: {
                isActive: true,
                noc: profile.noc,
              },
            },
          },
        },
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const prompt = `
      Generate detailed insights about ${community.name} for an applicant with:
      - Occupation: ${profile.occupation} (NOC: ${profile.noc})
      - Family Size: ${profile.familySize}
      - Education: ${profile.education}
      
      Community Data:
      ${JSON.stringify(community, null, 2)}

      Include:
      1. Living costs and housing market
      2. Job market analysis
      3. Education opportunities
      4. Healthcare facilities
      5. Cultural integration
      6. Immigration support services
      7. Transportation
      8. Climate and lifestyle
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a local expert providing detailed insights about an RCIP community.',
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