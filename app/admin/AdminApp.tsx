"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/database.types";
import {
  BookText,
  Boxes,
  Cog,
  FileBadge,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Shield,
  Sparkles,
  UserCog,
  Wrench,
} from "lucide-react";

type ProfileRow = Pick<Tables<"profiles">, "id" | "role" | "display_name">;

type AdminSection =
  | "dashboard"
  | "projects"
  | "blog"
  | "certifications"
  | "skills"
  | "services"
  | "testimonials"
  | "media"
  | "messages"
  | "settings"
  | "users";

const SECTIONS: Array<{ id: AdminSection; label: string; icon: React.ReactNode }> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "projects", label: "Projects", icon: <Boxes className="h-4 w-4" /> },
  { id: "blog", label: "Blog Posts", icon: <BookText className="h-4 w-4" /> },
  { id: "certifications", label: "Certifications", icon: <FileBadge className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Wrench className="h-4 w-4" /> },
  { id: "services", label: "Areas of Interest", icon: <Sparkles className="h-4 w-4" /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquareQuote className="h-4 w-4" /> },
  { id: "media", label: "Media", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "messages", label: "Messages", icon: <Inbox className="h-4 w-4" /> },
  { id: "settings", label: "Site Settings", icon: <Cog className="h-4 w-4" /> },
  { id: "users", label: "Users", icon: <UserCog className="h-4 w-4" /> },
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function splitLinesToArray(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToLines(arr: string[]) {
  return (arr ?? []).join("\n");
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-[var(--muted)]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-ring",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-ring",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent px-3 py-2 text-sm text-[var(--text)] focus-ring",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

function Btn({
  children,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "neon bg-[var(--accent)] text-black"
      : variant === "danger"
        ? "border border-red-500/50 bg-red-500/10 text-red-100 hover:bg-red-500/15"
        : "glass text-[var(--muted)] hover:text-[var(--text)] hover:neon";

  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition focus-ring disabled:opacity-60",
        cls,
        props.className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="glass neon overflow-hidden rounded-2xl">{children}</div>;
}

function TableHeadRow({ cols }: { cols: string[] }) {
  return (
    <div className="grid gap-3 border-b border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-black/20 px-4 py-3 text-xs text-[var(--muted)] md:px-5">
      <div className="grid grid-cols-12 gap-3">
        {cols.map((c, i) => (
          <div key={i} className={i === cols.length - 1 ? "col-span-3 text-right" : "col-span-3"}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[color-mix(in_srgb,var(--border)_55%,transparent)] px-4 py-3 md:px-5">
      {children}
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="p-6 text-sm text-[var(--muted)]">
      <p className="text-[var(--text)]">{title}</p>
      {hint ? <p className="mt-1">{hint}</p> : null}
    </div>
  );
}

export default function AdminApp({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const section = (params.get("section") as AdminSection | null) ?? "dashboard";
  const safeSection: AdminSection = SECTIONS.some((s) => s.id === section) ? section : "dashboard";

  const setSection = (next: AdminSection) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("section", next);
    router.replace(`/admin?${sp.toString()}`);
  };

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const showUsers = profile.role === "admin";

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="glass neon sticky top-6 h-fit rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-5">Admin</p>
                <p className="text-xs text-[var(--muted)]">
                  {profile.display_name ?? "User"} • {profile.role}
                </p>
              </div>
            </div>

            <Btn onClick={signOut} aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Btn>
          </div>

          <div className="mt-4">
            <div className="grid gap-1">
              {SECTIONS.filter((s) => (s.id === "users" ? showUsers : true)).map((s) => {
                const active = safeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={[
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition focus-ring",
                      active
                        ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--text)] shadow-[0_0_18px_var(--glow)]"
                        : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
                    ].join(" ")}
                  >
                    <span className={active ? "text-[var(--accent)]" : "text-[var(--muted)]"}>
                      {s.icon}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-black/20 p-3">
              <p className="font-mono text-xs text-[var(--success)]">
                {">"} Step 3: CRUD + content management
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Automation (Notion/PDF/GitHub) is Step 4.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          {safeSection === "dashboard" && (
            <Dashboard supabase={supabase} profile={profile} />
          )}
          {safeSection === "projects" && <ProjectsAdmin supabase={supabase} />}
          {safeSection === "blog" && <BlogAdmin supabase={supabase} />}
          {safeSection === "certifications" && <CertsAdmin supabase={supabase} />}
          {safeSection === "skills" && <SkillsAdmin supabase={supabase} />}
          {safeSection === "services" && <ServicesAdmin supabase={supabase} />}
          {safeSection === "testimonials" && <TestimonialsAdmin supabase={supabase} />}
          {safeSection === "media" && <MediaAdmin supabase={supabase} />}
          {safeSection === "messages" && <MessagesAdmin supabase={supabase} />}
          {safeSection === "settings" && <SettingsAdmin supabase={supabase} />}
          {safeSection === "users" && showUsers && <UsersAdmin supabase={supabase} />}
          {safeSection === "users" && !showUsers && (
            <div className="glass neon rounded-2xl p-6">
              <p className="text-sm text-[var(--muted)]">Only admins can manage users.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  supabase,
  profile,
}: {
  supabase: ReturnType<typeof createClient>;
  profile: ProfileRow;
}) {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    projects: 0,
    blog: 0,
    certs: 0,
    skills: 0,
    services: 0,
    testimonials: 0,
    media: 0,
    messages: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const q = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("certifications").select("id", { count: "exact", head: true }),
        supabase.from("skills").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      setCounts({
        projects: q[0].count ?? 0,
        blog: q[1].count ?? 0,
        certs: q[2].count ?? 0,
        skills: q[3].count ?? 0,
        services: q[4].count ?? 0,
        testimonials: q[5].count ?? 0,
        media: q[6].count ?? 0,
        messages: q[7].count ?? 0,
      });
      setLoading(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div>
      <SectionTitle
        eyebrow="// DASHBOARD"
        title={`Welcome, ${profile.display_name ?? "Admin"}`}
        subtitle="Quick overview of your content. All editing happens in the sections on the left."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SmallStat label="Projects" value={loading ? "…" : String(counts.projects)} />
        <SmallStat label="Blog Posts" value={loading ? "…" : String(counts.blog)} />
        <SmallStat label="Certifications" value={loading ? "…" : String(counts.certs)} />
        <SmallStat label="Skills" value={loading ? "…" : String(counts.skills)} />
        <SmallStat label="Areas of Interest" value={loading ? "…" : String(counts.services)} />
        <SmallStat label="Testimonials" value={loading ? "…" : String(counts.testimonials)} />
        <SmallStat label="Media" value={loading ? "…" : String(counts.media)} />
        <SmallStat label="Messages" value={loading ? "…" : String(counts.messages)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass neon rounded-2xl p-6">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">QUICK ACTIONS</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="glass rounded-xl px-3 py-2 text-sm text-[var(--muted)]">
              Create items in each section
            </span>
            <span className="glass rounded-xl px-3 py-2 text-sm text-[var(--muted)]">
              Toggle “featured” / “published”
            </span>
            <span className="glass rounded-xl px-3 py-2 text-sm text-[var(--muted)]">
              Edit site settings JSON
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">STATUS</p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            RLS policies are active; CRUD will fail if your Supabase profile role is not <span className="text-[var(--accent)]">admin</span> or{" "}
            <span className="text-[var(--accent)]">editor</span>.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            If you can view data but inserts fail, ensure your user has the correct role in <code className="text-[var(--text)]">public.profiles</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Projects ---------------- */

type ProjectRow = Tables<"projects">;
type ProjectInsert = TablesInsert<"projects">;
type ProjectUpdate = TablesUpdate<"projects">;

function ProjectsAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [form, setForm] = useState<ProjectInsert>({
    slug: "",
    title: "",
    summary: "",
    content_md: "",
    category: "",
    tech_stack: [],
    featured: false,
    github_url: "",
    demo_url: "",
    security_score: null,
    status: "active",
    visibility: "public",
    access_password: null,
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const query = supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);

    const { data, error: e } = q
      ? await query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%`)
      : await query;

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    setEditing(null);
    setForm({
      slug: "",
      title: "",
      summary: "",
      content_md: "",
      category: "",
      tech_stack: [],
      featured: false,
      github_url: "",
      demo_url: "",
      security_score: null,
      status: "active",
      visibility: "public",
      access_password: null,
    });
  }

  function startEdit(row: ProjectRow) {
    setEditing(row);
    setForm({
      slug: row.slug,
      title: row.title,
      summary: row.summary ?? "",
      content_md: row.content_md ?? "",
      category: row.category ?? "",
      tech_stack: row.tech_stack ?? [],
      featured: row.featured,
      github_url: row.github_url ?? "",
      demo_url: row.demo_url ?? "",
      security_score: row.security_score,
      status: row.status,
      visibility: row.visibility,
      access_password: row.access_password,
    });
  }

  async function save() {
    setError(null);

    const payload: ProjectInsert | ProjectUpdate = {
      ...form,
      slug: form.slug?.trim() ? form.slug.trim() : slugify(form.title),
      tech_stack: Array.isArray(form.tech_stack) ? form.tech_stack : [],
      summary: form.summary?.trim() ? form.summary.trim() : null,
      content_md: form.content_md?.trim() ? form.content_md.trim() : null,
      category: form.category?.trim() ? form.category.trim() : null,
      github_url: form.github_url?.trim() ? form.github_url.trim() : null,
      demo_url: form.demo_url?.trim() ? form.demo_url.trim() : null,
      access_password: form.visibility === "password" ? (form.access_password?.trim() ? form.access_password.trim() : null) : null,
    };

    if (!payload.slug) {
      setError("Slug is required (or provide a title to auto-generate).");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("projects").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("projects").insert(payload as ProjectInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this project?")) return;
    const { error: e } = await supabase.from("projects").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// PROJECTS"
        title="Projects"
        subtitle="Create, edit, feature, and control visibility."
        right={
          <>
            <TextInput
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              aria-label="Search projects"
              className="w-[220px]"
            />
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          <div className="p-4 md:p-5">
            <p className="text-sm text-[var(--muted)]">
              Tip: keep <span className="text-[var(--text)]">content_md</span> as Markdown for now (Step 4 can enhance editors/automation).
            </p>
          </div>

          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No projects yet." hint="Click “New” to create your first project." />
          ) : (
            <div>
              <div className="border-t border-[color-mix(in_srgb,var(--border)_55%,transparent)]" />
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.title}</p>
                        {r.featured && (
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                            featured
                          </span>
                        )}
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">
                          {r.visibility}
                        </span>
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">
                          {r.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">{r.slug}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Updated: {fmtDateTime(r.updated_at)}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT PROJECT" : "NEW PROJECT"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Title">
              <TextInput
                value={form.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setForm((p) => ({
                    ...p,
                    title: nextTitle,
                    slug: p.slug ? p.slug : slugify(nextTitle),
                  }));
                }}
                placeholder="Secure Enterprise Network Design"
              />
            </Field>

            <Field label="Slug">
              <TextInput
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="secure-enterprise-network-design"
              />
            </Field>

            <Field label="Category">
              <TextInput value={form.category ?? ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Network Security" />
            </Field>

            <Field label="Summary">
              <TextArea value={form.summary ?? ""} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} rows={3} placeholder="Short 1–2 line summary…" />
            </Field>

            <Field label="Tech stack (one per line)">
              <TextArea
                value={arrayToLines(form.tech_stack ?? [])}
                onChange={(e) => setForm((p) => ({ ...p, tech_stack: splitLinesToArray(e.target.value) }))}
                rows={4}
                placeholder={"VLAN\nOSPF\nACL\nPacket Tracer"}
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Status">
                <Select value={form.status ?? "active"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProjectRow["status"] }))}>
                  <option className="bg-black" value="active">active</option>
                  <option className="bg-black" value="in_progress">in_progress</option>
                  <option className="bg-black" value="archived">archived</option>
                </Select>
              </Field>

              <Field label="Visibility">
                <Select value={form.visibility ?? "public"} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as ProjectRow["visibility"] }))}>
                  <option className="bg-black" value="public">public</option>
                  <option className="bg-black" value="private">private</option>
                  <option className="bg-black" value="password">password</option>
                </Select>
              </Field>
            </div>

            {form.visibility === "password" && (
              <Field label="Access password (only stored, not hashed yet)">
                <TextInput
                  value={form.access_password ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, access_password: e.target.value }))}
                  placeholder="Set a password"
                />
              </Field>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="GitHub URL">
                <TextInput value={form.github_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))} placeholder="https://github.com/…" />
              </Field>
              <Field label="Demo URL">
                <TextInput value={form.demo_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, demo_url: e.target.value }))} placeholder="https://…" />
              </Field>
            </div>

            <Field label="Security score (0–100)">
              <TextInput
                type="number"
                min={0}
                max={100}
                value={form.security_score ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, security_score: e.target.value ? Number(e.target.value) : null }))}
                placeholder="85"
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="h-4 w-4 rounded border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent"
              />
              Featured on homepage
            </label>

            <Field label="Content (Markdown)">
              <TextArea value={form.content_md ?? ""} onChange={(e) => setForm((p) => ({ ...p, content_md: e.target.value }))} rows={10} placeholder="Full writeup in Markdown…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? (
                <Btn onClick={startNew}>Cancel</Btn>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Blog ---------------- */

type BlogRow = Tables<"blog_posts">;
type BlogInsert = TablesInsert<"blog_posts">;
type BlogUpdate = TablesUpdate<"blog_posts">;

function BlogAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<BlogRow | null>(null);
  const [form, setForm] = useState<BlogInsert>({
    slug: "",
    title: "",
    excerpt: "",
    content_md: "",
    cover_url: "",
    category: "",
    tags: [],
    severity: "medium",
    reading_time_minutes: null,
    status: "draft",
    published_at: null,
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const query = supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);

    const { data, error: e } = q
      ? await query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%`)
      : await query;

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    setEditing(null);
    setForm({
      slug: "",
      title: "",
      excerpt: "",
      content_md: "",
      cover_url: "",
      category: "",
      tags: [],
      severity: "medium",
      reading_time_minutes: null,
      status: "draft",
      published_at: null,
    });
  }

  function startEdit(row: BlogRow) {
    setEditing(row);
    setForm({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      content_md: row.content_md ?? "",
      cover_url: row.cover_url ?? "",
      category: row.category ?? "",
      tags: row.tags ?? [],
      severity: row.severity,
      reading_time_minutes: row.reading_time_minutes,
      status: row.status,
      published_at: row.published_at,
    });
  }

  async function save() {
    setError(null);

    const payload: BlogInsert | BlogUpdate = {
      ...form,
      slug: form.slug?.trim() ? form.slug.trim() : slugify(form.title),
      excerpt: form.excerpt?.trim() ? form.excerpt.trim() : null,
      content_md: form.content_md?.trim() ? form.content_md.trim() : null,
      cover_url: form.cover_url?.trim() ? form.cover_url.trim() : null,
      category: form.category?.trim() ? form.category.trim() : null,
      tags: Array.isArray(form.tags) ? form.tags : [],
      published_at: form.status === "published" ? (form.published_at ?? new Date().toISOString()) : null,
      reading_time_minutes: form.reading_time_minutes ?? null,
    };

    if (!payload.slug) {
      setError("Slug is required (or provide a title to auto-generate).");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("blog_posts").insert(payload as BlogInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this blog post?")) return;
    const { error: e } = await supabase.from("blog_posts").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// BLOG POSTS"
        title="Incident Reports"
        subtitle="Draft/publish posts and manage tags/severity."
        right={
          <>
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-[220px]" />
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No blog posts yet." hint="Click “New” to create your first post." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.title}</p>
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">
                          {r.status}
                        </span>
                        <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                          {r.severity}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">{r.slug}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Published: {fmtDateTime(r.published_at)}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT POST" : "NEW POST"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Title">
              <TextInput
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    title: e.target.value,
                    slug: p.slug ? p.slug : slugify(e.target.value),
                  }))
                }
                placeholder="JWT pitfalls: where analysis often misses"
              />
            </Field>

            <Field label="Slug">
              <TextInput value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="jwt-pitfalls" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Status">
                <Select value={form.status ?? "draft"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BlogRow["status"] }))}>
                  <option className="bg-black" value="draft">draft</option>
                  <option className="bg-black" value="published">published</option>
                </Select>
              </Field>

              <Field label="Severity">
                <Select value={form.severity ?? "medium"} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as BlogRow["severity"] }))}>
                  <option className="bg-black" value="critical">critical</option>
                  <option className="bg-black" value="high">high</option>
                  <option className="bg-black" value="medium">medium</option>
                  <option className="bg-black" value="low">low</option>
                </Select>
              </Field>
            </div>

            <Field label="Category">
              <TextInput value={form.category ?? ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Web Security" />
            </Field>

            <Field label="Tags (one per line)">
              <TextArea value={arrayToLines(form.tags ?? [])} onChange={(e) => setForm((p) => ({ ...p, tags: splitLinesToArray(e.target.value) }))} rows={4} placeholder={"JWT\nAuth\nOWASP"} />
            </Field>

            <Field label="Reading time (minutes)">
              <TextInput
                type="number"
                min={1}
                value={form.reading_time_minutes ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, reading_time_minutes: e.target.value ? Number(e.target.value) : null }))}
                placeholder="6"
              />
            </Field>

            <Field label="Cover image URL (optional)">
              <TextInput value={form.cover_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, cover_url: e.target.value }))} placeholder="https://…" />
            </Field>

            <Field label="Excerpt">
              <TextArea value={form.excerpt ?? ""} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} rows={3} placeholder="2–3 line summary…" />
            </Field>

            <Field label="Content (Markdown)">
              <TextArea value={form.content_md ?? ""} onChange={(e) => setForm((p) => ({ ...p, content_md: e.target.value }))} rows={10} placeholder="Full article in Markdown…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? <Btn onClick={startNew}>Cancel</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Certifications ---------------- */

type CertRow = Tables<"certifications">;
type CertInsert = TablesInsert<"certifications">;
type CertUpdate = TablesUpdate<"certifications">;

function CertsAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CertRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CertRow | null>(null);
  const [form, setForm] = useState<CertInsert>({
    name: "",
    issuing_org: "",
    category: "",
    prestige: 50,
    obtained_at: null,
    expires_at: null,
    credential_id: "",
    verify_url: "",
    logo_url: "",
    pdf_url: "",
    description: "",
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("certifications")
      .select("*")
      .order("prestige", { ascending: false })
      .order("obtained_at", { ascending: false })
      .limit(300);

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNew() {
    setEditing(null);
    setForm({
      name: "",
      issuing_org: "",
      category: "",
      prestige: 50,
      obtained_at: null,
      expires_at: null,
      credential_id: "",
      verify_url: "",
      logo_url: "",
      pdf_url: "",
      description: "",
    });
  }

  function startEdit(row: CertRow) {
    setEditing(row);
    setForm({
      name: row.name,
      issuing_org: row.issuing_org ?? "",
      category: row.category ?? "",
      prestige: row.prestige,
      obtained_at: row.obtained_at,
      expires_at: row.expires_at,
      credential_id: row.credential_id ?? "",
      verify_url: row.verify_url ?? "",
      logo_url: row.logo_url ?? "",
      pdf_url: row.pdf_url ?? "",
      description: row.description ?? "",
    });
  }

  async function save() {
    setError(null);

    const payload: CertInsert | CertUpdate = {
      ...form,
      issuing_org: form.issuing_org?.trim() ? form.issuing_org.trim() : null,
      category: form.category?.trim() ? form.category.trim() : null,
      credential_id: form.credential_id?.trim() ? form.credential_id.trim() : null,
      verify_url: form.verify_url?.trim() ? form.verify_url.trim() : null,
      logo_url: form.logo_url?.trim() ? form.logo_url.trim() : null,
      pdf_url: form.pdf_url?.trim() ? form.pdf_url.trim() : null,
      description: form.description?.trim() ? form.description.trim() : null,
      prestige: Number.isFinite(form.prestige) ? form.prestige : 50,
    };

    if (!payload.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("certifications").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("certifications").insert(payload as CertInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this certification?")) return;
    const { error: e } = await supabase.from("certifications").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// CERTIFICATIONS"
        title="Certifications & Achievements"
        subtitle="Store certificates and verification links."
        right={
          <>
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No certifications yet." hint="Click “New” to add one." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {r.issuing_org ?? "—"} • prestige {r.prestige} • obtained {r.obtained_at ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT CERTIFICATION" : "NEW CERTIFICATION"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Digital Forensics Practical Assessment" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Issuing organization">
                <TextInput value={form.issuing_org ?? ""} onChange={(e) => setForm((p) => ({ ...p, issuing_org: e.target.value }))} placeholder="University" />
              </Field>
              <Field label="Category">
                <TextInput value={form.category ?? ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Security" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prestige (0–100)">
                <TextInput type="number" min={0} max={100} value={form.prestige ?? 50} onChange={(e) => setForm((p) => ({ ...p, prestige: Number(e.target.value) }))} />
              </Field>
              <Field label="Obtained at (YYYY-MM-DD)">
                <TextInput value={form.obtained_at ?? ""} onChange={(e) => setForm((p) => ({ ...p, obtained_at: e.target.value || null }))} placeholder="2024-05-01" />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Verify URL">
                <TextInput value={form.verify_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, verify_url: e.target.value }))} placeholder="https://…" />
              </Field>
              <Field label="Credential ID">
                <TextInput value={form.credential_id ?? ""} onChange={(e) => setForm((p) => ({ ...p, credential_id: e.target.value }))} placeholder="ABC-123" />
              </Field>
            </div>

            <Field label="Logo URL (optional)">
              <TextInput value={form.logo_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} placeholder="https://…" />
            </Field>

            <Field label="PDF URL (optional)">
              <TextInput value={form.pdf_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, pdf_url: e.target.value }))} placeholder="https://…" />
            </Field>

            <Field label="Description">
              <TextArea value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} placeholder="Short details…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? <Btn onClick={startNew}>Cancel</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skills ---------------- */

type SkillRow = Tables<"skills">;
type SkillInsert = TablesInsert<"skills">;
type SkillUpdate = TablesUpdate<"skills">;

function SkillsAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SkillRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<SkillRow | null>(null);
  const [form, setForm] = useState<SkillInsert>({
    name: "",
    category: "",
    proficiency: 50,
    years: null,
    icon: "",
    description: "",
    show_on_home: false,
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("skills")
      .select("*")
      .order("category", { ascending: true })
      .order("proficiency", { ascending: false })
      .limit(500);

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  function startNew() {
    setEditing(null);
    setForm({
      name: "",
      category: "",
      proficiency: 50,
      years: null,
      icon: "",
      description: "",
      show_on_home: false,
    });
  }

  function startEdit(row: SkillRow) {
    setEditing(row);
    setForm({
      name: row.name,
      category: row.category ?? "",
      proficiency: row.proficiency,
      years: row.years ?? null,
      icon: row.icon ?? "",
      description: row.description ?? "",
      show_on_home: row.show_on_home,
    });
  }

  async function save() {
    setError(null);

    const payload: SkillInsert | SkillUpdate = {
      ...form,
      category: form.category?.trim() ? form.category.trim() : null,
      icon: form.icon?.trim() ? form.icon.trim() : null,
      description: form.description?.trim() ? form.description.trim() : null,
      proficiency: Math.max(0, Math.min(100, Number(form.proficiency ?? 50))),
      years: form.years ?? null,
    };

    if (!payload.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("skills").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("skills").insert(payload as SkillInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this skill?")) return;
    const { error: e } = await supabase.from("skills").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// SKILLS"
        title="Skills"
        subtitle="Manage skill categories, proficiency, and homepage highlights."
        right={
          <>
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No skills yet." hint="Click “New” to add one." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.name}</p>
                        {r.show_on_home && (
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                            home
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {r.category ?? "—"} • {r.proficiency}% • years {r.years ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT SKILL" : "NEW SKILL"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Wireshark" />
            </Field>

            <Field label="Category">
              <TextInput value={form.category ?? ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Security Tools" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Proficiency (0–100)">
                <TextInput type="number" min={0} max={100} value={form.proficiency ?? 50} onChange={(e) => setForm((p) => ({ ...p, proficiency: Number(e.target.value) }))} />
              </Field>
              <Field label="Years (optional)">
                <TextInput type="number" min={0} step="0.5" value={form.years ?? ""} onChange={(e) => setForm((p) => ({ ...p, years: e.target.value ? Number(e.target.value) : null }))} placeholder="2" />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={Boolean(form.show_on_home)}
                onChange={(e) => setForm((p) => ({ ...p, show_on_home: e.target.checked }))}
                className="h-4 w-4 rounded border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent"
              />
              Show on homepage preview
            </label>

            <Field label="Description">
              <TextArea value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={5} placeholder="Short description…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? <Btn onClick={startNew}>Cancel</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Services ---------------- */

type ServiceRow = Tables<"services">;
type ServiceInsert = TablesInsert<"services">;
type ServiceUpdate = TablesUpdate<"services">;

function ServicesAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [bulletsText, setBulletsText] = useState("");
  const [form, setForm] = useState<ServiceInsert>({
    name: "",
    icon: "",
    description_md: "",
    bullets: [],
    show_on_home: true,
    sort_order: 0,
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(300);

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  function startNew() {
    setEditing(null);
    setForm({
      name: "",
      icon: "",
      description_md: "",
      bullets: [],
      show_on_home: true,
      sort_order: 0,
    });
    setBulletsText("");
  }

  function startEdit(row: ServiceRow) {
    setEditing(row);
    setForm({
      name: row.name,
      icon: row.icon ?? "",
      description_md: row.description_md ?? "",
      bullets: row.bullets ?? [],
      show_on_home: row.show_on_home,
      sort_order: row.sort_order,
    });
    setBulletsText(arrayToLines(row.bullets ?? []));
  }

  async function save() {
    setError(null);

    const payload: ServiceInsert | ServiceUpdate = {
      ...form,
      icon: form.icon?.trim() ? form.icon.trim() : null,
      description_md: form.description_md?.trim() ? form.description_md.trim() : null,
      bullets: splitLinesToArray(bulletsText),
      sort_order: Number.isFinite(form.sort_order) ? Number(form.sort_order) : 0,
    };

    if (!payload.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("services").insert(payload as ServiceInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this item?")) return;
    const { error: e } = await supabase.from("services").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// AREAS OF INTEREST"
        title="Areas of Interest & Practice"
        subtitle="Safe student positioning (no pricing)."
        right={
          <>
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No items yet." hint="Click “New” to add one." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.name}</p>
                        {r.show_on_home && (
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                            home
                          </span>
                        )}
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">
                          sort {r.sort_order}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">Updated: {fmtDateTime(r.updated_at)}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT ITEM" : "NEW ITEM"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Web Application Security Testing (Learning)" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Sort order">
                <TextInput type="number" value={form.sort_order ?? 0} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={Boolean(form.show_on_home)}
                  onChange={(e) => setForm((p) => ({ ...p, show_on_home: e.target.checked }))}
                  className="mt-6 h-4 w-4 rounded border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent"
                />
                Show on homepage
              </label>
            </div>

            <Field label="Bullets (one per line)">
              <TextArea value={bulletsText} onChange={(e) => setBulletsText(e.target.value)} rows={6} placeholder={"OWASP-aligned workflow\nAuth/session analysis\nClear reporting"} />
            </Field>

            <Field label="Description (Markdown)">
              <TextArea value={form.description_md ?? ""} onChange={(e) => setForm((p) => ({ ...p, description_md: e.target.value }))} rows={6} placeholder="Optional longer description…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? <Btn onClick={startNew}>Cancel</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Testimonials ---------------- */

type TestimonialRow = Tables<"testimonials">;
type TestimonialInsert = TablesInsert<"testimonials">;
type TestimonialUpdate = TablesUpdate<"testimonials">;

function TestimonialsAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [form, setForm] = useState<TestimonialInsert>({
    client_name: "",
    role_title: "",
    company: "",
    quote: "",
    rating: 5,
    photo_url: "",
    show_on_home: false,
    verified: false,
    received_at: null,
  });

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("testimonials")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(300);

    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  function startNew() {
    setEditing(null);
    setForm({
      client_name: "",
      role_title: "",
      company: "",
      quote: "",
      rating: 5,
      photo_url: "",
      show_on_home: false,
      verified: false,
      received_at: null,
    });
  }

  function startEdit(row: TestimonialRow) {
    setEditing(row);
    setForm({
      client_name: row.client_name,
      role_title: row.role_title ?? "",
      company: row.company ?? "",
      quote: row.quote,
      rating: row.rating,
      photo_url: row.photo_url ?? "",
      show_on_home: row.show_on_home,
      verified: row.verified,
      received_at: row.received_at,
    });
  }

  async function save() {
    setError(null);

    const payload: TestimonialInsert | TestimonialUpdate = {
      ...form,
      role_title: form.role_title?.trim() ? form.role_title.trim() : null,
      company: form.company?.trim() ? form.company.trim() : null,
      photo_url: form.photo_url?.trim() ? form.photo_url.trim() : null,
      received_at: form.received_at ?? null,
      rating: Math.max(1, Math.min(5, Number(form.rating ?? 5))),
    };

    if (!payload.client_name.trim() || !payload.quote.trim()) {
      setError("Client name and quote are required.");
      return;
    }

    if (editing) {
      const { error: e } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      if (e) setError(e.message);
      else {
        await refresh();
        setEditing(null);
      }
    } else {
      const { error: e } = await supabase.from("testimonials").insert(payload as TestimonialInsert);
      if (e) setError(e.message);
      else {
        await refresh();
        startNew();
      }
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this testimonial?")) return;
    const { error: e } = await supabase.from("testimonials").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// TESTIMONIALS"
        title="Testimonials"
        subtitle="Manage quotes and homepage highlights."
        right={
          <>
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={startNew}>
              New
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No testimonials yet." hint="Click “New” to add one." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">{r.client_name}</p>
                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">{r.rating}★</span>
                        {r.verified && (
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                            verified
                          </span>
                        )}
                        {r.show_on_home && (
                          <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                            home
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">{r.quote}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Btn onClick={() => startEdit(r)}>Edit</Btn>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>

        <div className="glass neon rounded-2xl p-5">
          <p className="font-mono text-xs tracking-[0.24em] text-[var(--muted)]">{editing ? "EDIT TESTIMONIAL" : "NEW TESTIMONIAL"}</p>

          <div className="mt-4 space-y-4">
            <Field label="Client name">
              <TextInput value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} placeholder="Faculty / Mentor" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Role/title">
                <TextInput value={form.role_title ?? ""} onChange={(e) => setForm((p) => ({ ...p, role_title: e.target.value }))} placeholder="Academic Reference" />
              </Field>
              <Field label="Company">
                <TextInput value={form.company ?? ""} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="University" />
              </Field>
            </div>

            <Field label="Quote">
              <TextArea value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} rows={5} placeholder="Short quote…" />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Rating (1–5)">
                <TextInput type="number" min={1} max={5} value={form.rating ?? 5} onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))} />
              </Field>
              <Field label="Received at (YYYY-MM-DD)">
                <TextInput value={form.received_at ?? ""} onChange={(e) => setForm((p) => ({ ...p, received_at: e.target.value || null }))} placeholder="2024-05-01" />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={Boolean(form.verified)}
                onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
                className="h-4 w-4 rounded border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent"
              />
              Verified
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={Boolean(form.show_on_home)}
                onChange={(e) => setForm((p) => ({ ...p, show_on_home: e.target.checked }))}
                className="h-4 w-4 rounded border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-transparent"
              />
              Show on homepage
            </label>

            <Field label="Photo URL (optional)">
              <TextInput value={form.photo_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, photo_url: e.target.value }))} placeholder="https://…" />
            </Field>

            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => void save()}>
                Save
              </Btn>
              {editing ? <Btn onClick={startNew}>Cancel</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Media ---------------- */

type MediaRow = Tables<"media">;
type MediaInsert = TablesInsert<"media">;

function MediaAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MediaInsert>({ url: "", alt: "" });

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase.from("media").select("*").order("created_at", { ascending: false }).limit(300);
    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  async function add() {
    setError(null);
    const payload: MediaInsert = {
      url: form.url.trim(),
      alt: form.alt?.trim() ? form.alt.trim() : null,
    };
    if (!payload.url) {
      setError("URL is required.");
      return;
    }
    const { error: e } = await supabase.from("media").insert(payload);
    if (e) setError(e.message);
    else {
      setForm({ url: "", alt: "" });
      await refresh();
    }
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this media item?")) return;
    const { error: e } = await supabase.from("media").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// MEDIA"
        title="Media Library (URLs for now)"
        subtitle="Store media URLs + alt text. Upload automation comes later."
        right={<Btn onClick={() => void refresh()}>Refresh</Btn>}
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="glass neon rounded-2xl p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="URL">
            <TextInput value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://…" />
          </Field>
          <Field label="Alt text">
            <TextInput value={form.alt ?? ""} onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))} placeholder="Describe the image…" />
          </Field>
          <div className="flex items-end">
            <Btn variant="primary" onClick={() => void add()} className="w-full">
              Add
            </Btn>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <TableShell>
          {loading ? (
            <EmptyState title="Loading…" />
          ) : rows.length === 0 ? (
            <EmptyState title="No media yet." hint="Add URLs above." />
          ) : (
            <div>
              {rows.map((r) => (
                <Row key={r.id}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.alt ?? "—"}</p>
                      <p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">{r.url}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{fmtDateTime(r.created_at)}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="glass rounded-xl px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)] hover:neon focus-ring"
                      >
                        Open
                      </a>
                      <Btn variant="danger" onClick={() => void remove(r.id)}>
                        Delete
                      </Btn>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </TableShell>
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */

type MessageRow = Tables<"messages">;

function MessagesAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(300);
    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  async function setStatus(id: string, status: MessageRow["status"]) {
    const { error: e } = await supabase.from("messages").update({ status }).eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  async function remove(id: string) {
    // eslint-disable-next-line no-alert
    if (!window.confirm("Delete this message?")) return;
    const { error: e } = await supabase.from("messages").delete().eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// MESSAGES"
        title="Inbox"
        subtitle="Contact form submissions will appear here (Step 4 wires the public form)."
        right={<Btn onClick={() => void refresh()}>Refresh</Btn>}
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <TableShell>
        {loading ? (
          <EmptyState title="Loading…" />
        ) : rows.length === 0 ? (
          <EmptyState title="No messages yet." hint="Once the public contact form is wired, messages show here." />
        ) : (
          <div>
            {rows.map((m) => (
              <Row key={m.id}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{m.name}</p>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] text-[var(--muted)]">{m.status}</span>
                      {m.wants_consult && (
                        <span className="rounded-full border border-[color-mix(in_srgb,var(--accent)_55%,transparent)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                          consult
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {m.email} • {fmtDateTime(m.created_at)} • Subject: {m.subject ?? "—"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">{m.message}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Btn onClick={() => void setStatus(m.id, "read")}>Mark read</Btn>
                    <Btn onClick={() => void setStatus(m.id, "archived")}>Archive</Btn>
                    <Btn onClick={() => void setStatus(m.id, "spam")}>Spam</Btn>
                    <Btn variant="danger" onClick={() => void remove(m.id)}>
                      Delete
                    </Btn>
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </TableShell>
    </div>
  );
}

/* ---------------- Settings ---------------- */

type SettingsRow = Tables<"site_settings">;

function SettingsAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<SettingsRow | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const suggested = useMemo(() => {
    const base: Json = {
      hero: {
        name: "Rupesh Thakur",
        roles: [
          "Cybersecurity Student",
          "Network & Web Security Enthusiast",
          "Penetration Testing Learner",
          "Digital Forensics Analyst (Academic)",
          "CTF Participant",
        ],
        stats: [
          { label: "Years of Study", value: 3 },
          { label: "Security & Network Projects", value: 20 },
          { label: "Labs & Case Studies Completed", value: 15 },
        ],
      },
      about: {
        heading: "Securing Systems Through Knowledge, Practice, and Discipline",
      },
      contact: {
        email: "security@yourdomain.com",
        location: "Nepal (Remote-friendly)",
        availability: "Open to internships, research opportunities, and security projects",
        response_time: "Usually within 24–48 hours",
      },
    };
    return JSON.stringify(base, null, 2);
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    setOk(null);

    const { data, error: e } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (e) setError(e.message);

    setRow(data ?? null);
    setText(JSON.stringify((data?.settings ?? {}) as Json, null, 2));
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  async function save() {
    setError(null);
    setOk(null);

    let parsed: Json;
    try {
      parsed = JSON.parse(text) as Json;
    } catch {
      setError("Invalid JSON. Fix it before saving.");
      return;
    }

    const { error: e } = await supabase.from("site_settings").update({ settings: parsed }).eq("id", 1);
    if (e) setError(e.message);
    else {
      setOk("Saved.");
      await refresh();
      window.setTimeout(() => setOk(null), 1500);
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// SITE SETTINGS"
        title="Site Settings (JSON)"
        subtitle="Single source of truth for global site configuration."
        right={
          <>
            <Btn onClick={() => void refresh()}>Refresh</Btn>
            <Btn variant="primary" onClick={() => void save()}>
              Save
            </Btn>
          </>
        }
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
      {ok && <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-100">{ok}</div>}

      <div className="glass neon rounded-2xl p-5">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)]">
              Row: <span className="font-mono text-[var(--text)]">site_settings.id = 1</span> • Updated:{" "}
              <span className="font-mono text-[var(--text)]">{row?.updated_at ?? "—"}</span>
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">Current settings</p>
                <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={22} spellCheck={false} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Suggested starter template</p>
                <TextArea value={suggested} readOnly rows={22} spellCheck={false} />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Copy/paste into “Current settings”, customize, then Save.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Users (admin only) ---------------- */

type UserRow = Tables<"profiles">;

function UsersAdmin({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500);
    if (e) setError(e.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => void refresh(), [supabase]);

  async function setRole(id: string, role: UserRow["role"]) {
    const { error: e } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (e) setError(e.message);
    else await refresh();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="// USERS"
        title="User Management"
        subtitle="Promote/demote roles (admin only)."
        right={<Btn onClick={() => void refresh()}>Refresh</Btn>}
      />

      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <TableShell>
        {loading ? (
          <EmptyState title="Loading…" />
        ) : rows.length === 0 ? (
          <EmptyState title="No profiles found." />
        ) : (
          <div>
            {rows.map((u) => (
              <Row key={u.id}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u.display_name ?? u.id}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">{u.id}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Created: {fmtDateTime(u.created_at)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Select
                      aria-label="Role"
                      value={u.role}
                      onChange={(e) => void setRole(u.id, e.target.value as UserRow["role"])}
                      className="w-[160px]"
                    >
                      <option className="bg-black" value="admin">admin</option>
                      <option className="bg-black" value="editor">editor</option>
                      <option className="bg-black" value="viewer">viewer</option>
                    </Select>
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </TableShell>
    </div>
  );
}
