import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for job search parameters
const SearchParamsSchema = z.object({
  title: z.string().optional(),
  location: z.string().optional(),
  teerLevel: z.string().optional(),
  isRemote: z.string().optional(),
  noc: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = SearchParamsSchema.parse(Object.fromEntries(searchParams));

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          params.title ? { title: { contains: params.title, mode: 'insensitive' } } : {},
          params.location ? { location: { contains: params.location, mode: 'insensitive' } } : {},
          params.teerLevel ? { teerLevel: parseInt(params.teerLevel) } : {},
          params.isRemote ? { isRemote: params.isRemote === 'true' } : {},
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
      orderBy: {
        postedDate: 'desc',
      },
    });

    // If NOC is provided, rank jobs by match score
    if (params.noc && params.teerLevel) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const rankedJobs = await Promise.all(
        jobs.map(async (job) => {
          const matchScore = await calculateJobMatch(openai, job, params.noc!, parseInt(params.teerLevel!));
          return {
            ...job,
            matchScore,
          };
        })
      );

      rankedJobs.sort((a, b) => b.matchScore - a.matchScore);
      return NextResponse.json(rankedJobs);
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}

async function calculateJobMatch(
  openai: OpenAI,
  job: any,
  userNoc: string,
  userTeerLevel: number
): Promise<number> {
  let score = 0;

  // NOC match
  if (job.noc === userNoc) {
    score += 40;
  } else if (job.noc.startsWith(userNoc.substring(0, 3))) {
    score += 20; // Related NOC
  }

  // TEER level match
  if (job.teerLevel === userTeerLevel) {
    score += 30;
  } else if (Math.abs(job.teerLevel - userTeerLevel) === 1) {
    score += 15; // Adjacent TEER level
  }

  // Employer verification bonus
  if (job.employer.isVerified) {
    score += 30;
  }

  return Math.min(score, 100); // Cap at 100
}