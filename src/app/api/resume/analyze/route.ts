import { NextRequest, NextResponse } from 'next/server';
import { ResumeAnalyzer } from '@/services/resumeAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const jobId = formData.get('jobId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await ResumeAnalyzer.analyzeResume(buffer);

    if (jobId) {
      const jobMatch = await ResumeAnalyzer.calculateJobMatch(analysis, jobId);
      return NextResponse.json({ analysis, jobMatch });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}