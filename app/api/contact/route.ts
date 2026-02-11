import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

/* =========================
   Simple in-memory rate limit
========================= */

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

const ipStore = new Map<string, { count: number; firstRequest: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry) {
    ipStore.set(ip, { count: 1, firstRequest: now });
    return false;
  }

  if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
    ipStore.set(ip, { count: 1, firstRequest: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/* =========================
   Handler
========================= */

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'ClearNDA <no-reply@intersticearchitecture.com>',
      to: process.env.CONTACT_TO_EMAIL!,
      replyTo: email,
      subject: `ClearNDA contact — ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `.trim()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    );
  }
}
