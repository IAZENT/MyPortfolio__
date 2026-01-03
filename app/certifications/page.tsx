import { ArrowRight, Shield } from "lucide-react";
import { CERTIFICATIONS } from "@/lib/content/portfolio";
import Link from "next/link";

export default function CertificationsPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// BATTLE LOGS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Certifications & achievements</h1>

        <div className="mt-8 glass neon overflow-hidden rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 px-2 pb-2">
            <p className="text-sm font-semibold">Featured achievements</p>
            <p className="font-mono text-xs text-[var(--muted)]">scroll →</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CERTIFICATIONS.map((c) => (
              <div
                key={`${c.name}-${c.year}`}
                className="min-w-[260px] rounded-2xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_65%,transparent)] p-4 transition hover:shadow-[0_0_22px_var(--glow)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]">
                    <Shield className="h-5 w-5 text-[var(--accent)]" />
                  </span>
                  <span className="font-mono text-xs text-[var(--muted)]">{c.year}</span>
                </div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{c.org}</p>
                <a
                  href="#"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring"
                  aria-label="Verify (placeholder)"
                >
                  Verify <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring"
            aria-label="View all achievements"
          >
            View All Achievements <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </main>
  );
}