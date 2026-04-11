"use client";

import { useEffect, useRef, useState } from "react";

type Entity = {
  kind: "Party" | "Date" | "Amount" | "Location" | "Term";
  value: string;
  confidence: number;
};

type Clause = {
  title: string;
  excerpt: string;
  risk: "low" | "medium" | "high";
};

type Analysis = {
  id: string;
  filename: string;
  uploadedAt: string;
  type: "Contract" | "Invoice" | "Research" | "Lease";
  pageCount: number;
  wordCount: number;
  summary: string;
  entities: Entity[];
  clauses: Clause[];
  keyPoints: string[];
};

const SAMPLES: Analysis[] = [
  {
    id: "a1",
    filename: "MSA_AcmeRobotics_v4.pdf",
    uploadedAt: "2 minutes ago",
    type: "Contract",
    pageCount: 14,
    wordCount: 4820,
    summary:
      "Master Services Agreement between Solaris Inc. and Acme Robotics for a two-year engineering services engagement valued at $480,000, with quarterly billing, mutual NDA, and a 60-day termination clause. Work product IP transfers to Acme on final payment; pre-existing Solaris tooling is retained under a perpetual non-exclusive license.",
    entities: [
      { kind: "Party", value: "Solaris Inc.", confidence: 0.99 },
      { kind: "Party", value: "Acme Robotics LLC", confidence: 0.98 },
      { kind: "Amount", value: "$480,000", confidence: 0.97 },
      { kind: "Date", value: "Effective April 15, 2026", confidence: 0.96 },
      { kind: "Term", value: "24-month engagement", confidence: 0.94 },
      { kind: "Location", value: "Boston, MA", confidence: 0.92 },
    ],
    clauses: [
      {
        title: "Termination for convenience",
        excerpt:
          "Either party may terminate this agreement upon 60 days' written notice without cause, subject to payment of all accrued but unpaid fees.",
        risk: "low",
      },
      {
        title: "IP assignment",
        excerpt:
          "All work product delivered under this agreement shall become the exclusive property of Client upon receipt of final payment, excluding pre-existing Solaris tooling.",
        risk: "medium",
      },
      {
        title: "Liability cap",
        excerpt:
          "Total aggregate liability under this agreement shall not exceed the fees paid in the twelve months preceding the claim.",
        risk: "low",
      },
      {
        title: "Non-solicitation",
        excerpt:
          "Neither party shall solicit for employment any employee of the other party for a period of 18 months following termination.",
        risk: "high",
      },
    ],
    keyPoints: [
      "Quarterly billing at $60,000, net-30 payment terms",
      "Mutual NDA with 3-year survival",
      "Arbitration in Suffolk County, MA under AAA rules",
      "Solaris retains all rights to its pre-existing internal tooling",
    ],
  },
  {
    id: "a2",
    filename: "Q1_Invoice_NorthwindLabs.pdf",
    uploadedAt: "14 minutes ago",
    type: "Invoice",
    pageCount: 2,
    wordCount: 280,
    summary:
      "Q1 2026 invoice from Solaris Inc. to Northwind Labs for $36,750, covering software development services rendered January through March. Payment due within 30 days, 1.5% monthly late fee thereafter. Purchase order #NW-2026-041 referenced.",
    entities: [
      { kind: "Party", value: "Solaris Inc.", confidence: 0.99 },
      { kind: "Party", value: "Northwind Labs", confidence: 0.99 },
      { kind: "Amount", value: "$36,750.00", confidence: 0.99 },
      { kind: "Date", value: "Due May 11, 2026", confidence: 0.98 },
    ],
    clauses: [
      {
        title: "Late fee",
        excerpt: "Invoices unpaid after 30 days accrue interest at 1.5% per month.",
        risk: "low",
      },
    ],
    keyPoints: [
      "Net-30 payment terms",
      "References PO #NW-2026-041",
      "Covers 245 hours of engineering at $150/hr",
    ],
  },
  {
    id: "a3",
    filename: "Office_Lease_BeaconSt.pdf",
    uploadedAt: "Yesterday",
    type: "Lease",
    pageCount: 26,
    wordCount: 9_120,
    summary:
      "Five-year commercial lease for 4,200 sqft at 142 Beacon Street, Boston. Base rent of $14,700/month with 3% annual escalation. Tenant responsible for utilities, 65% of CAM charges, and commercial liability insurance.",
    entities: [
      { kind: "Location", value: "142 Beacon Street, Boston, MA 02116", confidence: 0.99 },
      { kind: "Amount", value: "$14,700 monthly base rent", confidence: 0.98 },
      { kind: "Term", value: "5-year term", confidence: 0.97 },
      { kind: "Date", value: "Commencement May 1, 2026", confidence: 0.96 },
    ],
    clauses: [
      {
        title: "Escalation",
        excerpt: "Base rent shall increase 3% on each annual anniversary of the commencement date.",
        risk: "medium",
      },
      {
        title: "Early termination",
        excerpt:
          "Tenant may terminate after year three with 180 days' notice and payment of a termination fee equal to three months' base rent.",
        risk: "medium",
      },
      {
        title: "CAM charges",
        excerpt:
          "Tenant is responsible for 65% of all common area maintenance charges, reconciled annually.",
        risk: "high",
      },
    ],
    keyPoints: [
      "$176,400 annual base rent, year 1",
      "First month free + $22,000 improvement allowance",
      "Two 5-year renewal options",
      "No sublease without landlord written consent",
    ],
  },
];

export default function DocumentAnalyzer() {
  const [dark, setDark] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>(SAMPLES);
  const [selected, setSelected] = useState<Analysis>(SAMPLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("solaris-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 8;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [analyzing]);

  useEffect(() => {
    if (progress >= 100 && analyzing) {
      setAnalyzing(false);
      setProgress(0);
    }
  }, [progress, analyzing]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("solaris-theme", next ? "dark" : "light");
  };

  const simulateUpload = (filename: string) => {
    setAnalyzing(true);
    setProgress(0);
    setTimeout(() => {
      const newAnalysis: Analysis = {
        ...SAMPLES[0],
        id: `a${Date.now()}`,
        filename: filename || "Uploaded_Document.pdf",
        uploadedAt: "Just now",
      };
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setSelected(newAnalysis);
    }, 1600);
  };

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    simulateUpload(files[0].name);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-600 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
            ✨
          </span>
          <div className="leading-tight">
            <div className="text-base font-semibold">Solaris AI</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Document analyzer
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> GPT-4o
            · Vector store ready
          </span>
          <button
            type="button"
            onClick={toggleDark}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Drop a document. Get answers.
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Contracts, invoices, research papers. Summary + entities + clauses + risks in under 3 seconds.
        </p>
      </section>

      <section className="mb-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition ${
            dragOver
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 bg-white hover:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
          <div className="text-5xl">📄</div>
          <div className="font-semibold">
            Drop a PDF, DOCX, or TXT — or click to browse
          </div>
          <div className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Everything stays in your browser for this demo. In production, files are encrypted at rest and processed in your own VPC.
          </div>
          {!analyzing && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  simulateUpload("Sample_Contract.pdf");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Try with sample contract
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  simulateUpload("Sample_Invoice.pdf");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Try with sample invoice
              </button>
            </div>
          )}
        </div>
        {analyzing && (
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/30 dark:bg-violet-500/10">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-20" />
                  <path d="M22 12a10 10 0 01-10 10" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="font-medium text-violet-900 dark:text-violet-200">
                  Analyzing · extracting entities · scoring clauses
                </span>
              </div>
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                {progress}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-violet-200 dark:bg-violet-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            History
          </div>
          <ul className="flex flex-col gap-1">
            {analyses.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className={`flex w-full flex-col items-start rounded-xl px-3 py-2.5 text-left transition ${
                    selected.id === a.id
                      ? "bg-violet-500/10 text-violet-900 dark:text-violet-200"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="text-xs">📄</span>
                    <span className="flex-1 truncate text-sm font-medium">{a.filename}</span>
                  </div>
                  <div className="mt-1 flex w-full items-center justify-between text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <span>{a.type}</span>
                    <span>{a.uploadedAt}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    {selected.type}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selected.pageCount} pages · {selected.wordCount.toLocaleString()} words
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-semibold">{selected.filename}</h2>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                Analyzed {selected.uploadedAt}
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Summary
              </div>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selected.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Extracted entities
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selected.entities.length} found
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {selected.entities.map((e) => (
                  <li
                    key={e.value}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"
                  >
                    <div>
                      <span className="mr-2 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                        {e.kind}
                      </span>
                      <span className="font-medium">{e.value}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {(e.confidence * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Key points
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {selected.keyPoints.map((k, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Flagged clauses
            </div>
            <ul className="flex flex-col gap-3">
              {selected.clauses.map((c) => (
                <li
                  key={c.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{c.title}</div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        c.risk === "high"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                          : c.risk === "medium"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {c.risk} risk
                    </span>
                  </div>
                  <blockquote className="mt-2 border-l-2 border-violet-500 pl-3 text-sm italic text-slate-600 dark:text-slate-400">
                    &ldquo;{c.excerpt}&rdquo;
                  </blockquote>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-16 text-center text-xs text-slate-400">
        Demo product — analysis is pre-computed on sample documents. © {new Date().getFullYear()} Solaris AI.
      </footer>
    </main>
  );
}
