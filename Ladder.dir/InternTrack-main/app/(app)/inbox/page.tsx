import { redirect } from "next/navigation";

import { InboxClient } from "@/components/dashboard/inbox-client";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/inbox");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gmail_email, gmail_last_synced_at")
    .eq("id", user.id)
    .maybeSingle();

  const [{ data: rawEvents }, { data: rawApps }] = await Promise.all([
    supabase
      .from("email_events")
      .select(
        "id, subject, snippet, ai_classified_stage, ai_summary, received_at, application_id",
      )
      .eq("user_id", user.id)
      .order("received_at", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("applications")
      .select("id, company, position")
      .eq("user_id", user.id),
  ]);

  const appById = new Map<
    string,
    { id: string; company: string; position: string | null }
  >();
  for (const a of rawApps ?? []) {
    appById.set(a.id, { id: a.id, company: a.company, position: a.position });
  }

  const rows = (rawEvents ?? []).map((e) => ({
    id: e.id,
    subject: e.subject ?? "(no subject)",
    snippet: e.snippet ?? "",
    stage: (e.ai_classified_stage as ApplicationStage | null) ?? null,
    summary: e.ai_summary,
    receivedAt: e.received_at,
    application: e.application_id ? (appById.get(e.application_id) ?? null) : null,
  }));

  return (
    <InboxClient
      profile={{
        gmailEmail: profile?.gmail_email ?? null,
        gmailLastSyncedAt: profile?.gmail_last_synced_at ?? null,
      }}
      initialEvents={rows}
    />
  );
}
