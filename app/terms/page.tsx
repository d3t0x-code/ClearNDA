export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-3xl mx-auto px-6 py-24 space-y-6">

        <h1 className="text-3xl font-semibold tracking-tight">
          Terms of Use
        </h1>

        <p className="text-gray-300">
          ClearNDA provides automated, high-level NDA risk assessments for
          informational purposes only.
        </p>

        <p className="text-gray-300">
          The service does not provide legal advice and does not replace review
          by a qualified lawyer.
        </p>

        <p className="text-gray-300">
          By using ClearNDA, you acknowledge that decisions made based on the
          output are your responsibility.
        </p>

        <p className="text-gray-300">
          Paid features unlock additional analysis and report generation but do
          not change the nature of the service.
        </p>

        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Interstice Architecture
        </p>

      </section>
    </main>
  );
}
