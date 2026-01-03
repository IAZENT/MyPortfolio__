import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Network Security Design (Academic & Lab)",
      points: ["Segmentation (VLANs)", "Routing & redundancy", "ACLs and policy controls", "Monitoring concepts"],
    },
    {
      title: "Web Application Security Testing (Learning)",
      points: ["OWASP-aligned workflow", "Auth/session analysis", "Logic flaw modeling", "Clear reporting"],
    },
    {
      title: "Security Research & Documentation",
      points: ["Writeups & incident notes", "Threat modeling basics", "Evidence-driven reasoning", "Readable diagrams"],
    },
    {
      title: "Cybersecurity Labs & Simulations",
      points: ["Packet Tracer scenarios", "CTF practice", "Forensics exercises", "Post-lab reflections"],
    },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// AREAS OF INTEREST & PRACTICE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">What I focus on</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{s.title}</h3>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[11px] text-[var(--muted)]">focus</span>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <Link href="/services" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring" aria-label="Learn more">
                Learn More <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
