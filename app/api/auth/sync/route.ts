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

    if (process.env.NODE_ENV !== "production") {
      // helpful debug during development (do not log tokens in production)
      console.log("[auth/sync] set tokens (dev)");
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
