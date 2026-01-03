import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ServiceDef = { title: string; bullets: string[]; intro?: string };

const FALLBACK_SERVICES: ServiceDef[] = [
  {
    title: "Network Security Design (Academic & Lab)",
    intro:
      "Focus on designing segmented, resilient networks suitable for labs and academic projects. Emphasis on clarity, repeatability, and measurable controls.",
    bullets: [
      "Segmentation (VLANs)",
      "Routing & redundancy",
      "ACLs and policy controls",
      "Monitoring concepts",
    ],
  },
  {
    title: "Web Application Security Testing (Learning)",
    intro:
      "Hands-on web testing with an OWASP-aligned workflow. Emphasis on reproducing issues, measuring impact, and suggesting clear mitigations.",
    bullets: ["OWASP-aligned workflow", "Auth/session analysis", "Logic flaw modeling", "Clear reporting"],
  },
  {
    title: "Security Research & Documentation",
    intro:
      "Creating readable, evidence-driven writeups and basic threat models to communicate findings and next steps effectively.",
    bullets: ["Writeups & incident notes", "Threat modeling basics", "Evidence-driven reasoning", "Readable diagrams"],
  },
  {
    title: "Cybersecurity Labs & Simulations",
    intro:
      "Practical lab exercises and CTF-style scenarios for applied learning, with post-lab reflections to capture lessons learned.",
    bullets: ["Packet Tracer scenarios", "CTF practice", "Forensics exercises", "Post-lab reflections"],
  },
];

export default async function ServicesPage() {
  // try fetching from Supabase, but fall back to hardcoded services
  let rows: ServiceDef[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const resp = await supabase
      .from("services")
      .select("id, name, description_md, bullets")
      .order("sort_order", { ascending: true })
      .limit(200);

    const data = resp.data ?? [];
    rows = (
      data.map((s: any) => ({ title: s.name || "Untitled", intro: s.description_md || "", bullets: s.bullets || [] })) as ServiceDef[]
    ).filter(Boolean);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.log("[services] fetch error:", e);
  }

  if (!rows || rows.length === 0) rows = FALLBACK_SERVICES;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.28em] text-[var(--muted)]">// AREAS OF INTEREST & PRACTICE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">What I focus on</h1>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {rows.map((s, i) => (
            <div key={i} className="rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">{s.title}</h3>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[11px] text-[var(--muted)]">focus</span>
              </div>

              {s.intro && <p className="text-sm text-[var(--muted)]">{s.intro}</p>}

              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {(s.bullets || []).map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
