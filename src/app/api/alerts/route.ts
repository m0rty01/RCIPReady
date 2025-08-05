import { NextRequest, NextResponse } from 'next/server';
import { AlertSystem } from '@/services/alertSystem';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const alerts = await AlertSystem.getUnreadAlerts(userId);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const alerts = await AlertSystem.checkAndGenerateAlerts(userId);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error generating alerts:', error);
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    );
  }
}