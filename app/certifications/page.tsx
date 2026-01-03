import { ArrowRight, Shield } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CERTIFICATIONS } from "@/lib/content/portfolio";

export default async function CertificationsPage() {
  const supabase = await createServerSupabaseClient();
  let rows: any[] = [];
  try {
    const resp = await supabase
      .from("certifications")
      .select("id, name, issuing_org as org, obtained_at as year")
      .order("obtained_at", { ascending: false })
      .limit(100);
    rows = resp.data ?? [];
    if (process.env.NODE_ENV !== "production") console.log("[certifications] fetched rows:", rows.length);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[certifications] fetch error:", e);
  }

  // merge fetched rows with hardcoded CERTIFICATIONS so originals remain visible
  const seen = new Set(rows.map((r: any) => r.name));
  const hardcoded = CERTIFICATIONS.filter((c) => !seen.has(c.name)).map((c) => ({
    id: `hc-${c.name.replace(/\s+/g, "-").toLowerCase()}`,
    name: c.name,
    org: c.org,
    year: c.year,
  }));

  const all = rows.concat(hardcoded);

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
            {all.map((c: any) => (
              <div
                key={c.id}
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

      </div>
    </main>
  );
}