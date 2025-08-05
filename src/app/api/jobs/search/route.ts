import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rankJobMatch } from '@/services/jobScraper';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title');
  const location = searchParams.get('location');
  const teerLevel = searchParams.get('teerLevel');
  const isRemote = searchParams.get('isRemote');
  const noc = searchParams.get('noc');

  try {
    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          title ? { title: { contains: title, mode: 'insensitive' } } : {},
          location ? { location: { contains: location, mode: 'insensitive' } } : {},
          teerLevel ? { teerLevel: parseInt(teerLevel) } : {},
          isRemote ? { isRemote: isRemote === 'true' } : {},
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
    if (noc && teerLevel) {
      const jobsWithRanking = await Promise.all(
        jobs.map(async (job) => ({
          ...job,
          matchScore: await rankJobMatch(job.id, noc, parseInt(teerLevel)),
        }))
      );

      jobsWithRanking.sort((a, b) => b.matchScore - a.matchScore);
      return NextResponse.json(jobsWithRanking);
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