import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_MODEL, openrouter } from "@/lib/ai/openrouter";
import {
  GRADE_INTERVIEW_SYSTEM,
  buildGradeInterviewUser,
} from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, InterviewFeedback } from "@/lib/types";

export const maxDuration = 60;

const Body = z.object({
  company: z.string().min(1),
  transcript: z.array(
    z.object({
      role: z.enum(["interviewer", "user", "system"]),
      content: z.string(),
      timestamp: z.string(),
    }),
  ),
});

const FeedbackSchema = z.object({
  strengths: z.array(z.string()).max(5),
  gaps: z.array(z.string()).max(5),
  suggested_followups: z.array(z.string()).max(5),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let feedback: InterviewFeedback;
  try {
    const { object } = await generateObject({
      model: openrouter.chat(DEFAULT_MODEL),
      schema: FeedbackSchema,
      system: GRADE_INTERVIEW_SYSTEM,
      prompt: buildGradeInterviewUser({
        company: parsed.data.company,
        transcript: parsed.data.transcript,
      }),
      temperature: 0.4,
      maxOutputTokens: 1500,
    });
    feedback = object;
  } catch (err) {
    console.error("[interview/grade] failed:", err);
    return NextResponse.json({ error: "Grading failed" }, { status: 502 });
  }

  // Persist transcript + feedback
  const { data: existing } = await supabase
    .from("interviews")
    .select("id")
    .eq("user_id", user.id)
    .ilike("company", parsed.data.company)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const transcriptForDb: ChatMessage[] = parsed.data.transcript;

  if (existing) {
    await supabase
      .from("interviews")
      .update({ transcript: transcriptForDb, feedback })
      .eq("id", existing.id);
  } else {
    await supabase.from("interviews").insert({
      user_id: user.id,
      company: parsed.data.company,
      transcript: transcriptForDb,
      feedback,
    });
  }

  return NextResponse.json({ feedback });
}
