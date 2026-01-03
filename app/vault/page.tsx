import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function VaultPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.26em] text-[var(--muted)]">// THE VAULT</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">For those who can find it...</h1>

        <div className="mt-8 glass neon relative overflow-hidden rounded-2xl p-8">
          <div className="absolute inset-0 bg-[radial-gradient(900px_260px_at_10%_10%,rgba(255,255,255,0.10),transparent_55%)]" />
          <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[0.65fr_1.35fr]">
            <div className="flex justify-center">
              <div className="grid h-24 w-24 place-items-center rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_65%,transparent)] shadow-[0_0_28px_var(--glow)]">
                <Lock className="h-10 w-10 text-[var(--accent)]" />
              </div>
            </div>

            <div>
              <p className="font-mono text-xs tracking-[0.26em] text-[var(--muted)]">ENCRYPTED TEASER</p>
              <p className="mt-3 text-sm text-[var(--muted)]">Hidden throughout this site are clues. Some are obvious. Some are buried in patterns. The vault unlocks only for those who read like analysts.</p>

              <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--border)_75%,transparent)] bg-black/40 p-4">
                <p className="font-mono text-xs text-[var(--success)]">4e 6f 74 20 61 6c 6c 20 73 65 63 72 65 74 73 20 61 72 65 20 68 69 64 64 65 6e 2e</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/vault" className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:shadow-[0_0_22px_var(--glow)] focus-ring" aria-label="Enter the vault">
                  Enter The Vault <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_50%,transparent)] px-4 py-2 text-sm text-[var(--muted)]">Hint: ↑↑↓↓←→←→BA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
