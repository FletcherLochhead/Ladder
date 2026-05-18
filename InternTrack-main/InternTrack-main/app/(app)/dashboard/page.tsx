import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { createClient } from "@/lib/supabase/server";
import { type ApplicationStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, course, resume_text, gmail_email, gmail_last_synced_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.resume_text) redirect("/onboarding");

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("ai_match_score", { ascending: false, nullsFirst: false })
      .limit(12),
    supabase
      .from("applications")
      .select(
        "id, job_id, company, position, stage, applied_at, last_email_at, notes, updated_at",
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <DashboardClient
      profile={{
        displayName: profile.display_name ?? user.email ?? "Student",
        course: profile.course ?? "UC student",
        gmailEmail: profile.gmail_email ?? null,
        gmailLastSyncedAt: profile.gmail_last_synced_at ?? null,
      }}
      initialJobs={jobs ?? []}
      initialApplications={(applications ?? []).map((a) => ({
        ...a,
        stage: a.stage as ApplicationStage,
      }))}
    />
  );
}
