import { NextResponse } from "next/server";

import { fetchRecentMessages } from "@/lib/gmail/oauth";
import { parseEmail } from "@/lib/gmail/parser";
import { createAdminClient } from "@/lib/supabase/server";

export const maxDuration = 300;

/**
 * Vercel Cron daily sync, iterates over connected users, pulls fresh
 * Gmail messages, parses, and upserts. Auth via CRON_SECRET in the
 * Authorization header (Vercel Cron sends "Bearer ${CRON_SECRET}").
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (
    !process.env.CRON_SECRET ||
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, gmail_refresh_token_encrypted")
    .not("gmail_refresh_token_encrypted", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let totalUsers = 0;
  let totalEvents = 0;

  for (const profile of profiles ?? []) {
    if (!profile.gmail_refresh_token_encrypted) continue;
    try {
      const messages = await fetchRecentMessages({
        encryptedRefreshToken: profile.gmail_refresh_token_encrypted,
        maxResults: 60,
      });
      for (const m of messages) {
        const parsed = await parseEmail(m);
        if (!parsed.is_application_related || !parsed.company) continue;

        const { data: existing } = await admin
          .from("applications")
          .select("id, stage, last_email_at")
          .eq("user_id", profile.id)
          .ilike("company", parsed.company)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let applicationId: string;
        if (existing) {
          applicationId = existing.id;
          const newer =
            new Date(m.received_at) >
            new Date(existing.last_email_at ?? "1970-01-01T00:00:00Z");
          if (newer) {
            await admin
              .from("applications")
              .update({
                stage: parsed.stage ?? existing.stage,
                position: parsed.role ?? undefined,
                last_email_at: m.received_at,
                applied_at: parsed.applied_date ?? undefined,
              })
              .eq("id", applicationId);
          }
        } else {
          const { data: created } = await admin
            .from("applications")
            .insert({
              user_id: profile.id,
              company: parsed.company,
              position: parsed.role,
              stage: parsed.stage ?? "applied",
              applied_at: parsed.applied_date,
              last_email_at: m.received_at,
            })
            .select("id")
            .single();
          if (!created) continue;
          applicationId = created.id;
        }

        const { data: existingEvent } = await admin
          .from("email_events")
          .select("id")
          .eq("user_id", profile.id)
          .eq("gmail_message_id", m.gmail_message_id)
          .maybeSingle();

        if (!existingEvent) {
          const { error: eventError } = await admin
            .from("email_events")
            .insert({
              user_id: profile.id,
              application_id: applicationId,
              gmail_message_id: m.gmail_message_id,
              subject: m.subject,
              snippet: m.body.slice(0, 240),
              ai_classified_stage: parsed.stage,
              ai_summary: parsed.summary,
              received_at: m.received_at,
            });
          if (eventError) {
            console.warn("[cron] email_events insert failed:", eventError);
          } else {
            totalEvents++;
          }
        }
      }
      await admin
        .from("profiles")
        .update({ gmail_last_synced_at: new Date().toISOString() })
        .eq("id", profile.id);
      totalUsers++;
    } catch (err) {
      console.warn(`[cron] sync failed for ${profile.id}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    synced_users: totalUsers,
    events: totalEvents,
  });
}
