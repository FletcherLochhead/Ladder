import { redirect } from "next/navigation";

import { TrackerClient } from "@/components/dashboard/tracker-client";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/tracker");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, gmail_email, gmail_last_synced_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, job_id, company, position, stage, applied_at, last_email_at, notes, updated_at",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <TrackerClient
      profile={{
        displayName: profile?.display_name ?? user.email ?? "Student",
        gmailEmail: profile?.gmail_email ?? null,
        gmailLastSyncedAt: profile?.gmail_last_synced_at ?? null,
      }}
      initialApplications={(applications ?? []).map((a) => ({
        ...a,
        stage: a.stage as ApplicationStage,
      }))}
    />
  );
}
