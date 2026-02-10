import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  // FINAL intake: send full data
  console.log('LAWYER INTAKE:', body);

  return NextResponse.json({ ok: true });
}
