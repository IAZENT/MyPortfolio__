import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireEditorOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const gate = await requireEditorOrAdmin();
  if (!gate.ok) return gate.res;

  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url?.trim();

  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const res = await fetch(url);
  if (!res.ok)
    return NextResponse.json(
      { error: `Failed to fetch PDF (${res.status})` },
      { status: 400 }
    );

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  // Use dynamic import for pdf-parse to avoid ESM default export issues
  const pdfParse = (await import("pdf-parse")).default ?? (await import("pdf-parse"));

  const out = await pdfParse(buf);
  const text = (out.text ?? "").trim();

  const firstLine =
    text
      .split("\n")
      .map((s) => s.trim())
      .find((s) => s.length > 6) ?? null;

  return NextResponse.json({
    ok: true,
    pages: out.numpages ?? null,
    titleGuess: firstLine?.slice(0, 120) ?? null,
    text: text.slice(0, 12000), // keep response small
  });
}
