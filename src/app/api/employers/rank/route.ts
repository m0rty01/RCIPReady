import { NextRequest, NextResponse } from 'next/server';
import { EmployerVerifier } from '@/services/employerVerifier';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');

    if (!employerId) {
      return NextResponse.json(
        { error: 'Employer ID is required' },
        { status: 400 }
      );
    }

    const ranking = await EmployerVerifier.rankEmployer(employerId);
    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Error ranking employer:', error);
    return NextResponse.json(
      { error: 'Failed to rank employer' },
      { status: 500 }
    );
  }
}