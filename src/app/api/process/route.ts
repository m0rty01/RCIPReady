import { NextRequest, NextResponse } from 'next/server';
import { ProcessTracker } from '@/services/processTracker';
import { ProcessStage } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, communityId, initialStage } = body;

    if (!userId || !communityId) {
      return NextResponse.json(
        { error: 'User ID and community ID are required' },
        { status: 400 }
      );
    }

    const timeline = await ProcessTracker.createTimeline(
      userId,
      communityId,
      initialStage as ProcessStage
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error creating process timeline:', error);
    return NextResponse.json(
      { error: 'Failed to create process timeline' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, communityId, stage } = body;

    if (!userId || !communityId || !stage) {
      return NextResponse.json(
        { error: 'User ID, community ID, and stage are required' },
        { status: 400 }
      );
    }

    const timeline = await ProcessTracker.updateStage(
      userId,
      communityId,
      stage as ProcessStage
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error updating process stage:', error);
    return NextResponse.json(
      { error: 'Failed to update process stage' },
      { status: 500 }
    );
  }
}