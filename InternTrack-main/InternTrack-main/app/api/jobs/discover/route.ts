import { NextResponse } from "next/server";

import { discover } from "@/lib/jobs/discovery";
import { createClient } from "@/lib/supabase/server";

// Live AI web search + URL validation + CV ranking can stack to ~90-120s
// in the worst case. Bumped well above the default to give headroom.
export const maxDuration = 300;

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
    .select("resume_text")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.resume_text) {
    return NextResponse.json(
      { error: "Add a resume in onboarding first." },
      { status: 400 },
    );
  }

  let ranked: Awaited<ReturnType<typeof discover>>;
  try {
    ranked = await discover({ resume: profile.resume_text, limit: 12 });
  } catch (err) {
    console.error("[jobs/discover] rescan failed; preserving existing jobs", err);
    return preservedJobsResponse(
      supabase,
      user.id,
      "Rescan failed; kept existing matches.",
    );
  }

  if (ranked.length === 0) {
    return preservedJobsResponse(
      supabase,
      user.id,
      "Rescan returned no matches; kept existing matches.",
    );
  }

  const rows = ranked.map((r) => ({
    user_id: user.id,
    title: r.title,
    company: r.company,
    location: r.location,
    description: r.description,
    source_url: r.source_url,
    posted_at: r.posted_at,
    ai_match_score: r.score,
    ai_match_reasons: r.reasons,
  }));

  const { data: inserted, error } = await supabase
    .from("jobs")
    .insert(rows)
    .select("*");

  if (error || !inserted || inserted.length === 0) {
    console.error("[jobs/discover] insert failed; preserving existing jobs", error);
    return preservedJobsResponse(
      supabase,
      user.id,
      "Could not save new matches; kept existing matches.",
    );
  }

  const insertedIds = inserted.map((job) => job.id);
  const { error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("user_id", user.id)
    .not("id", "in", `(${insertedIds.join(",")})`);

  if (deleteError) {
    console.error("[jobs/discover] old batch cleanup failed", deleteError);
  }

  return NextResponse.json({ jobs: inserted, preserved: false });
}

async function preservedJobsResponse(
  supabase: SupabaseClient,
  userId: string,
  message: string,
) {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("ai_match_score", { ascending: false, nullsFirst: false })
    .limit(12);

  return NextResponse.json({
    jobs: jobs ?? [],
    preserved: true,
    message,
  });
}
