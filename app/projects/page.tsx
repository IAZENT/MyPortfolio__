import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PROJECTS } from "@/lib/content/portfolio";
import { ArrowRight, Github } from "lucide-react";

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  let rows: any[] = [];
  try {
    const resp = await supabase
      .from("projects")
      .select("id, title, category, summary")
      .order("updated_at", { ascending: false })
      .limit(100);
    rows = resp.data ?? [];
    if (process.env.NODE_ENV !== "production") console.log("[projects] fetched rows:", rows.length);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[projects] fetch error:", e);
  }

  const projectsFromDb = rows ?? [];
  // merge with hardcoded PROJECTS as fallback
  const seenProj = new Set(projectsFromDb.map((p: any) => p.title));
  const hardcoded = PROJECTS.map((p) => ({
    id: `hc-${p.title.replace(/\s+/g, "-").toLowerCase()}`,
    title: p.title,
    category: p.category,
    summary: p.desc,
  })).filter((p) => !seenProj.has(p.title));

  const projects = projectsFromDb.concat(hardcoded);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// SECURITY COMMAND CENTER</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Mission-critical projects</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p: any) => (
            <div key={p.id} className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_65%,transparent)] overflow-hidden">
              <div className="relative h-40 w-full">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,color-mix(in_srgb,var(--accent)_25%,transparent),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(800px_260px_at_10%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
                <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg1)_60%,transparent)]" />
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">{p.category}</span>
                  <span className="font-mono text-[11px] text-[var(--muted)]">SEC-SCORE</span>
                </div>

                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.summary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {/* tags unknown */}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring" aria-label={`View details for ${p.title} (placeholder)`}>
                    View Details <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                    <Github className="h-4 w-4" />
                    <span>—</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

