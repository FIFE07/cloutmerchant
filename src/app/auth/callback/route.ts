import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email links (signup confirmation, password reset) land HERE — a route the
 * app owns (spec §5). We exchange the code for a session, then send the user
 * where they were going. This was a multi-day bug in the previous build;
 * it is deliberately small and boring.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const safeNext = next.startsWith("/") ? next : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Missing or invalid/expired code — send to login with a friendly flag.
  return NextResponse.redirect(`${origin}/login?link=expired`);
}
