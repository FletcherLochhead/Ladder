import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { z } from "zod";

import { DEFAULT_MODEL, openrouter } from "@/lib/ai/openrouter";
import { INTERVIEWER_SYSTEM } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { CompanyResearch } from "@/lib/types";

export const maxDuration = 60;

const Body = z.object({
  company: z.string().min(1),
  role: z.string().nullish(),
  messages: z.array(
    z.object({
      id: z.string().optional(),
      role: z.enum(["user", "assistant", "system"]),
      parts: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        )
        .optional(),
      content: z.string().optional(),
    }),
  ),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Pull cached research for this company.
  const { data: row } = await supabase
    .from("interviews")
    .select("id, ai_research")
    .eq("user_id", user.id)
    .ilike("company", parsed.data.company)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const research = (row?.ai_research as CompanyResearch | null) ?? null;
  const researchBlob = research
    ? [
        `Values: ${research.values.join("; ")}`,
        `Signals: ${research.recent_news.join("; ")}`,
        `Culture: ${research.culture_notes.join("; ")}`,
        `Likely questions to draw from: ${research.likely_questions.join(" | ")}`,
      ].join("\n")
    : "(no cached research, improvise but stay grounded in plausible facts)";

  const modelMessages = await convertToModelMessages(
    parsed.data.messages as UIMessage[],
  );

  const result = streamText({
    model: openrouter.chat(DEFAULT_MODEL),
    system: INTERVIEWER_SYSTEM(
      parsed.data.company,
      researchBlob,
      parsed.data.role ?? null,
    ),
    messages: modelMessages,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
