"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const reason = params.get("reason");
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
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.replace("/admin");
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
