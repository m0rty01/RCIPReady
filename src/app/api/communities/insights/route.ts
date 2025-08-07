import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { communityId, profile } = await request.json();

    if (!communityId) {
      return NextResponse.json(
        { error: 'Community ID is required' },
        { status: 400 }
      );
    }

    // Get community data with related information
    const community = await prisma.community.findUnique({
      where: { id: communityId },
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

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    // Generate detailed insights using AI
    const prompt = `
      Generate detailed insights about ${community.name} for an applicant with:
      Profile: ${JSON.stringify(profile, null, 2)}
      
      Community Data: ${JSON.stringify(community, null, 2)}

      Provide a JSON response with:
      {
        "livingCosts": {
          "housing": string with housing cost analysis,
          "utilities": string with utilities cost analysis,
          "transportation": string with transportation cost analysis,
          "groceries": string with groceries cost analysis
        },
        "jobMarket": {
          "topIndustries": array of strings,
          "growthSectors": array of strings,
          "averageSalary": string with salary analysis
        },
        "education": {
          "schools": string with schools overview,
          "postSecondary": array of institutions,
          "specialPrograms": array of notable programs
        },
        "healthcare": {
          "facilities": array of healthcare facilities,
          "specialistAccess": string describing specialist availability,
          "waitTimes": string with wait time analysis
        },
        "integration": {
          "immigrantServices": array of available services,
          "culturalGroups": array of active cultural groups,
          "languages": array of commonly spoken languages
        },
        "lifestyle": {
          "recreation": array of recreational activities,
          "climate": string with climate description,
          "events": array of notable events
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert local guide with deep knowledge of RCIP communities.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const insights = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating community insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate community insights' },
      { status: 500 }
    );
  }
}