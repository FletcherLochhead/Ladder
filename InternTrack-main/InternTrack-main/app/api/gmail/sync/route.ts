import { NextResponse } from "next/server";

import {
  parseEmail,
  type EmailInput,
  type ParsedEmail,
} from "@/lib/gmail/parser";
import { seedEmails, seedParsedEmails } from "@/lib/gmail/seed";
import { fetchRecentMessages } from "@/lib/gmail/oauth";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("gmail_refresh_token_encrypted, gmail_email")
    .eq("id", user.id)
    .maybeSingle();

  // Source emails: real Gmail if connected, otherwise the seed.
  let inputs: EmailInput[];
  let mode: "real" | "seed" = "seed";

  if (profile?.gmail_refresh_token_encrypted) {
    try {
      const messages = await fetchRecentMessages({
        encryptedRefreshToken: profile.gmail_refresh_token_encrypted,
        maxResults: 60,
      });
      inputs = messages;
      mode = "real";
    } catch (err) {
      console.warn("[gmail/sync] real fetch failed, falling back to seed", err);
      inputs = seedEmails;
    }
  } else {
    inputs = seedEmails;
  }

  const parsed =
    mode === "seed"
      ? inputs.map((input) => ({
          input,
          parsed:
            seedParsedEmails[input.gmail_message_id] ?? blankParsedEmail(),
        }))
      : await mapPool(inputs, 4, async (m) => {
          const result = await parseEmail(m);
          return { input: m, parsed: result };
        });

  let applicationsUpserted = 0;
  let eventsInserted = 0;
  let applicationsDetected = 0;

  for (const { input, parsed: p } of parsed) {
    if (!p.is_application_related || !p.company) continue;
    applicationsDetected++;

    // Find or create the application row keyed by (user, company, role)
    const { data: existing } = await supabase
      .from("applications")
      .select("id, stage, last_email_at")
      .eq("user_id", user.id)
      .ilike("company", p.company)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let applicationId: string;
    if (existing) {
      applicationId = existing.id;
      const newer =
        new Date(input.received_at) >
        new Date(existing.last_email_at ?? "1970-01-01T00:00:00Z");
      if (newer) {
        await supabase
          .from("applications")
          .update({
            stage: p.stage ?? existing.stage,
            position: p.role ?? undefined,
            last_email_at: input.received_at,
            applied_at: p.applied_date ?? undefined,
          })
          .eq("id", applicationId);
        applicationsUpserted++;
      }
    } else {
      const { data: created, error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          company: p.company,
          position: p.role,
          stage: p.stage ?? "applied",
          applied_at: p.applied_date,
          last_email_at: input.received_at,
        })
        .select("id")
        .single();
      if (error || !created) continue;
      applicationId = created.id;
      applicationsUpserted++;
    }

    // Idempotent: check first, then insert if absent (works around Supabase
    // upsert's quirks with partial unique indexes).
    const { data: existingEvent } = await supabase
      .from("email_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("gmail_message_id", input.gmail_message_id)
      .maybeSingle();

    if (!existingEvent) {
      const { error: evErr } = await supabase.from("email_events").insert({
        user_id: user.id,
        application_id: applicationId,
        gmail_message_id: input.gmail_message_id,
        subject: input.subject,
        snippet: input.body.slice(0, 240),
        ai_classified_stage: p.stage,
        ai_summary: p.summary,
        received_at: input.received_at,
      });
      if (evErr) {
        console.warn("[gmail/sync] email_events insert failed:", evErr);
      } else {
        eventsInserted++;
      }
    }
  }

  const syncedAt = new Date().toISOString();

  await supabase
    .from("profiles")
    .update({ gmail_last_synced_at: syncedAt })
    .eq("id", user.id);

  const { applications, emailEvents } = await fetchFreshSyncState(
    supabase,
    user.id,
  );

  return NextResponse.json({
    mode,
    emails_seen: inputs.length,
    applications_detected: applicationsDetected,
    applications_upserted: applicationsUpserted,
    events_inserted: eventsInserted,
    gmail_last_synced_at: syncedAt,
    applications,
    email_events: emailEvents,
  });
}

async function fetchFreshSyncState(supabase: SupabaseClient, userId: string) {
  const [{ data: applications }, { data: rawEvents }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, job_id, company, position, stage, applied_at, last_email_at, notes, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("email_events")
      .select(
        "id, subject, snippet, ai_classified_stage, ai_summary, received_at, application_id",
      )
      .eq("user_id", userId)
      .order("received_at", { ascending: false, nullsFirst: false })
      .limit(50),
  ]);

  const appById = new Map(
    (applications ?? []).map((app) => [
      app.id,
      {
        id: app.id,
        company: app.company,
        position: app.position,
      },
    ]),
  );

  const emailEvents = (rawEvents ?? []).map((event) => ({
    id: event.id,
    subject: event.subject ?? "(no subject)",
    snippet: event.snippet ?? "",
    stage: event.ai_classified_stage,
    summary: event.ai_summary,
    receivedAt: event.received_at,
    application: event.application_id
      ? (appById.get(event.application_id) ?? null)
      : null,
  }));

  return {
    applications: applications ?? [],
    emailEvents,
  };
}

function blankParsedEmail(): ParsedEmail {
  return {
    is_application_related: false,
    company: null,
    role: null,
    stage: null,
    applied_date: null,
    summary: null,
  };
}

async function mapPool<T, U>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<U>,
): Promise<U[]> {
  const out: U[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return out;
}
