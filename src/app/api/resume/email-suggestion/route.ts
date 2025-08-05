import { NextRequest, NextResponse } from 'next/server';
import { ResumeAnalyzer } from '@/services/resumeAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, jobMatch, jobId } = await request.json();

    if (!resumeAnalysis || !jobMatch || !jobId) {
      return NextResponse.json(
        { error: 'Resume analysis, job match, and job ID are required' },
        { status: 400 }
      );
    }

    const emailSuggestion = await ResumeAnalyzer.generateOutreachEmail(
      resumeAnalysis,
      jobMatch,
      jobId
    );

    return NextResponse.json(emailSuggestion);
  } catch (error) {
    console.error('Error generating email suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate email suggestion' },
      { status: 500 }
    );
  }
}