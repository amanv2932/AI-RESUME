import { NextResponse } from 'next/server';
import React, { type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { ResumePdfDocument } from '@/pdf/ResumePdfDocument';
import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';

export const runtime = 'nodejs';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const snapshot = body.snapshot ?? body;
    if (!isRecord(snapshot)) {
      return NextResponse.json({ error: 'snapshot required' }, { status: 400 });
    }

    const data = snapshot as unknown as ResumeSnapshotPayload;
    if (!isRecord(data.personalInfo)) {
      return NextResponse.json({ error: 'personalInfo required' }, { status: 400 });
    }

    const doc = React.createElement(ResumePdfDocument, { data }) as ReactElement<DocumentProps>;
    const buf = await renderToBuffer(doc);
    const pdfBytes = new Uint8Array(buf);

    const filename =
      typeof data.personalInfo.fullName === 'string' && data.personalInfo.fullName.trim()
        ? `${data.personalInfo.fullName.trim().replace(/\s+/g, '_')}_resume.pdf`
        : 'resume.pdf';

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error('export-pdf', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
