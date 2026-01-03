import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = await createServerSupabaseClient();
  let post: any = null;
  try {
    const { data } = await supabase.from("blog_posts").select("*").eq("slug", params.slug).maybeSingle();
    post = data;
    if (process.env.NODE_ENV !== "production") console.log("[blog/slug] fetched post:", !!post);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[blog/slug] fetch error:", e);
  }

  if (!post) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// INCIDENT REPORT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Not Found</h1>
          <p className="mt-4 text-sm text-[var(--muted)]">No post found for <code>{params.slug}</code>.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// INCIDENT REPORT</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>

        <div className="mt-8 glass neon overflow-hidden rounded-2xl p-6">
          <div className="prose max-w-full text-sm text-[var(--text)]">
            {/* Render markdown roughly - basic support */}
            <pre className="whitespace-pre-wrap">{post.content_md ?? post.excerpt ?? ""}</pre>
          </div>

          <div className="mt-6 text-sm text-[var(--muted)]">
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring">
              ← Back to reports
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
