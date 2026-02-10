import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    return NextResponse.json({ text: data.text || '' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
