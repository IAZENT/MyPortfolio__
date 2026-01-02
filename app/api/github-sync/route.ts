import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/database.types";

export const runtime = "nodejs";

type BlogInsert = TablesInsert<"blog_posts">;
type ProjectInsert = TablesInsert<"projects">;

function firstText(arr: Array<{ plain_text: string }> | undefined) {
  return (arr ?? []).map((t) => t.plain_text).join("").trim();
}

function getProp(
  page: PageObjectResponse,
  name: string
): PageObjectResponse["properties"][string] | undefined {
  return page.properties[name];
}

function getTitle(page: PageObjectResponse) {
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "title") return firstText(prop.title);
  }
  return "";
}

function richText(page: PageObjectResponse, name: string) {
  const prop = getProp(page, name);
  if (!prop) return "";
  if (prop.type === "rich_text") return firstText(prop.rich_text);
  if (prop.type === "title") return firstText(prop.title);
  return "";
}

function selectName(page: PageObjectResponse, name: string) {
  const prop = getProp(page, name);
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name ?? "";
  if (prop.type === "status") return prop.status?.name ?? "";
  return "";
}

function multiSelect(page: PageObjectResponse, name: string) {
  const prop = getProp(page, name);
  if (!prop) return [];
  if (prop.type === "multi_select") return prop.multi_select.map((x) => x.name).filter(Boolean);
  return [];
}

function safeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function blocksToMarkdown(notion: Client, blockId: string) {
  const lines: string[] = [];

  async function walk(id: string) {
    const res = await notion.blocks.children.list({ block_id: id, page_size: 100 });
    for (const b of res.results) {
      if (!("type" in b)) continue;
      const block = b as BlockObjectResponse;

      const type = block.type;
      const anyBlock = block as unknown as Record<string, unknown>;
      const obj = anyBlock[type] as Record<string, unknown> | undefined;

      const rt = (obj?.rich_text as Array<{ plain_text: string }> | undefined) ?? [];
      const text = firstText(rt);

      if (type === "heading_1") lines.push(`# ${text}`);
      else if (type === "heading_2") lines.push(`## ${text}`);
      else if (type === "heading_3") lines.push(`### ${text}`);
      else if (type === "paragraph") lines.push(text || "");
      else if (type === "bulleted_list_item") lines.push(`- ${text}`);
      else if (type === "numbered_list_item") lines.push(`1. ${text}`);
      else if (type === "quote") lines.push(`> ${text}`);
      else if (type === "code") {
        const lang = (obj?.language as string | undefined) ?? "";
        lines.push(`\`\`\`${lang}\n${text}\n\`\`\``);
      } else if (type === "divider") lines.push("---");
      else if (type === "callout") lines.push(`> ${text}`);
      else if (type === "to_do") lines.push(`- [ ] ${text}`);
      else if (type === "toggle") lines.push(text ? `**${text}**` : "");
      // skip unsupported types silently

      if (block.has_children) {
        await walk(block.id);
      }
    }
  }

  await walk(blockId);

  // collapse excessive blank lines
  return lines
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function requireEditorOrAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profileAny = profile as any;
  if (!profileAny || (profileAny.role !== "admin" && profileAny.role !== "editor")) {
    return { ok: false as const, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, supabase };
}

export async function POST() {
  const gate = await requireEditorOrAdmin();
  if (!gate.ok) return gate.res;
  const supabase = gate.supabase;

  const notionKey = process.env.NOTION_API_KEY;
  const blogDb = process.env.NOTION_BLOG_DATABASE_ID;
  const projectsDb = process.env.NOTION_PROJECTS_DATABASE_ID;

  if (!notionKey) {
    return NextResponse.json({ error: "Missing NOTION_API_KEY" }, { status: 400 });
  }

  const notion = new Client({ auth: notionKey });

  const results: { blog: number; projects: number } = { blog: 0, projects: 0 };

  if (blogDb) {
    const pages = await (notion.databases as any).query({ database_id: blogDb, page_size: 50 });
    const inserts: BlogInsert[] = [];

    for (const r of pages.results) {
      if (!("properties" in r)) continue;
      const page = r as PageObjectResponse;

      const title = richText(page, "Title") || getTitle(page) || "Untitled";
      const slug = richText(page, "Slug") || safeSlug(title);
      const excerpt = richText(page, "Excerpt") || richText(page, "Summary");
      const category = selectName(page, "Category") || richText(page, "Category");
      const tags = multiSelect(page, "Tags");
      const statusRaw = selectName(page, "Status");
      const status: BlogInsert["status"] =
        statusRaw.toLowerCase().includes("publish") ? "published" : "draft";

      const severityRaw = selectName(page, "Severity").toLowerCase();
      const severity: BlogInsert["severity"] =
        severityRaw === "critical" || severityRaw === "high" || severityRaw === "low" ? (severityRaw as BlogInsert["severity"]) : "medium";

      const coverUrl = richText(page, "Cover") || richText(page, "Cover URL");

      // Prefer page blocks -> markdown; fallback to a "Content" rich_text property
      const contentMd = (await blocksToMarkdown(notion, page.id)) || richText(page, "Content");

      inserts.push({
        slug,
        title,
        excerpt: excerpt || null,
        category: category || null,
        tags,
        status,
        severity,
        cover_url: coverUrl || null,
        content_md: contentMd || null,
        reading_time_minutes: null,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
    }

    if (inserts.length) {
      const { error } = await (supabase.from("blog_posts") as any).upsert(inserts as any, { onConflict: "slug" });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      results.blog = inserts.length;
    }
  }

  if (projectsDb) {
    const pages = await (notion.databases as any).query({ database_id: projectsDb, page_size: 50 });
    const inserts: ProjectInsert[] = [];

    for (const r of pages.results) {
      if (!("properties" in r)) continue;
      const page = r as PageObjectResponse;

      const title = richText(page, "Title") || getTitle(page) || "Untitled";
      const slug = richText(page, "Slug") || safeSlug(title);
      const summary = richText(page, "Summary") || richText(page, "Excerpt");
      const category = selectName(page, "Category") || richText(page, "Category");
      const tech = multiSelect(page, "Tech") || multiSelect(page, "Tech Stack");
      const gh = richText(page, "GitHub URL") || richText(page, "GitHub");
      const demo = richText(page, "Demo URL") || richText(page, "Demo");
      const featured = selectName(page, "Featured").toLowerCase() === "true" || richText(page, "Featured").toLowerCase() === "true";

      const contentMd = (await blocksToMarkdown(notion, page.id)) || richText(page, "Content");

      inserts.push({
        slug,
        title,
        summary: summary || null,
        category: category || null,
        tech_stack: tech,
        github_url: gh || null,
        demo_url: demo || null,
        content_md: contentMd || null,
        featured,
        security_score: null,
        status: "active",
        visibility: "public",
        access_password: null,
      });
    }

    if (inserts.length) {
      const { error } = await (supabase.from("projects") as any).upsert(inserts as any, { onConflict: "slug" });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      results.projects = inserts.length;
    }
  }

  return NextResponse.json({
    ok: true,
    synced: results,
    note: "Set NOTION_BLOG_DATABASE_ID / NOTION_PROJECTS_DATABASE_ID to enable each sync target.",
  });
}
