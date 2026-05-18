import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STAGES, type ApplicationStage } from "@/lib/types";

const Body = z.object({
  job_id: z.string().uuid().nullish(),
  company: z.string().min(1).max(120),
  position: z.string().max(120).nullish(),
  stage: z.enum(APPLICATION_STAGES as unknown as [ApplicationStage, ...ApplicationStage[]]).default("wishlist"),
  applied_at: z.string().datetime().nullish(),
  notes: z.string().max(2000).nullish(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({ ...parsed.data, user_id: user.id })
    .select(
      "id, job_id, company, position, stage, applied_at, last_email_at, notes, updated_at",
    )
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to insert" },
      { status: 500 },
    );
  }
  return NextResponse.json({ application: data });
}
