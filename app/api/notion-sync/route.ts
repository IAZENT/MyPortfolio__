import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  return { ok: true as const };
}

export async function POST(req: Request) {
  const gate = await requireEditorOrAdmin();
  if (!gate.ok) return gate.res;

  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = body?.url?.trim();

  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: `Failed to fetch PDF (${res.status})` }, { status: 400 });
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  // dynamic import to be compatible with ESM shapes
  const pdfModule: any = await import("pdf-parse");
  const pdfParse = pdfModule.default ?? pdfModule;

  const out = await pdfParse(buf);
  const text = (out.text ?? "").trim();

  const firstLine =
    text
      .split("\n")
      .map((s: string) => s.trim())
      .find((s: string) => s.length > 6) ?? null;

  return NextResponse.json({
    ok: true,
    pages: out.numpages ?? null,
    titleGuess: firstLine?.slice(0, 120) ?? null,
    text: text.slice(0, 12000), // keep response small
  });
}
