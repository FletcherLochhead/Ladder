import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { openrouter } from "@/lib/ai/openrouter";
import {
  RESEARCH_COMPANY_SYSTEM,
  buildResearchCompanyUser,
} from "@/lib/ai/prompts";
import {
  buildFallbackCompanyResearch,
  getDemoCompanyResearch,
} from "@/lib/company/research-seed";
import { createClient } from "@/lib/supabase/server";
import type { CompanyResearch } from "@/lib/types";

export const maxDuration = 60;

const Body = z.object({
  company: z.string().min(1),
  role: z.string().nullish(),
});

const ResearchSchema = z.object({
  values: z.array(z.string()).max(7),
  recent_news: z.array(z.string()).max(7),
  culture_notes: z.array(z.string()).max(7),
  likely_questions: z.array(z.string()).max(7),
});

const RESEARCH_MODEL =
  process.env.OPENROUTER_RESEARCH_MODEL ?? "openai/gpt-5.4-mini:online";

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

  // Cache hit?
  const { data: existing } = await supabase
    .from("interviews")
    .select("id, ai_research")
    .eq("user_id", user.id)
    .ilike("company", parsed.data.company)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.ai_research) {
    return NextResponse.json({
      research: existing.ai_research as CompanyResearch,
      cached: true,
    });
  }

  const demoResearch = getDemoCompanyResearch(
    parsed.data.company,
    parsed.data.role,
  );
  if (demoResearch) {
    await persistResearch({
      supabase,
      interviewId: existing?.id ?? null,
      userId: user.id,
      company: parsed.data.company,
      research: demoResearch,
    });

    return NextResponse.json({
      research: demoResearch,
      cached: false,
      seeded: true,
    });
  }

  // Generate.
  let research: CompanyResearch;
  try {
    const { object } = await generateObject({
      model: openrouter.chat(RESEARCH_MODEL),
      schema: ResearchSchema,
      system: RESEARCH_COMPANY_SYSTEM,
      prompt: buildResearchCompanyUser({
        company: parsed.data.company,
        role: parsed.data.role,
      }),
      temperature: 0.4,
      maxOutputTokens: 2000,
    });
    research = object;
  } catch (err) {
    console.error("[company/research] failed, using fallback:", err);
    research = buildFallbackCompanyResearch(
      parsed.data.company,
      parsed.data.role,
    );
  }

  // Persist into interviews row (create if not present)
  await persistResearch({
    supabase,
    interviewId: existing?.id ?? null,
    userId: user.id,
    company: parsed.data.company,
    research,
  });

  return NextResponse.json({ research, cached: false });
}

async function persistResearch({
  supabase,
  interviewId,
  userId,
  company,
  research,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  interviewId: string | null;
  userId: string;
  company: string;
  research: CompanyResearch;
}) {
  if (interviewId) {
    await supabase
      .from("interviews")
      .update({ ai_research: research })
      .eq("id", interviewId);
    return;
  }

  await supabase.from("interviews").insert({
    user_id: userId,
    company,
    ai_research: research,
  });
}
