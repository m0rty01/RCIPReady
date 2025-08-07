import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('Starting community recommendation API...');
  console.log('Environment:', {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  });

  try {
    // Test database connection first
    try {
      console.log('Testing database connection...');
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError: any) {
      console.error('Database connection error:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
      });
      return NextResponse.json(
        { error: `Database connection failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Parse request body
    let profile;
    try {
      console.log('Parsing request body...');
      profile = await request.json();
      console.log('Profile data:', profile);
    } catch (parseError: any) {
      console.error('Request parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Get all communities
    console.log('Fetching communities...');
    const communities = await prisma.community.findMany({
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
    console.log(`Found ${communities.length} communities`);

    // If no communities, return empty array
    if (communities.length === 0) {
      console.log('No communities found');
      return NextResponse.json([]);
    }

    // Process each community
    console.log('Processing communities...');
    const recommendations = await Promise.all(
      communities.map(async (community) => {
        try {
          console.log(`Analyzing community: ${community.name}`);
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: 'You are an expert RCIP community analyst.',
              },
              {
                role: 'user',
                content: `
                  Analyze this RCIP community's suitability for an immigrant with the following profile:
                  Profile: ${JSON.stringify(profile, null, 2)}
                  Community: ${JSON.stringify(community, null, 2)}
                  
                  Return a JSON response with:
                  {
                    "matchScore": number 0-100,
                    "reasons": string[],
                    "considerations": string[],
                    "jobOpportunities": number,
                    "costOfLivingIndex": number,
                    "immigrantSupportScore": number,
                    "restrictions": string[]
                  }
                `,
              },
            ],
          });

          const analysis = JSON.parse(completion.choices[0].message.content || '{}');
          
          return {
            id: community.id,
            name: community.name,
            province: community.province,
            ...analysis,
          };
        } catch (analysisError: any) {
          console.error(`Error analyzing community ${community.name}:`, analysisError);
          return null;
        }
      })
    );

    // Filter out failed analyses and sort by match score
    const validRecommendations = recommendations
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Returning ${validRecommendations.length} recommendations`);
    return NextResponse.json(validRecommendations);
  } catch (error: any) {
    console.error('Unhandled error in community recommendation:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: `Failed to recommend communities: ${error.message}` },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}