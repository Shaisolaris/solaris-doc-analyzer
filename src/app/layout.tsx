import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solaris AI — Document Analyzer",
  description:
    "Drop a contract, invoice, or research paper and get a clean summary, extracted entities, and key clauses in seconds.",
  openGraph: {
    title: "Solaris AI — Document Analyzer",
    description: "AI-powered document analysis for legal, finance, and research teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
