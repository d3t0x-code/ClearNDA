export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-6 py-24 space-y-6">

        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <p className="text-gray-300">
          ClearNDA is designed to be privacy-first.
        </p>

        <p className="text-gray-300">
          Uploaded documents are processed in-memory only and are never stored,
          logged, or retained after analysis.
        </p>

        <p className="text-gray-300">
          Contact submissions are sent directly to Interstice Architecture via
          email and are not shared with third parties.
        </p>

        <p className="text-gray-300">
          Payments are handled securely by Stripe. ClearNDA does not store
          payment details.
        </p>

        <p className="text-gray-500 text-sm">
          Last updated: {new Date().getFullYear()}
        </p>

      </section>
    </main>
  );
}
