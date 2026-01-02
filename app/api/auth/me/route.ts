import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // helpful debug: show cookies and any Supabase error in dev
  if (process.env.NODE_ENV !== "production") {
    try {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      console.log("[auth/me] cookies:", cookieStore.getAll ? cookieStore.getAll() : cookieStore);
    } catch (e) {
      // ignore
    }
  }

  const { data, error } = await supabase.auth.getUser();

  if (process.env.NODE_ENV !== "production") {
    console.log("[auth/me] user:", data?.user ? { id: data.user.id, email: data.user.email } : null);
    if (error) console.log("[auth/me] error:", error);
  }

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, user: data.user ?? null });
}
