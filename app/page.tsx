"use client";

// ... existing code ...
import Image from "next/image";
import Link from "next/link";
import SectionCTA from "./components/SectionCTA";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  Download,
  Github,
  Linkedin,
  Lock,
  Mail,
  Moon,
  Shield,
  Skull,
  Sun,
  Terminal,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SKILL_GROUPS, BLOG_POSTS, PROJECTS as HC_PROJECTS, CERTIFICATIONS as HC_CERTIFICATIONS, SERVICES as HC_SERVICES } from "@/lib/content/portfolio";

type ThemeId = "red" | "matrix" | "purple" | "blue" | "amber";

type SectionDef = {
  id:
    | "home"
    | "about"
    | "skills"
    | "projects"
    | "certifications"
    | "blog"
    | "services"
    | "testimonials"
    | "contact";
  label: string;
};

const SECTIONS: SectionDef[] = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "certifications", label: "Certifications" },
  { id: "services", label: "Areas of Interest" },

  { id: "contact", label: "Contact" },
];

const THEMES: { id: ThemeId; label: string; className: string; icon: React.ReactNode }[] = [
  { id: "red", label: "Cyberpunk Red", className: "", icon: <Moon className="h-4 w-4" /> },
  { id: "matrix", label: "Matrix Green", className: "theme-matrix", icon: <Terminal className="h-4 w-4" /> },
  { id: "purple", label: "Cyberpunk Purple", className: "theme-purple", icon: <Moon className="h-4 w-4" /> },
  { id: "blue", label: "Professional Blue", className: "theme-blue", icon: <Moon className="h-4 w-4" /> },
  { id: "amber", label: "Amber Ops", className: "theme-amber", icon: <Sun className="h-4 w-4" /> },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function useTheme(): { theme: ThemeId; cycle: () => void; posts: Array<{ rep: string; sev: string; title: string; tags: string[]; time: string; slug: string }>; } {
  const [theme, setTheme] = useState<ThemeId>("red");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as ThemeId | null;
    if (stored && THEMES.some((t) => t.id === stored)) setTheme(stored);
  }, []);

  const [posts, setPosts] = useState<
    Array<{ rep: string; sev: string; title: string; tags: string[]; time: string; slug: string }>
  >(() => []);

  // fetch a few recent published posts for the home teaser
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let mounted = true;

    (async () => {
      try {
        const resp = await supabase
          .from("blog_posts")
          .select(
            "id, slug, title, excerpt, tags, severity, reading_time_minutes, status, published_at"
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(6);

        const rows = resp.data ?? [];
        if (!mounted) return;

        const mapped = (rows ?? []).map((p: any) => ({
          rep: (p.slug ?? p.id).toString().toUpperCase(),
          title: p.title ?? "Untitled",
          tags: p.tags ?? [],
          time: p.reading_time_minutes ? `${p.reading_time_minutes} min` : "—",
          slug: p.slug ?? p.id,
          sev: p.severity ? p.severity.replace(/^(.)/, (m: string) => m.toUpperCase()) : "Medium",
        }));

        // merge with hardcoded BLOG_POSTS as fallback (do not remove them)
        const seen = new Set(mapped.map((m) => m.slug));
        const hardcoded = BLOG_POSTS.map((b) => ({
          rep: b.rep,
          sev: b.sev,
          title: b.title,
          tags: b.tags,
          time: b.time,
          slug: b.slug,
        })).filter((b) => !seen.has(b.slug));

        const all = mapped.concat(hardcoded);

        setPosts(all);
        if (process.env.NODE_ENV !== "production") console.log("[home] fetched posts:", all.length);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.log("[home] posts fetch error:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("theme-matrix", "theme-purple", "theme-blue", "theme-amber");
    const match = THEMES.find((t) => t.id === theme);
    if (match?.className) html.classList.add(match.className);
    window.localStorage.setItem("theme", theme);

    // color-scheme hint (all themes are dark now)
    html.style.colorScheme = "dark";
  }, [theme]);

  const cycle = () => {
    setTheme((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      return THEMES[(idx + 1) % THEMES.length].id;
    });
  };

  return { theme, cycle, posts };
}

function useActiveSection(): { active: SectionDef["id"]; setActive: (id: SectionDef["id"]) => void } {
  const [active, setActive] = useState<SectionDef["id"]>("home");

  // Sync initial state with URL hash (and keep in sync on back/forward + manual hash changes)
  useEffect(() => {
    const syncFromHash = () => {
      const raw = (window.location.hash || "").replace("#", "");
      const match = SECTIONS.find((s) => s.id === raw)?.id;
      if (match) setActive(match);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );

    // Track entries so we can pick the section closest to the top (prevents "wrong underline" when multiple intersect)
    const latest = new Map<SectionDef["id"], IntersectionObserverEntry>();

    const pickBest = () => {
      const navOffset = 96; // approximate fixed header + spacing
      const candidates = Array.from(latest.entries())
        .filter(([, e]) => e.isIntersecting)
        .map(([id, e]) => {
          const top = e.boundingClientRect.top;
          const dist = Math.abs(top - navOffset);
          const ratio = e.intersectionRatio ?? 0;
          return { id, dist, ratio };
        });

      if (candidates.length === 0) return;

      // Prefer closest-to-top; break ties by higher intersection ratio
      candidates.sort((a, b) => a.dist - b.dist || b.ratio - a.ratio);
      setActive(candidates[0]!.id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id as SectionDef["id"];
          if (SECTIONS.some((s) => s.id === id)) {
            latest.set(id, e);
          }
        }
        pickBest();
      },
      {
        root: null,
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65],
        // This makes "current section" more stable around the top of the viewport
        rootMargin: "-15% 0px -65% 0px",
      }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return { active, setActive };
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  // keep URL in sync (fixes "page switching" feel + allows sharing anchors)
  if (typeof window !== "undefined") {
    window.history.pushState(null, "", `#${id}`);
  }

  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function RevealSection({
  id,
  children,
  className,
  title,
  subtitle,
}: {
  id: SectionDef["id"];
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.22, once: true });
  const reduce = useReducedMotion();

  return (
    <motion.section
      id={id}
      ref={(node) => {
        ref.current = node;
      }}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {(title || subtitle) && (
        <div className="mx-auto mb-8 max-w-6xl px-4 sm:px-6">
          {title && (
            <div className="mb-2 flex items-center gap-3">
              <div className="h-px w-10 bg-[var(--accent)]" />
              <p
                className="font-mono text-xs tracking-[0.28em] text-[color:color-mix(in_srgb,var(--accent)_70%,var(--muted))]"
              >
                {title}
              </p>
            </div>
          )}
          {subtitle && (
            <h2
              className={[
                "text-balance text-2xl font-semibold tracking-tight sm:text-4xl",
                "bg-[linear-gradient(90deg,var(--text),color-mix(in_srgb,var(--accent)_55%,var(--text)))] bg-clip-text text-transparent",
              ].join(" ")}
            >
              {subtitle}
            </h2>
          )}
        </div>
      )}

      {children}
    </motion.section>
  );
}

function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const fontSize = 16;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth * dpr);
      h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const count = clamp(Math.floor((window.innerWidth * window.innerHeight) / 42000), 22, 90);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22 * dpr,
        vy: (Math.random() - 0.5) * 0.22 * dpr,
        r: (Math.random() * 1.8 + 0.9) * dpr,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const step = () => {
      raf = requestAnimationFrame(step);

      // background fade
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);

      // particles + connections (matrix rain removed)
      const accent =
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ef4444";
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = accent;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 * dpr) {
            ctx.globalAlpha = (1 - dist / (150 * dpr)) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_20%,rgba(255,255,255,0.06),transparent_55%)]" />
    </div>
  );
}

function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const ringX = useSpring(x, { stiffness: 420, damping: 38, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 420, damping: 38, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(pointer:fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      {/* ring */}
      <motion.div
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        className="absolute h-9 w-9 rounded-full border border-[color-mix(in_srgb,var(--accent)_65%,transparent)] shadow-[0_0_24px_var(--glow)]"
      />
      {/* dot */}
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        className="absolute h-2 w-2 rounded-[2px] bg-[var(--accent)] shadow-[0_0_18px_var(--glow)]"
      />
      {/* square */}
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%", rotate: 45 }}
        className="absolute h-5 w-5 border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] opacity-80"
      />
    </div>
  );
}

function GlitchName({ name }: { name: string }) {
  const reduce = useReducedMotion();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 160);
    }, 3000);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative">
      <h1
        className={[
          "text-balance text-center text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl",
          "text-[var(--accent)] drop-shadow-[0_0_24px_var(--glow)]",
        ].join(" ")}
      >
        {name}
      </h1>

      {/* RGB split overlay */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 select-none text-center text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl",
          glitch ? "opacity-100" : "opacity-0",
          "transition-opacity duration-150",
        ].join(" ")}
      >
        <div className="relative">
          <div className="absolute inset-0 translate-x-[2px] -translate-y-[1px] text-white/70">
            {name}
          </div>
          <div className="absolute inset-0 -translate-x-[3px] translate-y-[2px] text-[var(--accent2)]/70">
            {name}
          </div>
        </div>
      </div>
    </div>
  );
}

function useTypewriter(phrases: string[]) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) {
      setText(phrases[0] ?? "");
      return;
    }

    const current = phrases[idx] ?? "";
    const speed = deleting ? 24 : 34;
    const pause = deleting ? 520 : 980;

    const t = window.setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) window.setTimeout(() => setDeleting(true), pause);
      } else {
        const next = current.slice(0, Math.max(0, text.length - 1));
        setText(next);
        if (next.length === 0) {
          setDeleting(false);
          setIdx((p) => (p + 1) % phrases.length);
        }
      }
    }, speed);

    return () => window.clearTimeout(t);
  }, [phrases, idx, text, deleting, reduce]);

  return text;
}

function StatCard({ label, value }: { label: string; value: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }

    const start = performance.now();
    const duration = 900;

    let raf = 0;
    const tick = (now: number) => {
      const p = clamp((now - start) / duration, 0, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [reduce, value]);

  return (
    <div className="glass neon rounded-2xl px-4 py-4 text-center">
      <div className="text-2xl font-semibold tabular-nums sm:text-3xl">
        {n}
        <span className="text-[var(--muted)]">+</span>
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 8;
      const ry = (x - 0.5) * 10;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    };
    const onLeave = () => {
      el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      className={[
        "glass rounded-2xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] transition-transform duration-200 will-change-transform",
        "hover:neon",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { theme, cycle, posts } = useTheme();
  const { active, setActive } = useActiveSection();
  const reduce = useReducedMotion();

  const roles = useMemo(
    () => [
      "Cybersecurity Student",
      "Network & Web Security Enthusiast",
      "Penetration Testing Learner",
      "Digital Forensics Analyst (Academic)",
      "CTF Participant",
    ],
    []
  );
  const typed = useTypewriter(roles);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.6 });

  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const currentThemeLabel = THEMES.find((t) => t.id === theme)?.label ?? "Theme";

  const [skills, setSkills] = useState<Array<{ group: string; items: Array<{ name: string; level: number }> }>>(
    () => []
  );

  // home preview: projects, certs, services (limited)
  const [homeProjects, setHomeProjects] = useState<any[]>(() => []);
  const [homeCerts, setHomeCerts] = useState<any[]>(() => []);
  const [homeServices, setHomeServices] = useState<any[]>(() => []);


  // fetch top skills from Supabase (client-side) so the home page shows editable data
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    let mounted = true;
    (async () => {
      try {
        const resp = await supabase
          .from("skills")
          .select("id, name, category, proficiency")
          .order("category", { ascending: true })
          .order("proficiency", { ascending: false })
          .limit(50);

        const rows = resp.data ?? [];
        if (!mounted) return;

        const groups = (rows ?? []).reduce((acc: any, r: any) => {
          const cat = r.category || "Other";
          acc[cat] = acc[cat] || [];
          acc[cat].push({ name: r.name, level: r.proficiency ?? 0 });
          return acc;
        }, {} as Record<string, Array<{ name: string; level: number }>>);

        const grouped = Object.keys(groups).map((k) => ({ group: k, items: groups[k] }));

        // merge with hardcoded SKILL_GROUPS (keep fetched first, then append unique hardcoded items)
        const map = new Map<string, Map<string, { name: string; level: number }>>();
        for (const g of grouped) {
          const inner = new Map<string, { name: string; level: number }>();
          for (const it of g.items) inner.set(it.name, it);
          map.set(g.group, inner);
        }

        for (const hg of SKILL_GROUPS) {
          const existing = map.get(hg.group);
          if (!existing) {
            map.set(hg.group, new Map(hg.items.map((it) => [it.name, it])));
          } else {
            for (const it of hg.items) {
              if (!existing.has(it.name)) existing.set(it.name, it);
            }
          }
        }

        const mergedGroups = Array.from(map.entries()).map(([group, itemsMap]) => ({
          group,
          items: Array.from(itemsMap.values()),
        }));

        setSkills(mergedGroups);
        if (process.env.NODE_ENV !== "production") console.log("[home] fetched skills:", rows.length);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.log("[home] skills fetch error:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // fetch limited projects, certs and services for home preview (respect home flags & priority)
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let mounted = true;

    (async () => {
      try {
        // projects: prefer show_on_home + home_priority, then fill with recent
        const pResp = await supabase
          .from("projects")
          .select("id, title, category, summary, tags")
          .eq("show_on_home", true)
          .order("home_priority", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(6);

        let projectsFromDb = (pResp.data ?? []) as any[];

        if (projectsFromDb.length < 6) {
          const remaining = 6 - projectsFromDb.length;
          const excludeIds = projectsFromDb.map((p) => `'${p.id}'`).join(",");

          let q = supabase.from("projects").select("id, title, category, summary, tags").order("updated_at", { ascending: false }).limit(remaining);
          if (excludeIds) q = q.not("id", "in", `(${excludeIds})`);
          const more = await q;
          projectsFromDb = projectsFromDb.concat(more.data ?? []);
        }

        // certifications: prefer show_on_home + home_priority, then fill with prestige/obtained
        const cResp = await supabase
          .from("certifications")
          .select("id, name, issuing_org as org, obtained_at as year")
          .eq("show_on_home", true)
          .order("home_priority", { ascending: false })
          .order("obtained_at", { ascending: false })
          .limit(6);
        let certsFromDb = (cResp.data ?? []) as any[];
        if (certsFromDb.length < 6) {
          const remaining = 6 - certsFromDb.length;
          const excludeIds = certsFromDb.map((c) => `'${c.id}'`).join(",");
          let q2 = supabase.from("certifications").select("id, name, issuing_org as org, obtained_at as year").order("prestige", { ascending: false }).limit(remaining);
          if (excludeIds) q2 = q2.not("id", "in", `(${excludeIds})`);
          const more2 = await q2;
          certsFromDb = certsFromDb.concat(more2.data ?? []);
        }

        // services: use existing sort_order / show_on_home
        const sResp = await supabase
          .from("services")
          .select("id, name, bullets, icon, show_on_home")
          .order("sort_order", { ascending: true })
          .limit(6);
        const servicesFromDb = (sResp.data ?? []) as any[];

        if (!mounted) return;

        // merge with hardcoded PROJECTS / CERTIFICATIONS / SERVICES as fallback
        const seenProj = new Set(projectsFromDb.map((p) => p.title));
        const hardProjects = HC_PROJECTS.map((p) => ({
          id: `hc-${p.title.replace(/\s+/g, "-").toLowerCase()}`,
          title: p.title,
          category: p.category,
          summary: p.desc,
          tags: p.tags,
        })).filter((p) => !seenProj.has(p.title));

        const projectsAll = projectsFromDb.concat(hardProjects).slice(0, 6);

        const seenCert = new Set(certsFromDb.map((c) => c.name));
        const hardCerts = HC_CERTIFICATIONS.map((c) => ({ id: `hc-${c.name.replace(/\s+/g, "-").toLowerCase()}`, name: c.name, org: c.org, year: c.year })).filter((c) => !seenCert.has(c.name));
        const certsAll = certsFromDb.concat(hardCerts).slice(0, 6);

        const seenServ = new Set(servicesFromDb.map((s) => s.name));
        const hardServ = HC_SERVICES.map((s) => ({ id: `hc-${s.title.replace(/\s+/g, "-").toLowerCase()}`, name: s.title, bullets: s.points })).filter((s) => !seenServ.has(s.name));
        const servicesAll = servicesFromDb.concat(hardServ).slice(0, 6);

        setHomeProjects(projectsAll);
        setHomeCerts(certsAll);
        setHomeServices(servicesAll);

        if (process.env.NODE_ENV !== "production") console.log("[home] fetched previews: projects", projectsAll.length);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.log("[home] preview fetch error:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[var(--bg1)] focus:px-3 focus:py-2 focus:text-sm focus-ring"
        onClick={(e) => {
          e.preventDefault();
          setActive("home");
          scrollToId("home");
        }}
      >
        Skip to content
      </a>

      <CyberBackground />
      <CustomCursor />

      {/* scroll progress */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress, transformOrigin: "0% 50%" }}
        className="fixed left-0 top-0 z-[70] h-0.5 w-full bg-[var(--accent)]"
      />

      {/* right-side section dots */}
      <div className="fixed right-3 top-1/2 z-[65] hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Jump to ${s.label}`}
            onClick={() => {
              setActive(s.id);
              scrollToId(s.id);
            }}
            className={[
              "h-2.5 w-2.5 rounded-full border transition",
              active === s.id
                ? "border-[var(--accent)] bg-[var(--accent)] shadow-[0_0_18px_var(--glow)]"
                : "border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-transparent hover:border-[var(--accent)]",
            ].join(" ")}
          />
        ))}
      </div>

      {/* navbar */}
      <header
        className={[
          "fixed left-0 top-0 z-[66] w-full transition-all duration-300",
          navSolid ? "backdrop-blur-xl" : "",
        ].join(" ")}
      >
        <nav
          className={[
            "mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6",
            navSolid ? "glass-strong neon rounded-b-2xl" : "",
          ].join(" ")}
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => {
              setActive("home");
              scrollToId("home");
            }}
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1 focus-ring"
            aria-label="Back to top"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]">
              <Shield className="h-4 w-4 text-[var(--accent)]" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              Rupesh Thakur
            </span>
          </button>

          <div className="hidden items-center gap-6 lg:flex">
            {SECTIONS.slice(0, 9).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(s.id);
                  scrollToId(s.id);
                }}
                className={[
                  "group text-sm transition", // <-- group added (fix underline hover)
                  active === s.id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]",
                ].join(" ")}
              >
                <span className="relative">
                  {s.label}
                  <span
                    className={[
                      "absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition",
                      active === s.id ? "scale-x-100" : "group-hover:scale-x-100",
                    ].join(" ")}
                  />
                </span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycle}
              aria-label={`Switch theme (current: ${currentThemeLabel})`}
              className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--text)] focus-ring"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center text-[var(--accent)]">
                {THEMES.find((t) => t.id === theme)?.icon ?? <Moon className="h-4 w-4" />}
              </span>
              <span className="hidden sm:block">{currentThemeLabel}</span>
            </button>

            {/* Admin access hidden */}
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* HERO */}
        <section id="home" className="relative overflow-hidden">
          <div className="mx-auto flex min-h-[92vh] max-w-6xl flex-col items-center justify-center px-4 pb-10 pt-20 sm:px-6">
            <motion.div
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-center"
            >
              <GlitchName name="Rupesh Thakur" />

              <div className="mx-auto mt-4 max-w-3xl font-mono text-sm text-[var(--muted)] sm:text-base">
                <span className="text-[var(--success)]">{typed}</span>
                <span
                  aria-hidden
                  className="ml-1 inline-block h-4 w-[10px] translate-y-[2px] bg-[var(--success)] opacity-70 animate-pulse"
                />
              </div>
            </motion.div>

            {/* photo + stats */}
            <div className="mt-10 grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatCard label="Years of Study" value={3} />
                  <StatCard label="Security & Network Projects" value={20} />
                  <StatCard label="Labs & Case Studies" value={15} />
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToId("projects")}
                    className="neon inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition focus-ring sm:w-auto"
                  >
                    View Projects <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_70%,transparent)] bg-transparent px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition hover:shadow-[0_0_22px_var(--glow)] focus-ring sm:w-auto"
                    aria-label="Download CV (placeholder)"
                    onClick={(e) => e.preventDefault()}
                  >
                    Download CV <Download className="h-4 w-4 text-[var(--accent)]" />
                  </motion.a>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--muted)] sm:justify-start">
                  <span className="glass rounded-full px-3 py-1">
                    Network Security • Web Security • Digital Forensics
                  </span>
                  <span className="glass rounded-full px-3 py-1">
                    Learning-focused • Ethical • Documentation-first
                  </span>
                </div>
              </div>

              <div className="order-1 flex justify-center lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 -z-10 blur-2xl">
                    <div className="h-64 w-64 rounded-[34px] bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]" />
                  </div>

                  {/* Hex-ish frame */}
                  <div className="relative h-[260px] w-[240px] sm:h-[320px] sm:w-[290px]">
                    <div className="absolute inset-0 rounded-[36px] border border-[color-mix(in_srgb,var(--accent)_65%,transparent)] shadow-[0_0_40px_var(--glow)]" />
                    <div className="absolute inset-2 overflow-hidden rounded-[32px] bg-[color-mix(in_srgb,var(--bg1)_70%,transparent)]">
                      <div className="absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
                      <Image
                        src="https://images.unsplash.com/photo-1764452008254-eed469a4fad3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Abstract cybersecurity portrait placeholder"
                        fill
                        className="object-cover opacity-90"
                        priority
                      />
                    </div>

                    {/* orbiting badges */}
                    {!reduce && (
                      <>
                        {["CTF", "Forensics", "OWASP", "Routing"].map((b, i) => (
                          <motion.div
                            key={b}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.12 }}
                            className="glass neon absolute rounded-full px-3 py-1 text-[11px] text-[var(--text)]"
                            style={{
                              top: `${18 + i * 18}%`,
                              left: i % 2 === 0 ? "-10%" : "82%",
                            }}
                          >
                            <span className="font-mono text-[var(--muted)]">#</span>{" "}
                            <span className="text-[var(--accent)]">{b}</span>
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* scroll indicator removed */}
          </div>
        </section>

        {/* ABOUT */}
        <RevealSection id="about" title="// ABOUT ME" subtitle="Securing Systems Through Knowledge, Practice, and Discipline" className="py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6">
                <p className="text-[var(--muted)]">
                  I am a cybersecurity student focused on hands-on learning: designing secure networks, testing assumptions in lab environments, and extracting lessons from incidents. I combine practical exercises (CTFs, packet-tracer simulations) with clear, evidence-driven writeups and reproducible lab work.
                </p>

                <p className="mt-4 text-[var(--muted)]">
                  My interests include web application security (OWASP-aligned testing), digital forensics, and defensive network design. I value clarity in reporting and strive to make complex findings actionable for technical and non-technical audiences.
                </p>

                <div className="mt-6">
                  <SectionCTA href="/about" label="Read full story" ariaLabel="Read full about page" />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass neon rounded-2xl p-6">
                <p className="font-mono text-xs text-[var(--success)]">&gt; Designing secure networks, testing assumptions, and learning from incidents.</p>
              </div>

              <div aria-hidden className="absolute -inset-6 -z-10 blur-3xl">
                <div className="h-60 w-60 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]" />
              </div>
            </div>
          </div>
        </RevealSection>

        {/* SKILLS */}
        <RevealSection
          id="skills"
          title="// THE ARSENAL"
          subtitle="Tools & technologies I practice with"
          className="py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {skills.map((g) => (
                <TiltCard key={g.group} className="p-6">
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
                            className="h-full w-0 rounded-full bg-[var(--accent)] transition-all duration-300 group-hover:w-[var(--w)]"
                            style={{ ["--w" as never]: `${s.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TiltCard>
              ))}
            </div>

            <SectionCTA href="/skills" label="View Full Arsenal" ariaLabel="View full skills" />
          </div>
        </RevealSection>

        {/* PROJECTS */}
        <RevealSection
          id="projects"
          title="// SECURITY COMMAND CENTER"
          subtitle="Mission-critical projects"
          className="py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {homeProjects.map((p) => (
                <TiltCard key={p.id ?? p.title} className="overflow-hidden">
                  <div className="relative h-40 w-full">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,color-mix(in_srgb,var(--accent)_25%,transparent),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(800px_260px_at_10%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg1)_60%,transparent)]" />
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                        {p.category}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--muted)]">SEC-SCORE</span>
                    </div>

                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.desc ?? p.summary}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(p.tags ?? []).slice(0, 4).map((t: string) => (
                        <span
                          key={t}
                          className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-[11px] text-[var(--text)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link href={`/projects/${p.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring" aria-label={`View details for ${p.title}`}>
                        View Details <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                      </Link>

                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                        <Github className="h-4 w-4" />
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>

            <SectionCTA href="/projects" label="View All Projects" ariaLabel="View all projects" />
          </div>
        </RevealSection>

        {/* BLOG */}
        <RevealSection
          id="blog"
          title="// INCIDENT REPORTS"
          subtitle="Security insights & learning notes"
          className="py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((b) => (
                <TiltCard key={b.rep} className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--muted)]">{b.rep}</span>
                    <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                      {b.sev}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold">{b.title}</h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-1 text-[11px] text-[var(--text)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>Reading time: {b.time}</span>
                    <Link
                      href={`/blog/${b.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring"
                      aria-label={`Read ${b.slug}`}
                    >
                      Read <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>

            <SectionCTA href="/blog" label="View All Reports" ariaLabel="View all reports" />
          </div>
        </RevealSection>

        {/* CERTIFICATIONS */}
        <RevealSection
          id="certifications"
          title="// BATTLE LOGS"
          subtitle="Certifications & achievements"
          className="py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="glass neon overflow-hidden rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 px-2 pb-2">
                <p className="text-sm font-semibold">Featured achievements</p>
                <p className="font-mono text-xs text-[var(--muted)]">scroll →</p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {homeCerts.map((c) => (
                  <div
                    key={c.id ?? c.name}
                    className="min-w-[260px] rounded-2xl border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_65%,transparent)] p-4 hover:shadow-[0_0_22px_var(--glow)] transition"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]">
                        <Shield className="h-5 w-5 text-[var(--accent)]" />
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)]">{c.year}</span>
                    </div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{c.org}</p>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring"
                      aria-label="Verify (placeholder)"
                    >
                      Verify <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <SectionCTA href="/certifications" label="View All Achievements" ariaLabel="View all achievements" />
          </div>
        </RevealSection>

        {/* SERVICES (renamed for student) */}
        <RevealSection
          id="services"
          title="// AREAS OF INTEREST & PRACTICE"
          subtitle="What I focus on"
          className="py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {homeServices.map((s) => (
                <TiltCard key={s.id ?? s.title ?? s.name} className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold">{s.title ?? s.name}</h3>
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
                      focus
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {(s.bullets ?? s.points ?? []).map((p: any) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/services"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:shadow-[0_0_18px_var(--glow)] focus-ring"
                    aria-label="Learn more"
                  >
                    Learn More <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
                  </Link>
                </TiltCard>
              ))}
            </div>
          </div>
        </RevealSection>




        {/* CONTACT */}
        <RevealSection
          id="contact"
          title="// ESTABLISH CONNECTION"
          subtitle="If you'd like to reach me, please email me directly"
          className="py-16"
        >
          <ContactSection />
        </RevealSection>

        {/* FOOTER */}
        <footer className="border-t border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_85%,transparent)]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]">
                  <Shield className="h-4 w-4 text-[var(--accent)]" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Rupesh Thakur</p>
                  <p className="text-xs text-[var(--muted)]">Securing Digital Futures</p>
                </div>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Securing digital systems through learning, analysis, and practice.
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Quick Links</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActive(s.id);
                        scrollToId(s.id);
                      }}
                      className="inline-flex w-full items-center justify-center rounded-lg px-2 py-1 text-center transition hover:text-[var(--text)] hover:neon focus-ring"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources block removed per request */}
          </div>

          <div className="border-t border-[color-mix(in_srgb,var(--border)_70%,transparent)]">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-[var(--muted)] sm:flex-row sm:px-6">
              <span>© 2026 Rupesh Thakur. All rights reserved.</span>
              <button
                type="button"
                onClick={() => {
                  setActive("home");
                  scrollToId("home");
                }}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 transition hover:text-[var(--text)] focus-ring"
                aria-label="Back to top"
              >
                Back to Top <ChevronUp className="h-4 w-4 text-[var(--accent)]" />
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}


function ContactSection() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="space-y-4">
        <div className="glass neon rounded-2xl p-6">
          <p className="mb-3 font-mono text-xs tracking-[0.24em] text-[var(--muted)]">
            CONTACT INFO
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--muted)]">Availability</span>
              <span className="text-[var(--success)]">● Open</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--muted)]">Location</span>
              <span className="text-[var(--text)]">Nepal (Remote-friendly)</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--muted)]">Response time</span>
              <span className="text-[var(--text)]">24–48 hours</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--muted)]">Email</span>
              <a
                href="mailto:rupeshkthakur443@gmail.com"
                className="text-[var(--text)] underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-4 focus-ring rounded-md px-1 py-0.5"
              >
                rupeshkthakur443@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "PGP Key Available", icon: <Lock className="h-4 w-4 text-[var(--accent)]" /> },
              { label: "Remote-friendly", icon: <Shield className="h-4 w-4 text-[var(--accent)]" /> },
              { label: "NDA-ready (future)", icon: <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" /> },
              { label: "Lab collaborations", icon: <Terminal className="h-4 w-4 text-[var(--accent)]" /> },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-[color-mix(in_srgb,var(--border)_75%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_70%,transparent)] p-3"
              >
                <div className="mb-2">{c.icon}</div>
                <p className="text-xs text-[var(--muted)]">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[color-mix(in_srgb,var(--border)_75%,transparent)] bg-[color-mix(in_srgb,var(--bg1)_70%,transparent)] p-4">
            <p className="text-sm text-[var(--muted)]">
              Please email me directly. I aim to respond within 24–48 hours. For urgent matters, indicate "URGENT" in the subject line.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "GitHub",
              href: "https://github.com/IAZENT",
              icon: <Github className="h-4 w-4" />,
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/rupesh-thakur-aa98702a7/",
              icon: <Linkedin className="h-4 w-4" />,
            },
            {
              label: "Email",
              href: "mailto:rupeshthakur443@gmail.com",
              icon: <Mail className="h-4 w-4" />,
            },
            {
              label: "TryHackMe",
              href: "https://tryhackme.com/p/Cosmic777",
              icon: <Skull className="h-4 w-4" />,
            },
            {
              label: "Hack The Box",
              href: "https://app.hackthebox.com/users/1936521",
              icon: <Shield className="h-4 w-4" />,
            },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer" : undefined}
              className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)] hover:neon focus-ring"
              aria-label={s.label}
            >
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
