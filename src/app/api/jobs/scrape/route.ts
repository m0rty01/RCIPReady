import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/services/scrapers/ScraperManager';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const community = searchParams.get('community');

    let results;
    if (community) {
      results = await ScraperManager.scrapeCommunity(community);
    } else {
      results = await ScraperManager.scrapeAllCommunities();
    }

    return NextResponse.json({
      message: 'Job scraping completed successfully',
      results,
    });
  } catch (error) {
    console.error('Error during job scraping:', error);
    return NextResponse.json(
      { error: 'Failed to scrape jobs' },
      { status: 500 }
    );
  }
}