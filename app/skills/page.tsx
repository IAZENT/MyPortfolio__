import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SKILL_GROUPS } from "@/lib/content/portfolio";

export default async function SkillsPage() {
  const supabase = await createServerSupabaseClient();

  let rows: any[] = [];
  try {
    const resp = await supabase
      .from("skills")
      .select("id, name, category, proficiency")
      .order("category", { ascending: true })
      .order("proficiency", { ascending: false })
      .limit(500);
    rows = resp.data ?? [];
    if (process.env.NODE_ENV !== "production") console.log("[skills] fetched rows:", rows.length);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[skills] fetch error:", e);
  }

  const groups = (rows ?? []).reduce((acc: any, r: any) => {
    const cat = r.category || "Other";
    acc[cat] = acc[cat] || [];
    acc[cat].push({ name: r.name, level: r.proficiency ?? 0 });
    return acc;
  }, {} as Record<string, Array<{ name: string; level: number }>>);

  const fetched = Object.keys(groups).map((k) => ({ group: k, items: groups[k] }));

  // merge with hardcoded SKILL_GROUPS so original skills remain visible
  const map = new Map<string, Map<string, { name: string; level: number }>>();
  for (const g of fetched) {
    const inner = new Map<string, { name: string; level: number }>();
    for (const it of g.items) inner.set(it.name, it);
    map.set(g.group, inner);
  }

  for (const hg of SKILL_GROUPS) {
    const existing = map.get(hg.group);
    if (!existing) {
      map.set(hg.group, new Map(hg.items.map((it) => [it.name, it])));
    } else {
      for (const it of hg.items) {
        if (!existing.has(it.name)) existing.set(it.name, it);
      }
    }
  }

  const grouped = Array.from(map.entries()).map(([group, itemsMap]) => ({
    group,
    items: Array.from(itemsMap.values()),
  }));

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// THE ARSENAL</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Tools & technologies I practice with</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {grouped.map((g) => (
            <div key={g.group} className="glass rounded-xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight">{g.group}</h3>
                <span className="font-mono text-xs text-[var(--muted)]">preview</span>
              </div>

              <div className="space-y-3">
                {g.items.map((s) => (
                  <div key={s.name} className="group">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--text)]">{s.name}</span>
                      <span className="font-mono text-xs text-[var(--muted)]">{s.level}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_70%,transparent)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)]"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}


