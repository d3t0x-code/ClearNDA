import React from "react";

export default function ClearNDA() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">ClearNDA</h1>
        <p className="text-xl mb-6">
          Understand your NDA — faster, cheaper, safer.<br />
          <span className="text-gray-600">Built for Australian law. Ready for the world.</span>
        </p>

        <div className="flex gap-4 mb-10">
          <button className="px-6 py-3 bg-black text-white rounded-xl">Review my NDA</button>
          <button className="px-6 py-3 border border-black rounded-xl">Create an NDA</button>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-3">Why ClearNDA Exists</h2>
          <p className="text-gray-700">
            NDAs are everywhere — employment, contractors, startups, partnerships. Most are standard,
            often misunderstood, and expensive to review. ClearNDA helps you understand what you’re
            signing before it becomes a problem.
          </p>
        </section>

        <section className="mb-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">1. Upload or Create</h3>
            <p className="text-sm text-gray-600">Upload a PDF or Word NDA, or generate one in minutes.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">2. Get a Risk Report</h3>
            <p className="text-sm text-gray-600">Clause-by-clause analysis using Australian legal norms.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">3. Decide with Confidence</h3>
            <p className="text-sm text-gray-600">Proceed, request changes, or escalate to a lawyer.</p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-3">Important Notice</h2>
          <p className="text-gray-700 text-sm">
            ClearNDA is not a law firm and does not provide legal advice. It helps you understand and
            prepare NDAs using common Australian legal principles. For higher-risk matters,
            professional legal review is recommended.
          </p>
        </section>

        <footer className="border-t pt-6 text-sm text-gray-500">
          <p>ClearNDA is a product of Interstice Architecture (ABN 42 406 151 083)</p>
          <p>Contact: tim@intersticearchitecture.com</p>
        </footer>
      </section>
    </main>
  );
}
