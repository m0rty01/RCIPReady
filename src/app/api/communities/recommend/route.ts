import { NextRequest, NextResponse } from 'next/server';
import { CommunityRecommender } from '@/services/communityRecommender';

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    
    // Validate required fields
    const requiredFields = ['occupation', 'noc', 'teerLevel', 'familySize', 'languageScores', 'workExperience', 'education'];
    const missingFields = requiredFields.filter(field => !profile[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const recommendations = await CommunityRecommender.recommendCommunities(profile);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error getting community recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get community recommendations' },
      { status: 500 }
    );
  }
}