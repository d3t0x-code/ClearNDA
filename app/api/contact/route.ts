import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactPayload;

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now: simple email via console + provider hook later
    // This keeps production safe and unblockable
    console.log('📩 ClearNDA Contact Form Submission');
    console.log('Name:', body.name);
    console.log('Email:', body.email);
    console.log('Message:', body.message);

    // TODO (later): wire Resend / Postmark / SMTP here
    // await sendEmail({ to: process.env.CONTACT_TO_EMAIL, ... })

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
