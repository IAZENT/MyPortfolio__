// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * This acts as a "proxy" for your old middleware.
 * All requests that match the config will go through this function first.
 */
export async function proxy(request: NextRequest) {
  // Run your session update logic
  await updateSession(request);

  // Continue the request normally
  return NextResponse.next();
}

// Matcher configuration
export const config = {
  // Apply this proxy to all routes except Next.js static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
