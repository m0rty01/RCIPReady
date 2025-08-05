import { NextRequest, NextResponse } from 'next/server';
import { ProcessTracker } from '@/services/processTracker';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, communityId, itemId, completed } = body;

    if (!userId || !communityId || !itemId || completed === undefined) {
      return NextResponse.json(
        { error: 'User ID, community ID, item ID, and completed status are required' },
        { status: 400 }
      );
    }

    const timeline = await ProcessTracker.updateChecklistItem(
      userId,
      communityId,
      itemId,
      completed
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
}