import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ ESM-safe + TypeScript-safe import
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as any);

    const parsed = await pdfParse(buffer);

    return NextResponse.json({ text: parsed.text });
  } catch (err) {
    console.error('PDF parse error:', err);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
