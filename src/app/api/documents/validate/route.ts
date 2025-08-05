import { NextRequest, NextResponse } from 'next/server';
import { DocumentValidator } from '@/services/documentValidator';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await DocumentValidator.validateDocument(
      buffer,
      documentType,
      file.name
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating document:', error);
    return NextResponse.json(
      { error: 'Failed to validate document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const email = await DocumentValidator.generateImprovementEmail(documentId);
    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error generating improvement email:', error);
    return NextResponse.json(
      { error: 'Failed to generate improvement email' },
      { status: 500 }
    );
  }
}