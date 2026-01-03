import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SkillsPage() {
  const skills = [
    {
      group: "Security Tools",
      items: [
        { name: "Wireshark", level: 90 },
        { name: "Nmap", level: 88 },
        { name: "Burp Suite (Lab)", level: 82 },
      ],
    },
    {
      group: "Networking & Infrastructure",
      items: [
        { name: "VLANs & Inter-VLAN Routing", level: 88 },
        { name: "OSPF / EIGRP (Academic)", level: 84 },
        { name: "ACLs & NAT", level: 86 },
      ],
    },
    {
      group: "Web & App Security",
      items: [
        { name: "OWASP Top 10", level: 86 },
        { name: "AuthN/AuthZ", level: 84 },
        { name: "JWT Security (Analysis)", level: 80 },
      ],
    },
    {
      group: "Digital Forensics",
      items: [
        { name: "Timeline Reconstruction", level: 82 },
        { name: "Artifact & Log Analysis", level: 84 },
        { name: "Phishing Attack Analysis", level: 80 },
      ],
    },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// THE ARSENAL</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Tools & technologies I practice with
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {skills.map((g) => (
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

        <div className="mt-8 flex justify-center">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_60%,transparent)] px-4 py-2 text-sm text-[var(--text)] transition hover:shadow-[0_0_20px_var(--glow)] focus-ring"
            aria-label="View full skills"
          >
            View Full Arsenal <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </main>
  );
}


