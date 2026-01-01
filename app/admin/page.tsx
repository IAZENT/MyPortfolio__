"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/database.types";
import AdminApp from "./AdminApp";

type ProfileRow = Pick<Tables<"profiles">, "id" | "role" | "display_name">;

const ALLOWED_ROLES: ProfileRow["role"][] = ["admin", "editor"];

export default async function AdminHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !ALLOWED_ROLES.includes(profile.role)) {
    redirect("/admin/login?reason=forbidden");
  }

  return (
    <div className="min-h-screen">
      <AdminApp profile={profile} />
    </div>
  );
}
