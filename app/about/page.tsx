import { CheckCircle2, Github, Linkedin, Mail, Shield, Skull } from "lucide-react";

export default async function AboutPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// ABOUT ME</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Securing Systems Through Knowledge, Practice, and Discipline
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <p className="text-[var(--muted)]">
                I am a cybersecurity student with a strong academic and practical foundation in
                network security, web application security, and digital forensics. My focus is on
                understanding how systems fail, how attackers exploit weaknesses, and how secure
                design can prevent real-world incidents.
              </p>
              <p className="mt-4 text-[var(--muted)]">
                Through hands-on labs and coursework, I have worked extensively with enterprise-style
                network architectures, routing protocols, VLAN segmentation, redundancy mechanisms,
                and access control. I enjoy designing secure infrastructures and validating them
                through testing and analysis.
              </p>
              <p className="mt-4 text-[var(--muted)]">
                My interest in cybersecurity extends to penetration testing and web security, where I
                study common vulnerabilities such as authentication flaws, injection attacks,
                business logic issues, and token-based security weaknesses. I approach security from
                both a defensive and analytical perspective.
              </p>
              <p className="mt-4 text-[var(--muted)]">
                I value ethical responsibility, continuous learning, and clear technical
                documentation. My goal is to grow into a skilled security professional who can
                contribute to secure systems, informed decision-making, and resilient digital
                environments.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Cybersecurity & Networking student",
                "Hands-on experience with secure network design",
                "Web application security & OWASP Top 10",
                "Digital forensics and malware investigation (academic)",
                "CTF participation & security labs",
              ].map((h) => (
                <div key={h} className="glass rounded-xl px-4 py-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                    <p className="text-sm text-[var(--text)]">{h}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <a
                className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:neon focus-ring"
                href="https://github.com/IAZENT"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-[var(--muted)]" />
              </a>

              <a
                className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:neon focus-ring"
                href="https://www.linkedin.com/in/rupesh-thakur-aa98702a7/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-[var(--muted)]" />
              </a>

              <a
                className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:neon focus-ring"
                href="mailto:rupeshthakur443@gmail.com"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-[var(--muted)]" />
              </a>

              <a
                className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:neon focus-ring"
                href="https://tryhackme.com/p/Cosmic777"
                target="_blank"
                rel="noreferrer"
                aria-label="TryHackMe"
              >
                <Skull className="h-4 w-4 text-[var(--muted)]" />
              </a>

              <a
                className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:neon focus-ring"
                href="https://app.hackthebox.com/users/1936521"
                target="_blank"
                rel="noreferrer"
                aria-label="Hack The Box"
              >
                <Shield className="h-4 w-4 text-[var(--muted)]" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="glass neon rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
                <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">
                  PROFILE SNAPSHOT
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { k: "Location", v: "Nepal (Remote-friendly)" },
                  { k: "Availability", v: "Open to internships & research" },
                  { k: "Focus", v: "Network Security • Web Security • Forensics" },
                  { k: "Style", v: "Ethical • Lab-driven • Documented" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[var(--muted)]">{row.k}</span>
                    <span className="text-sm text-[var(--text)]">{row.v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[color-mix(in_srgb,var(--border)_75%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_70%,transparent)] p-4">
                <p className="font-mono text-xs text-[var(--success)]">
                  {">"} Designing secure networks, testing assumptions, and learning from incidents.
                </p>
              </div>
            </div>

            <div aria-hidden className="absolute -inset-6 -z-10 blur-3xl">
              <div className="h-60 w-60 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
