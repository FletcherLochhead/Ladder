import { redirect } from "next/navigation";

import { DiscoveryClient } from "@/components/dashboard/discovery-client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/discovery");

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.resume_text) redirect("/onboarding");

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("ai_match_score", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("applications")
      .select("id, job_id")
      .eq("user_id", user.id),
  ]);

  return (
    <DiscoveryClient
      initialJobs={jobs ?? []}
      trackedJobIds={(applications ?? [])
        .map((a) => a.job_id)
        .filter((id): id is string => !!id)}
    />
  );
}
