import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = [
    { rep: "REP-001", sev: "Medium", title: "JWT pitfalls: where analysis often misses", tags: ["JWT", "Auth"], time: "6 min" },
    { rep: "REP-002", sev: "High", title: "OWASP Top 10 in practice: lab notes", tags: ["OWASP", "Web"], time: "8 min" },
    { rep: "REP-003", sev: "Low", title: "Packet Tracer hardening checklist", tags: ["Network", "Labs"], time: "5 min" },
    { rep: "REP-004", sev: "Medium", title: "Forensics timeline reconstruction basics", tags: ["Forensics"], time: "7 min" },
    { rep: "REP-005", sev: "High", title: "Authentication logic flaws: patterns to watch", tags: ["Auth", "Logic"], time: "9 min" },
    { rep: "REP-006", sev: "Medium", title: "Recon workflows: from Nmap to hypotheses", tags: ["Nmap", "Recon"], time: "6 min" },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// INCIDENT REPORTS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Security insights & learning notes</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((b) => (
            <div key={b.rep} className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--muted)]">{b.rep}</span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">{b.sev}</span>
              </div>

              <h3 className="mt-3 text-base font-semibold">{b.title}</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {b.tags.map((t) => (
                  <span key={t} className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-[11px] text-[var(--text)]">{t}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Reading time: {b.time}</span>
                <Link href="/blog" className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring" aria-label={`Read ${b.rep}`}>
                  Read <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/blog" className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring" aria-label="View all reports">
            View All Reports <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </main>
  );
}