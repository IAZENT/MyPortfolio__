import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BLOG_POSTS } from "@/lib/content/portfolio";

export default async function BlogPage() {
  const supabase = await createServerSupabaseClient();
  let postsData: any[] = [];
  try {
    const resp = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, tags, severity, reading_time_minutes, status")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100);
    postsData = resp.data ?? [];
    if (process.env.NODE_ENV !== "production") console.log("[blog] fetched posts:", postsData.length);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[blog] fetch error:", e);
  }

  const postsFromDb = (postsData ?? []).map((p: any) => ({
    rep: p.slug?.toUpperCase() ?? p.id,
    title: p.title,
    tags: p.tags ?? [],
    time: p.reading_time_minutes ? `${p.reading_time_minutes} min` : "—",
    slug: p.slug ?? p.id,
    severity: p.severity?.replace(/^(.)/, (m: string) => m.toUpperCase()) ?? "Medium",
  }));

  // merge with hardcoded BLOG_POSTS as fallback (do not remove hardcoded items)
  const seen = new Set(postsFromDb.map((p) => p.slug));
  const hardcoded = BLOG_POSTS.map((b) => ({
    rep: b.rep,
    title: b.title,
    tags: b.tags,
    time: b.time,
    slug: b.slug,
    severity: b.sev,
  })).filter((b) => !seen.has(b.slug));

  const posts = postsFromDb.concat(hardcoded);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// INCIDENT REPORTS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Security insights & learning notes</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((b) => (
            <div key={b.slug} className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--muted)]">{b.rep}</span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">{b.severity}</span>
              </div>

              <h3 className="mt-3 text-base font-semibold">{b.title}</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {b.tags.map((t: string) => (
                  <span key={t} className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-[11px] text-[var(--text)]">{t}</span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Reading time: {b.time}</span>
                <Link href={`/blog/${b.slug}`} className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring" aria-label={`Read ${b.slug}`}>
                  Read <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}