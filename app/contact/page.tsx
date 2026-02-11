'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error();
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold mb-4">Contact</h1>

        <p className="text-gray-400 mb-10">
          Questions, issues, or legal follow-ups related to your NDA review.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-neutral-900 p-8 rounded-2xl border border-neutral-800"
        >
          <div>
            <label className="block text-sm mb-1 text-gray-300">Name</label>
            <input
              name="name"
              required
              className="w-full rounded-lg bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full rounded-lg bg-black border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>

          {status === 'sent' && (
            <p className="text-green-400 text-sm">
              Message sent. We’ll get back to you.
            </p>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
