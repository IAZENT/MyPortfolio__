Deterministic PDF extraction plan (no LLM)

- Goal: Extract name, organization, date, credential ID from uploaded PDF certificates.
- Approach:
  1. Add an S3/Cloud function or tiny worker that accepts uploaded PDFs (Payload can send a webhook on upload).
  2. Use a deterministic PDF parsing library (e.g., pdf-parse or pdfjs) to extract raw text.
  3. Use regex-based heuristics to find dates, IDs, and common patterns (e.g., "Issued to", "Credential ID") and return structured metadata.
  4. The worker updates the Certification record via the Payload REST API with extracted fields.

Notes:
- This keeps costs zero and avoids using a 3rd-party LLM.
- I can add an example worker script after we confirm where you'd like to run it (Render / Vercel Serverless / Cloud Run).
