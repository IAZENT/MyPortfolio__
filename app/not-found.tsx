import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="glass neon rounded-2xl p-8">
          <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// 404</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-[var(--muted)]">We can't find the page you're looking for. It may have been moved or removed.</p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--accent)]" />
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
