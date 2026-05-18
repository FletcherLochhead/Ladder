import { redirect } from "next/navigation";

import { InterviewStudio } from "@/components/interview/interview-studio";
import { createClient } from "@/lib/supabase/server";
import type {
  ChatMessage,
  CompanyResearch,
  InterviewFeedback,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/company/${appId}`);

  const { data: app } = await supabase
    .from("applications")
    .select(
      "id, company, position, stage, applied_at, last_email_at, notes, job_id",
    )
    .eq("id", appId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) redirect("/dashboard");

  const { data: interview } = await supabase
    .from("interviews")
    .select("id, company, ai_research, transcript, feedback, updated_at")
    .eq("user_id", user.id)
    .ilike("company", app.company)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <InterviewStudio
      application={{
        id: app.id,
        company: app.company,
        position: app.position,
      }}
      interview={
        interview
          ? {
              id: interview.id,
              research: interview.ai_research as CompanyResearch | null,
              transcript: interview.transcript as ChatMessage[],
              feedback: interview.feedback as InterviewFeedback | null,
            }
          : null
      }
    />
  );
}
