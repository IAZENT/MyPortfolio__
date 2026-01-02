"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type FormState = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      setReason(p.get("reason"));
    } catch (e) {
      setReason(null);
    }
  }, []);

  const message = useMemo(() => {
    if (reason === "forbidden") return "You do not have access. Contact the site owner to be granted a role.";
    return null;
  }, [reason]);
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Ensure server-side pages can access session via cookies
      // Set supabase auth cookies (access & refresh tokens)
      try {
        const session = data?.session;
        if (session?.access_token && session?.refresh_token) {
          // prefer server-side HttpOnly cookie sync
          try {
            await fetch("/api/auth/sync", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            });
          } catch (e) {
            // fallback to client cookies if network call fails
            try {
              if (session.access_token) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; samesite=Lax`;
              }
              if (session.refresh_token) {
                document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; samesite=Lax`;
              }
            } catch {}
          }
        }
      } catch (e) {
        // ignore cookie write failures
      }

      // allow the cookie to be written and confirm server sees the session
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      let serverOk = false;

      for (let i = 0; i < 6; i++) {
        try {
          const res = await fetch("/api/auth/me");
          const json = await res.json().catch(() => null);
          if (json?.ok && json?.user) {
            serverOk = true;
            break;
          }
        } catch (e) {
          // ignore
        }
        await wait(150);
      }

      if (!serverOk) {
        setErrorMsg("Could not persist login — server did not recognize the session.");
        return;
      }

      router.replace("/rt-admin-cosmic");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-md">
        <div className="glass neon rounded-2xl p-6">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">ADMIN ACCESS</p>
          <h1 className="mt-3 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use your Supabase Auth email/password. Access requires role <span className="text-[var(--accent)]">admin</span>{" "}
            or <span className="text-[var(--accent)]">editor</span>.
          </p>

          {message && (
            <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] p-3 text-sm text-[var(--text)]">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs text-[var(--muted)]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-ring"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--muted)]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-ring"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neon inline-flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition disabled:opacity-60 focus-ring"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-xs text-[var(--muted)]">
              Note: password reset UI will come in Step 3 (admin panel).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
