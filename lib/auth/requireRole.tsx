import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/database.types";

type Role = Tables<"profiles">["role"];

export async function requireRole(allowedRoles: Role[]) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const profileAny = profile as { role: Role } | null;

  if (!profileAny || !allowedRoles.includes(profileAny.role)) {
    redirect("/admin/login?reason=forbidden");
  }

  return { supabase, user, profile };
}
