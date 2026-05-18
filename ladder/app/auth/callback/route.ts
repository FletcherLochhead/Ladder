import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth callback. Exchanges the `code` for a session, then redirects
 * to onboarding (if the profile is incomplete) or the requested `next` page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=callback", request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=callback", request.url),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=callback", request.url),
    );
  }

  // First-time user? Send them to onboarding.
  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text, course")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.resume_text || !profile?.course) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
