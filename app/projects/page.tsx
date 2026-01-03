import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      title: "Secure Enterprise Network Design",
      category: "Network Security",
      desc: "HQ + branch topology with VLANs, routing, redundancy, ACLs, monitoring.",
      tags: ["VLAN", "OSPF", "ACL", "HSRP"],
    },
    {
      title: "Web Application Penetration Testing Report",
      category: "Web Security",
      desc: "Auth & business-logic findings with OWASP-aligned methodology and documentation.",
      tags: ["OWASP", "JWT", "Burp", "Reporting"],
    },
    {
      title: "Digital Forensics Investigation",
      category: "Forensics",
      desc: "Phishing-driven malware chain reconstruction with timeline and evidence handling.",
      tags: ["Artifacts", "Timeline", "Chain of Custody"],
    },
    {
      title: "CTF & Security Labs",
      category: "Offensive Security (Learning)",
      desc: "Enumeration and exploitation practice with writeups and lessons learned.",
      tags: ["CTF", "Enumeration", "Exploitation"],
    },
    {
      title: "Packet Tracer Security Simulations",
      category: "Networking (Academic)",
      desc: "Segmentation, NAT/DHCP/DNS, logging, and hardening scenarios.",
      tags: ["Packet Tracer", "NAT", "Syslog"],
    },
    {
      title: "Secure API Concepts Study",
      category: "Web Security",
      desc: "Analysis of session security, input validation, and token-based protections.",
      tags: ["AuthZ", "Sessions", "Validation"],
    },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// SECURITY COMMAND CENTER</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Mission-critical projects</h1>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div key={p.title} className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_65%,transparent)] overflow-hidden">
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
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.desc}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-[11px] text-[var(--text)]">{t}</span>
                  ))}
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

        <div className="mt-8 flex justify-center">
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring" aria-label="View all projects">
            View All Projects <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </main>
  );
}

