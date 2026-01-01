import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  // Perform the session update logic
  const response = updateSession(request);
  
  // Returning the response, you may modify it further if necessary
  return NextResponse.next();  // This allows the request to continue through the pipeline
}

// Matcher configuration for routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
