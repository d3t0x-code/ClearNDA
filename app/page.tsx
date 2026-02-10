'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

const PRICE_AUD = 29;

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
========================= */

function evaluateNDA(text: string): NDAEvaluationResult {
  const clauses: NDAClauseResult[] = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('confidential information')) {
    clauses.push({
      name: 'Confidential Information Definition',
      risk: 'MEDIUM',
      explanation:
        'The definition of confidential information appears broad, which can create uncertainty about what information is protected.'
    });
  }

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

  if (lowerText.includes('executed as a deed')) {
    clauses.push({
      name: 'Executed as a Deed',
      risk: 'MEDIUM',
      explanation:
        'Execution as a deed can extend limitation periods and increase legal exposure under Australian law.'
    });
  }

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
      'This is a high-level automated assessment based on common Australian NDA risk patterns. It highlights potential issues, not legal conclusions.',
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

  if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value || '';
    } catch {
      return '';
    }
  }

  if (file.type === 'application/pdf') {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.text || '';
  }

  return '';
}

/* =========================
   Demo NDA
========================= */

const DEMO_HIGH_RISK_NDA = `
The Receiving Party agrees to keep all Confidential Information confidential
in perpetuity.

This agreement includes a restraint of trade and non-compete obligations.

The Receiving Party acknowledges that injunctive relief may be sought without
proof of loss.

This Agreement is executed as a deed and governed by the laws of New South Wales.
`;

/* =========================
   Page Component
========================= */

export default function ClearNDA() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<NDAEvaluationResult | null>(null);
  const [lastText, setLastText] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('clearnda:lastResult');
    if (saved) setResult(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (result) {
      localStorage.setItem('clearnda:lastResult', JSON.stringify(result));
    }
  }, [result]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === 'true') setHasPaid(true);
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const text = await extractTextFromFile(file);
    setLastText(text);

    if (!text || text.length < 50) {
      setResult({
        overallRisk: 'MEDIUM',
        summary:
          'We could not confidently extract readable text from this document. Please upload a text-based NDA.',
        clauses: []
      });
      return;
    }

    setResult(evaluateNDA(text));
  };

  const runDemo = () => {
    setFile(null);
    setFileName('Demo NDA (High Risk)');
    setLastText(DEMO_HIGH_RISK_NDA);
    setResult(evaluateNDA(DEMO_HIGH_RISK_NDA));
  };

  const rerunAnalysis = () => {
    if (!lastText) return;
    setResult(evaluateNDA(lastText));
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text('ClearNDA – NDA Risk Report', 10, 10);
    doc.text(`Overall Risk: ${result.overallRisk}`, 10, 20);
    result.clauses.forEach((c, i) => {
      doc.text(
        `${c.name} (${c.risk}): ${c.explanation}`,
        10,
        32 + i * 12
      );
    });
    doc.save('clearnda-report.pdf');
  };

  const startCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="max-w-5xl mx-auto px-6 py-20">

        {/* HERO */}
        <h1 className="text-4xl font-bold mb-3 tracking-tight">ClearNDA</h1>
        <p className="text-xl mb-4 max-w-3xl">
          Understand NDA risk before you sign.
        </p>
        <p className="text-gray-600 max-w-3xl mb-8">
          Automated NDA risk review for founders, contractors, consultants and agencies.
          Built for Australian law. Private, fast, and affordable.
        </p>

        <div className="mb-14 text-sm text-gray-500 space-y-1">
          <p>• Australian-focused legal risk patterns</p>
          <p>• Files processed securely in-memory only</p>
          <p>• Documents are never stored</p>
          <p>• Payments secured by Stripe</p>
        </div>

        {/* UPLOAD */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">Upload your NDA</h2>

          <form onSubmit={handleFileUpload} className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setFileName(f ? f.name : null);
              }}
            />

            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800"
              >
                Upload NDA
              </button>

              <button
                type="button"
                onClick={runDemo}
                className="px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Try a sample NDA
              </button>
            </div>

            {fileName && (
              <p className="text-sm text-gray-600">
                Selected file: <strong>{fileName}</strong>
              </p>
            )}

            <div className="pt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700"
              >
                Review NDA
              </button>
            </div>
          </form>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="bg-white p-8 rounded-2xl shadow mb-20">

            <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-xl text-sm">
              Automated preliminary review only. Not legal advice.
            </div>

            <p className="text-lg mb-2">
              <strong>Overall risk:</strong> {result.overallRisk}
            </p>

            <p className="text-gray-700 mb-6">{result.summary}</p>

            <button
              onClick={rerunAnalysis}
              className="mb-8 px-4 py-2 bg-gray-100 rounded-xl text-sm"
            >
              Re-run analysis
            </button>

            {hasPaid && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
                ✅ Full report unlocked. You can download your PDF or escalate to a lawyer.
              </div>
            )}

            {result.clauses.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4">Clause breakdown</h3>
                <ul className="space-y-4">
                  {result.clauses.map((clause, idx) => (
                    <li key={idx} className="border p-4 rounded-xl">
                      <p className="font-semibold mb-1">
                        {clause.name} — {clause.risk}
                      </p>
                      {hasPaid ? (
                        <p className="text-sm text-gray-700">{clause.explanation}</p>
                      ) : (
                        <p className="text-sm text-gray-400 blur-sm select-none">
                          {clause.explanation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-10 flex gap-4 flex-wrap">
              {!hasPaid && (
                <button
                  onClick={startCheckout}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
                >
                  Unlock full report — ${PRICE_AUD} AUD
                </button>
              )}

              {hasPaid && (
                <>
                  <button
                    onClick={downloadPDF}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl"
                  >
                    Download PDF report
                  </button>

                  {result.overallRisk === 'HIGH' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/lawyer-intake', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(result)
                        });
                        alert('Request sent. A lawyer may contact you.');
                      }}
                      className="px-6 py-3 bg-gray-100 rounded-xl"
                    >
                      Escalate to a lawyer
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        <footer className="border-t pt-6 text-sm text-gray-500">
          <p>ClearNDA is a product of Interstice Architecture (ABN 42 406 151 083)</p>
          <p>Privacy-first • No document storage • Australia-focused</p>
        </footer>

      </section>
    </main>
  );
}
