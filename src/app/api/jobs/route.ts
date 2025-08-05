import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'langchain/llms/openai';
import { z } from 'zod';

const prisma = new PrismaClient();
const openai = new OpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
});

const searchParamsSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  teerLevel: z.string().optional(),
  remote: z.boolean().optional(),
  noc: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchParamsSchema.parse(Object.fromEntries(searchParams));

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          params.query ? {
            OR: [
              { title: { contains: params.query, mode: 'insensitive' } },
              { description: { contains: params.query, mode: 'insensitive' } },
            ],
          } : {},
          params.location ? { location: { contains: params.location, mode: 'insensitive' } } : {},
          params.teerLevel ? { teerLevel: parseInt(params.teerLevel) } : {},
          params.remote !== undefined ? { isRemote: params.remote } : {},
          params.noc ? { noc: { contains: params.noc, mode: 'insensitive' } } : {},
          { isActive: true },
        ],
      },
      include: {
        employer: {
          include: {
            community: true,
          },
        },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resume, jobId } = body;

    // Calculate resume match score using OpenAI
    const matchScore = await calculateResumeMatchScore(resume, jobId);

    return NextResponse.json({ matchScore });
  } catch (error) {
    console.error('Error processing resume match:', error);
    return NextResponse.json({ error: 'Failed to process resume match' }, { status: 500 });
  }
}

async function calculateResumeMatchScore(resume: string, jobId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: true },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const prompt = `
      Analyze the match between this resume and job posting. Consider:
      1. Skills match
      2. Experience level
      3. Education requirements
      4. TEER level compatibility
      5. NOC code alignment
      
      Job Details:
      Title: ${job.title}
      NOC: ${job.noc}
      TEER Level: ${job.teerLevel}
      Description: ${job.description}
      
      Resume:
      ${resume}
      
      Provide a match score between 0-100 and key reasons for the score.
    `;

    const response = await openai.call(prompt);
    
    // Parse the response to extract score and feedback
    // This is a simplified version - you'd want more robust parsing
    const score = parseInt(response.match(/\d+/)?.[0] || '0');
    
    return {
      score,
      feedback: response,
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw error;
  }
}