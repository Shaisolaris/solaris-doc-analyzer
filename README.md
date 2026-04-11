# Solaris AI — Document Analyzer

AI-powered document analysis for legal, finance, and research teams. Drop a contract, invoice, or research paper and get a clean summary, extracted entities, flagged clauses, and key points in under three seconds.

**Live demo:** https://shaisolaris.github.io/solaris-doc-analyzer/

## What it shows

- **Drag-and-drop file upload** with click-to-browse fallback
- **Simulated analysis progress** — animated progress bar with realistic timing
- **Sample documents** — one click to analyze a contract or invoice
- **Analysis view** with 4 sections:
  - Summary paragraph
  - Extracted entities (Party / Date / Amount / Location / Term) with confidence scores
  - Key points bullet list
  - Flagged clauses with risk ratings (low / medium / high) and quoted excerpts
- **History sidebar** — all previous analyses, click to switch
- **Dark mode** with localStorage persistence
- **Mock model indicator** — shows "GPT-4o · Vector store ready" chip
- Fully responsive

## How the real version would work

Replace the `SAMPLES` array with a real pipeline:

1. Client uploads file → signed S3 upload URL
2. Serverless function pulls from S3, extracts text (Textract for scanned docs, pdf-parse for native PDFs)
3. Chunks sent to a vector store (Pinecone / pgvector) for retrieval
4. Analysis prompts run against GPT-4o or Claude with structured output (JSON schema)
5. Result written back to the DB, streamed to the client via SSE

The UI above is the same whether it's talking to a mock array or a real pipeline — just swap the data source.

## Stack

- Next.js 15 (App Router, static export)
- React 19 + TypeScript
- Tailwind CSS 3
- Deployed to GitHub Pages

## Run locally

```bash
npm install
npm run dev
```

## License

MIT.
