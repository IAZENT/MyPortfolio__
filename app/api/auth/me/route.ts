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

  // If Supabase couldn't find a session, try a secure fallback: read the
  // `sb-access-token` cookie directly and call Supabase's `/auth/v1/user`
  // endpoint using the access token (this helps in some edge dev envs where
  // server-side session parsing can miss a freshly set HttpOnly cookie).
  if (error) {
    try {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      const tokenCookie = cookieStore.get ? cookieStore.get("sb-access-token") : undefined;
      const accessToken = tokenCookie?.value ?? null;

      if (accessToken) {
        if (process.env.NODE_ENV !== "production") console.log("[auth/me] fallback: found sb-access-token, attempting /auth/v1/user");
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          },
        });

        if (!res.ok) {
          if (process.env.NODE_ENV !== "production") {
            const text = await res.text().catch(() => "<no body>");
            console.log("[auth/me] fallback /auth/v1/user response:", res.status, text);
          }
        } else {
          const json = await res.json();
          if (json?.id) {
            if (process.env.NODE_ENV !== "production") console.log("[auth/me] fallback: got user via /auth/v1/user", { id: json.id, email: json.email });
            return NextResponse.json({ ok: true, user: json });
          }
        }
      } else {
        if (process.env.NODE_ENV !== "production") console.log("[auth/me] fallback: no sb-access-token cookie present");
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.log("[auth/me] fallback error:", e);
    }

    // Still failed — return original error
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user: data.user ?? null });
}
