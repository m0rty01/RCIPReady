import { NextRequest, NextResponse } from 'next/server';
import { PRWaitTimePredictor } from '@/services/prWaitTimePredictor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      endorsementDate,
      medicalPassed,
      biometricsDone,
      communityName,
      hasWorkPermit,
    } = body;

    if (!endorsementDate || !communityName) {
      return NextResponse.json(
        { error: 'Endorsement date and community name are required' },
        { status: 400 }
      );
    }

    const prediction = await PRWaitTimePredictor.predictWaitTime({
      endorsementDate: new Date(endorsementDate),
      medicalPassed: medicalPassed ? new Date(medicalPassed) : undefined,
      biometricsDone: biometricsDone ? new Date(biometricsDone) : undefined,
      communityName,
      hasWorkPermit: !!hasWorkPermit,
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error predicting PR wait time:', error);
    return NextResponse.json(
      { error: 'Failed to predict PR wait time' },
      { status: 500 }
    );
  }
}