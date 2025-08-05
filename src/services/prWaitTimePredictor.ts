import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';

interface WaitTimeFactors {
  endorsementDate: Date;
  medicalPassed?: Date;
  biometricsDone?: Date;
  communityName: string;
  hasWorkPermit: boolean;
}

interface PredictionResult {
  estimatedWaitTime: number; // in days
  estimatedDecisionDate: Date;
  confidence: number; // 0-1
  factors: {
    name: string;
    impact: string;
    description: string;
  }[];
  recommendations: string[];
}

export class PRWaitTimePredictor {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async predictWaitTime(factors: WaitTimeFactors): Promise<PredictionResult> {
    try {
      // Get historical data from the database
      const historicalData = await this.getHistoricalData(factors.communityName);
      
      // Analyze factors using AI
      const analysis = await this.analyzeFactors(factors, historicalData);
      
      // Calculate estimated wait time
      const prediction = this.calculatePrediction(factors, analysis, historicalData);
      
      // Save prediction to database for future reference
      await this.savePrediction(factors, prediction);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting PR wait time:', error);
      throw new Error('Failed to predict PR wait time');
    }
  }

  private static async getHistoricalData(communityName: string) {
    return await prisma.applicationProcess.findMany({
      where: {
        community: {
          name: communityName,
        },
        endorsementDate: { not: null },
        stage: 'COMPLETED',
      },
      select: {
        endorsementDate: true,
        medicalDate: true,
        biometricsDate: true,
        estimatedPRDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100, // Get recent 100 cases
    });
  }

  private static async analyzeFactors(
    factors: WaitTimeFactors,
    historicalData: any[]
  ) {
    const prompt = `
      Analyze the following factors for PR processing time in the RCIP program:
      
      Current Application:
      - Community: ${factors.communityName}
      - Endorsement Date: ${factors.endorsementDate}
      - Medical Passed: ${factors.medicalPassed || 'Not yet'}
      - Biometrics Done: ${factors.biometricsDone || 'Not yet'}
      - Has Work Permit: ${factors.hasWorkPermit}
      
      Historical Data Summary:
      ${JSON.stringify(historicalData, null, 2)}
      
      Please analyze:
      1. Key factors affecting processing time
      2. Comparison with historical cases
      3. Current IRCC processing trends
      4. Recommendations for faster processing
      
      Provide analysis in JSON format with:
      - factors: array of {name, impact, description}
      - recommendations: array of actionable steps
      - confidence: number between 0-1
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RCIP immigration consultant analyzing PR processing times.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  }

  private static calculatePrediction(
    factors: WaitTimeFactors,
    analysis: any,
    historicalData: any[]
  ): PredictionResult {
    // Calculate average processing time from historical data
    const processingTimes = historicalData
      .filter(data => data.endorsementDate && data.estimatedPRDate)
      .map(data => {
        const endorsement = new Date(data.endorsementDate);
        const decision = new Date(data.estimatedPRDate);
        return Math.ceil((decision.getTime() - endorsement.getTime()) / (1000 * 60 * 60 * 24));
      });

    const avgProcessingTime = processingTimes.length > 0
      ? Math.ceil(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
      : 180; // Default to 6 months if no historical data

    // Apply factor adjustments based on AI analysis
    let adjustedTime = avgProcessingTime;
    if (factors.medicalPassed) adjustedTime *= 0.9;
    if (factors.biometricsDone) adjustedTime *= 0.9;
    if (factors.hasWorkPermit) adjustedTime *= 0.95;

    const estimatedDecisionDate = new Date(factors.endorsementDate);
    estimatedDecisionDate.setDate(estimatedDecisionDate.getDate() + adjustedTime);

    return {
      estimatedWaitTime: adjustedTime,
      estimatedDecisionDate,
      confidence: analysis.confidence || 0.7,
      factors: analysis.factors || [],
      recommendations: analysis.recommendations || [],
    };
  }

  private static async savePrediction(
    factors: WaitTimeFactors,
    prediction: PredictionResult
  ) {
    await prisma.applicationProcess.update({
      where: {
        communityId_endorsementDate: {
          communityId: (await this.getCommunityId(factors.communityName)),
          endorsementDate: factors.endorsementDate,
        },
      },
      data: {
        estimatedPRDate: prediction.estimatedDecisionDate,
      },
    });
  }

  private static async getCommunityId(name: string): Promise<string> {
    const community = await prisma.community.findUnique({
      where: { name },
    });
    if (!community) {
      throw new Error(`Community ${name} not found`);
    }
    return community.id;
  }
}