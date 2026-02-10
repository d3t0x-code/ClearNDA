import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'aud',
        product_data: { name: 'ClearNDA Review Unlock' },
        unit_amount: 1500
      },
      quantity: 1
    }],
    success_url: 'http://localhost:3000/?paid=true',
    cancel_url: 'http://localhost:3000/'
  });

  return NextResponse.json({ url: session.url });
}
