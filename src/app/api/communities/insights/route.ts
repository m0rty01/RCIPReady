import { NextRequest, NextResponse } from 'next/server';
import { CommunityRecommender } from '@/services/communityRecommender';

export async function POST(request: NextRequest) {
  try {
    const { communityId, profile } = await request.json();
    
    if (!communityId || !profile) {
      return NextResponse.json(
        { error: 'Community ID and profile are required' },
        { status: 400 }
      );
    }

    const insights = await CommunityRecommender.generateCommunityInsights(
      communityId,
      profile
    );
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error getting community insights:', error);
    return NextResponse.json(
      { error: 'Failed to get community insights' },
      { status: 500 }
    );
  }
}