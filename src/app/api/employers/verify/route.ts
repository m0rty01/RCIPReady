import { NextRequest, NextResponse } from 'next/server';
import { EmployerVerifier } from '@/services/employerVerifier';

export async function POST(request: NextRequest) {
  try {
    const { employerId } = await request.json();

    if (!employerId) {
      return NextResponse.json(
        { error: 'Employer ID is required' },
        { status: 400 }
      );
    }

    const result = await EmployerVerifier.verifyEmployer(employerId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying employer:', error);
    return NextResponse.json(
      { error: 'Failed to verify employer' },
      { status: 500 }
    );
  }
}