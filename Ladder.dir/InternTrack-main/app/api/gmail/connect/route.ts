import { NextResponse } from "next/server";

import { GMAIL_SCOPES, buildOAuth2Client } from "@/lib/gmail/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    );
  }

  const oauth2 = buildOAuth2Client();
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state: user.id,
  });
  return NextResponse.redirect(url);
}
