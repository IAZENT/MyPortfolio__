import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/database.types";
import AdminApp from "./AdminApp";

type ProfileRow = Pick<Tables<"profiles">, "id" | "role" | "display_name">;

const ALLOWED_ROLES: ProfileRow["role"][] = ["admin", "editor"];

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (process.env.NODE_ENV !== "production") {
    console.log("[rt-admin] supabase user:", user ? { id: user.id, email: user.email } : null);
  }

  // If Supabase did not detect a session server-side, try a secure fallback
  // using the sb-access-token cookie (helps when a freshly set HttpOnly cookie
  // hasn't been picked up by the server client yet).
  let resolvedUser = user as any | null;
  if (!resolvedUser) {
    try {
      const cookieStore = await import("next/headers").then((m) => m.cookies());
      const tokenCookie = cookieStore.get ? cookieStore.get("sb-access-token") : undefined;
      const accessToken = tokenCookie?.value ?? null;

      if (accessToken) {
        if (process.env.NODE_ENV !== "production")
          console.log("[rt-admin] fallback: found sb-access-token, attempting /auth/v1/user");

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
            console.log("[rt-admin] fallback /auth/v1/user response:", res.status, text);
          }
        } else {
          const json = await res.json();
          if (json?.id) {
            resolvedUser = json;
            if (process.env.NODE_ENV !== "production")
              console.log("[rt-admin] fallback: got user via /auth/v1/user", { id: json.id, email: json.email });
          }
        }
      } else {
        if (process.env.NODE_ENV !== "production") console.log("[rt-admin] fallback: no sb-access-token cookie present");
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.log("[rt-admin] fallback error:", e);
    }
  }

  if (!resolvedUser) redirect("/rt-admin-cosmic/login");

  let profile: ProfileRow | null = null;
  let profileError: any = null;

  try {
    const q = await supabase
      .from("profiles")
      .select("id, role, display_name")
      .eq("id", resolvedUser.id)
      .maybeSingle();
    profile = q.data as ProfileRow | null;
    profileError = q.error ?? null;
  } catch (e) {
    profileError = e;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[rt-admin] profile query:", { profile, error: profileError });
  }

  // If the profile query failed due to RLS triggering recursive policies (common
  // when policies call functions that select from the same table), fall back to
  // using the service_role key to fetch the profile directly via the REST API.
  if ((!profile && profileError) || (!profile && !profileError)) {
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (svcKey) {
      try {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${resolvedUser.id}&select=id,role,display_name`;
        const res = await fetch(url, {
          headers: {
            apikey: svcKey,
            Authorization: `Bearer ${svcKey}`,
          },
        });
        if (res.ok) {
          const rows = await res.json().catch(() => []);
          profile = (rows && rows.length > 0 ? rows[0] : null) as ProfileRow | null;
          profileError = null;
          if (process.env.NODE_ENV !== "production") console.log("[rt-admin] fetched profile via service role (dev)", profile);
        } else if (process.env.NODE_ENV !== "production") {
          const t = await res.text().catch(() => "<no body>");
          console.log("[rt-admin] service role /profiles response:", res.status, t);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.log("[rt-admin] service role fetch error:", e);
      }
    }
  }

  const profileAny = profile as ProfileRow | null;

  if (profileError || !profileAny || !ALLOWED_ROLES.includes(profileAny.role)) {
    redirect("/rt-admin-cosmic/login?reason=forbidden");
  }

  return (
    <div className="min-h-screen">
      <AdminApp profile={profileAny as ProfileRow} />
    </div>
  );
}
