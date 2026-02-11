'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ContactPage() {
  const params = useSearchParams();
  const success = params.get('success') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = '/contact?success=true';
    } else {
      setError(data.error || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-6 py-24">

        <h1 className="text-3xl font-semibold mb-6 tracking-tight">
          Contact
        </h1>

        {success && (
          <div className="mb-8 p-4 rounded-xl bg-green-900/30 text-green-200">
            Thanks — your message has been sent.
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

      </section>
    </main>
  );
}
