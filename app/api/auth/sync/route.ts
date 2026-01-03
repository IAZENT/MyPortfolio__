import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { access_token, refresh_token } = body || {};

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "missing tokens" }, { status: 400 });
    }

    // set secure HttpOnly cookies so server components can read them
    const cookieOpts = { httpOnly: true, path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
    const cookieStore = await cookies();
    cookieStore.set({ name: "sb-access-token", value: access_token, ...cookieOpts });
    cookieStore.set({ name: "sb-refresh-token", value: refresh_token, ...cookieOpts });

    // helpful debug during development (do not log tokens in production)
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth/sync] set tokens (dev)");
    }

    // Try to validate the access token immediately and return the user payload to
    // allow the client to proceed without needing to poll /api/auth/me.
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (process.env.NODE_ENV !== "production") console.log("[auth/sync] fetched user (dev)", { id: json?.id, email: json?.email });
        return NextResponse.json({ ok: true, user: json });
      } else {
        if (process.env.NODE_ENV !== "production") {
          const text = await res.text().catch(() => "<no body>");
          console.log("[auth/sync] /auth/v1/user response:", res.status, text);
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.log("[auth/sync] user fetch error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
