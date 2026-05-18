import { NextResponse, type NextRequest } from "next/server";
import { google } from "googleapis";

import { buildOAuth2Client, encryptToken } from "@/lib/gmail/oauth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard?gmail=error", request.url));
  }

  const oauth2 = buildOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);

  if (!tokens.refresh_token) {
    return NextResponse.redirect(
      new URL("/dashboard?gmail=no_refresh", request.url),
    );
  }

  // Fetch the user's email so we can show it in the UI.
  let email = "";
  try {
    const oauth2api = google.oauth2({ version: "v2", auth: oauth2 });
    const me = await oauth2api.userinfo.get();
    email = me.data.email ?? "";
  } catch {
    // best-effort
  }

  // Verify the auth user owns this state value.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== state) {
    return NextResponse.redirect(new URL("/dashboard?gmail=unauth", request.url));
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      gmail_refresh_token_encrypted: encryptToken(tokens.refresh_token),
      gmail_email: email || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[gmail/callback] persist failed", error);
    return NextResponse.redirect(new URL("/dashboard?gmail=persist", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard?gmail=connected", request.url));
}
