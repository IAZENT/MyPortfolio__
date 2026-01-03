// Minimal helper for fetching content from Payload REST API in Next.js server components
// Usage: const res = await payloadFetch('posts?where[status][equals]=published');

export async function payloadFetch(path: string, opts: RequestInit = {}) {
  const base = process.env.PAYLOAD_SERVER_URL || 'http://localhost:3001';
  const url = `${base}/api/${path}`;
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`Payload fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}
