'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

/* =========================
   Types
========================= */

type NDARiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

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

/* =========================
   Deterministic NDA Engine
   (Australia-first)
========================= */

function evaluateNDA(text: string): NDAEvaluationResult {
  const clauses: NDAClauseResult[] = [];
  const lowerText = text.toLowerCase();

  // Confidential information definition
  if (lowerText.includes('confidential information')) {
    clauses.push({
      name: 'Confidential Information Definition',
      risk: 'MEDIUM',
      explanation:
        'The definition of confidential information appears broad, which can create uncertainty about what information is protected.'
    });
  }

  // Indefinite / perpetual obligations
  if (
    lowerText.includes('indefinite') ||
    lowerText.includes('perpetual') ||
    lowerText.includes('in perpetuity')
  ) {
    clauses.push({
      name: 'Term & Survival',
      risk: 'HIGH',
      explanation:
        'Confidentiality obligations appear to apply indefinitely. In Australia, perpetual confidentiality is uncommon outside of trade secrets.'
    });
  }

  // Restraint / non-compete
  if (
    lowerText.includes('restraint of trade') ||
    lowerText.includes('non-compete') ||
    lowerText.includes('non compete')
  ) {
    clauses.push({
      name: 'Restraint / Non-Compete',
      risk: 'HIGH',
      explanation:
        'The agreement appears to include restraint-style obligations, which may be unenforceable in Australia but still costly to dispute.'
    });
  }

  // Governing law (Australia)
  if (
    lowerText.includes('laws of australia') ||
    lowerText.includes('laws of new south wales')
  ) {
    clauses.push({
      name: 'Governing Law (Australia)',
      risk: 'LOW',
      explanation:
        'The agreement is governed by Australian law, which is appropriate for Australian parties.'
    });
  }

  // Executed as a deed
  if (lowerText.includes('executed as a deed')) {
    clauses.push({
      name: 'Executed as a Deed',
      risk: 'MEDIUM',
      explanation:
        'Execution as a deed can extend limitation periods and increase legal exposure under Australian law.'
    });
  }

  // Injunctive relief
  if (lowerText.includes('injunctive relief')) {
    clauses.push({
      name: 'Injunctive Relief',
      risk: 'MEDIUM',
      explanation:
        'The agreement allows injunctive relief, enabling urgent court action without proving loss.'
    });
  }

  let overallRisk: NDARiskLevel = 'LOW';
  if (clauses.some(c => c.risk === 'HIGH')) overallRisk = 'HIGH';
  else if (clauses.length >= 2) overallRisk = 'MEDIUM';

  return {
    overallRisk,
    summary:
      'This assessment is a high-level, automated review based on common Australian NDA risk patterns.',
    clauses
  };
}

/* =========================
   File Text Extraction
========================= */

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return await file.text();
  }

  if (file.type === 'application/pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  }

  return '';
}

/* =========================
   Page Component
========================= */

export default function ClearNDA() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<NDAEvaluationResult | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const text = await extractTextFromFile(file);

    if (!text || text.length < 50) {
      setResult({
        overallRisk: 'MEDIUM',
        summary:
          'We could not confidently extract readable text from this document. Please upload a text-based PDF or Word document.',
        clauses: []
      });
      return;
    }

    const evaluation = evaluateNDA(text);
    setResult(evaluation);
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
            NDAs are common, often misunderstood, and frequently overpaid for.
            ClearNDA helps Australians understand key risks before signing.
          </p>
        </section>

        {/* UPLOAD */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">Upload Your NDA</h2>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <input
              id="nda-upload"
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setFileName(f ? f.name : null);
              }}
            />

            <label
              htmlFor="nda-upload"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl cursor-pointer hover:bg-gray-800"
            >
              Upload NDA
            </label>

            {fileName && (
              <p className="text-sm text-gray-600">
                Selected file: <strong>{fileName}</strong>
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Review NDA
            </button>
          </form>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="bg-white p-6 rounded-2xl shadow mb-20">

            {/* PRELIMINARY NOTICE */}
            <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-xl text-sm text-yellow-800">
              <strong>Preliminary Review Notice:</strong> This is an automated,
              high-level assessment based on common Australian NDA patterns.
              It is not legal advice.
            </div>

            <h2 className="text-2xl font-semibold mb-2">Review Summary</h2>
            <p className="mb-2">
              <strong>Overall Risk:</strong> {result.overallRisk}
            </p>
            <p className="mb-6">{result.summary}</p>

            <h3 className="text-xl font-semibold mb-3">Clause Breakdown</h3>
            <ul className="space-y-4">
              {result.clauses.map((clause, idx) => (
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
