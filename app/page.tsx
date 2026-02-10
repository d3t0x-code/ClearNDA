'use client';
export const dynamic = 'force-dynamic';


import { useState } from "react";

export default function ClearNDA() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

 const handleFileUpload = (e: React.FormEvent) => {
  e.preventDefault();
  if (!file) return;

  // TEMP: Australian placeholder NDA text until parsing is added
  const sampleNDAText = `
    This Non-Disclosure Agreement is made under the laws of New South Wales, Australia.
    The receiving party agrees to keep all confidential information confidential.
    Confidentiality obligations apply indefinitely unless otherwise agreed.
  `;

  const result = evaluateNDA(sampleNDAText);
  setResult(result);
};

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-5xl mx-auto px-6 py-20">

        {/* HERO */}
        <h1 className="text-4xl font-bold mb-4">ClearNDA</h1>
        <p className="text-xl mb-10">
          Understand your NDA — faster, cheaper, safer.<br />
          <span className="text-gray-600">
            Built for Australian law. Ready for the world.
          </span>
        </p>

        {/* WHY */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-3">Why ClearNDA Exists</h2>
          <p className="text-gray-700">
            NDAs are everywhere — employment, contractors, startups, partnerships.
            Most are standard, often misunderstood, and expensive to review.
            ClearNDA helps you understand what you’re signing before it becomes a problem.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">1. Upload</h3>
            <p className="text-sm text-gray-600">
              Upload a PDF or Word NDA.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">2. Review</h3>
            <p className="text-sm text-gray-600">
              Get clause-level risk analysis using Australian legal norms.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-2">3. Decide</h3>
            <p className="text-sm text-gray-600">
              Proceed, revise, or escalate to a lawyer if needed.
            </p>
          </div>
        </section>

        {/* UPLOAD UI */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">Upload Your NDA</h2>
          <form onSubmit={handleFileUpload}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4"
            />
            <br />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-xl"
            >
              Review NDA
            </button>
          </form>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="bg-white p-6 rounded-2xl shadow mb-20">
            <h2 className="text-2xl font-semibold mb-2">Review Summary</h2>
            <p className="mb-2">
              <strong>Overall Risk:</strong> {result.overallRisk}
            </p>
            <p className="mb-6">{result.summary}</p>

            <h3 className="text-xl font-semibold mb-3">Clause Breakdown</h3>
            <ul className="space-y-4">
              {result.clauses.map((clause: any, idx: number) => (
                <li key={idx} className="border p-4 rounded-xl">
                  <p className="font-semibold">
                    {clause.name} — {clause.risk}
                  </p>
                  <p className="text-sm text-gray-700">
                    {clause.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FOOTER */}
        <footer className="border-t pt-6 text-sm text-gray-500">
          <p>ClearNDA is a product of Interstice Architecture (ABN 42 406 151 083)</p>
          <p>Contact: tim@intersticearchitecture.com</p>
        </footer>

      </section>
    </main>
  );
}
type NDARiskLevel = "LOW" | "MEDIUM" | "HIGH";

type NDAClauseResult = {
  name: string;
  risk: NDARiskLevel;
  explanation: string;
};

type NDAEvaluationResult = {
  overallRisk: NDARiskLevel;
  summary: string;
  clauses: NDAClauseResult[];
};

/**
 * Deterministic NDA risk evaluation (Australia-first).
 * 
 * IMPORTANT:
 * - Not wired into UI yet
 * - No AI
 * - No side effects
 * - Pure function
 */
function evaluateNDA(text: string): NDAEvaluationResult {
  const clauses: NDAClauseResult[] = [];

  const lowerText = text.toLowerCase();

  // Confidential information definition (broad check)
  if (lowerText.includes("confidential information")) {
    clauses.push({
      name: "Confidential Information Definition",
      risk: "MEDIUM",
      explanation:
        "The definition of confidential information appears broad. Broad definitions can create uncertainty about what information is protected."
    });
  }

  // Perpetual or indefinite term
  if (
    lowerText.includes("perpetual") ||
    lowerText.includes("indefinite") ||
    lowerText.includes("in perpetuity")
  ) {
    clauses.push({
      name: "Term & Survival",
      risk: "HIGH",
      explanation:
        "Confidentiality obligations appear to apply indefinitely. In Australia, perpetual confidentiality is uncommon outside of trade secrets."
    });
  }

  // Non-compete / restraint language
  if (
    lowerText.includes("non-compete") ||
    lowerText.includes("non compete") ||
    lowerText.includes("restraint of trade")
  ) {
    clauses.push({
      name: "Restraint / Non-Compete",
      risk: "HIGH",
      explanation:
        "The NDA appears to include restraint-style obligations. Such clauses may be unenforceable in Australia but can still be costly to dispute."
    });
  }

  // Governing law outside Australia
  if (
    lowerText.includes("governed by the laws of") &&
    !lowerText.includes("australia")
  ) {
    clauses.push({
      name: "Governing Law",
      risk: "MEDIUM",
      explanation:
        "The NDA appears to be governed by non-Australian law, which can increase cost and complexity for Australian parties."
    });
  }

  // Overall risk calculation
  let overallRisk: NDARiskLevel = "LOW";

  if (clauses.some((c) => c.risk === "HIGH")) {
    overallRisk = "HIGH";
  } else if (clauses.length >= 2) {
    overallRisk = "MEDIUM";
  }

  return {
    overallRisk,
    summary:
      "This assessment is based on common NDA risk patterns using Australian legal principles. Some clauses may warrant closer review.",
    clauses
  };
}
