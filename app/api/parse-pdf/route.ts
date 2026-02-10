export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔴 IMPORTANT: dynamic import INSIDE handler
    const pdfParse = (await import('pdf-parse')).default;

    const parsed = await pdfParse(buffer);

    return NextResponse.json({ text: parsed.text });
  } catch (err: any) {
    console.error('PDF parse error:', err);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
