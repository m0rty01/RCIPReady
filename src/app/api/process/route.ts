import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('Starting process API...');
  console.log('Environment:', {
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Not set',
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const process = await prisma.process.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!process) {
      // Create initial process for the user
      const newProcess = await prisma.process.create({
        data: {
          userId,
          stage: 'PROFILE_CREATION',
          status: 'In Progress',
        },
      });
      return NextResponse.json(newProcess);
    }

    return NextResponse.json(process);
  } catch (error: any) {
    console.error('Error in process API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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