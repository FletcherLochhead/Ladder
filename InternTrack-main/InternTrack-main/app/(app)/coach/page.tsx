import { ArrowUpRight, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  STAGE_LABELS,
  type ApplicationStage,
  type InterviewFeedback,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const PRIORITY_STAGES: ApplicationStage[] = [
  "interview",
  "screening",
  "applied",
  "wishlist",
];

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/coach");

  const [{ data: applications }, { data: interviews }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, company, position, stage, updated_at")
      .eq("user_id", user.id),
    supabase
      .from("interviews")
      .select("id, company, ai_research, feedback, transcript, updated_at")
      .eq("user_id", user.id),
  ]);

  const interviewByCompany = new Map<
    string,
    {
      id: string;
      hasResearch: boolean;
      hasFeedback: boolean;
      transcriptLength: number;
    }
  >();
  for (const i of interviews ?? []) {
    interviewByCompany.set(i.company.toLowerCase(), {
      id: i.id,
      hasResearch: !!i.ai_research && Object.keys(i.ai_research as object).length > 0,
      hasFeedback: !!(i.feedback as InterviewFeedback | null)?.strengths
        ?.length,
      transcriptLength: Array.isArray(i.transcript) ? i.transcript.length : 0,
    });
  }
  void interviewByCompany;
  // (Unused for now but kept for future enrichment of the cards.)

  const ranked = (applications ?? []).slice().sort((a, b) => {
    const ai = PRIORITY_STAGES.indexOf(a.stage as ApplicationStage);
    const bi = PRIORITY_STAGES.indexOf(b.stage as ApplicationStage);
    const av = ai === -1 ? 99 : ai;
    const bv = bi === -1 ? 99 : bi;
    return av - bv;
  });

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 glass-bar border-b border-hairline">
        <div className="mx-auto max-w-[1280px] px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
              Coach · Interview studio
            </p>
            <h1 className="font-display text-2xl text-ink">
              Pick a company to rehearse
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] w-full px-8 py-10 flex flex-col gap-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-2">
            <span className="inline-block size-1.5 rounded-full bg-[var(--color-c-purple)] align-middle mr-2" />
            Voice-led mock interviews
          </p>
          <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[1]">
            Walk in{" "}
            <span className="text-gradient">prepared.</span>
          </h2>
          <p className="text-mute text-base leading-relaxed mt-4 max-w-[640px]">
            The studio researches the company, runs a voice-led interviewer in
            character, and grades your answers afterwards. Pick any tracked
            application below to start a session.
          </p>
        </div>

        {ranked.length === 0 ? (
          <div className="border border-hairline rounded-md bg-paper-strong/40 p-14 text-center">
            <p className="font-display text-2xl text-ink mb-2">
              No applications yet.
            </p>
            <p className="text-sm text-mute mb-6 max-w-[460px] mx-auto leading-relaxed">
              Track a few roles in the Discovery feed or sync your Gmail
              first, then come back to start a mock interview.
            </p>
            <Link
              href="/discovery"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm rounded-md bg-gradient-brand text-white"
            >
              Go to Discovery <ArrowUpRight className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
            {ranked.map((a) => {
              const iv = interviewByCompany.get(a.company.toLowerCase());
              const stage = a.stage as ApplicationStage;
              return (
                <li key={a.id} className="bg-paper p-6 flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl text-ink truncate">
                        {a.company}
                      </h3>
                      <p className="text-sm text-mute truncate">
                        {a.position ?? "·"}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute shrink-0">
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {iv?.hasResearch && (
                      <Tag>Dossier ready</Tag>
                    )}
                    {iv && iv.transcriptLength > 0 && (
                      <Tag>
                        {iv.transcriptLength} message
                        {iv.transcriptLength === 1 ? "" : "s"}
                      </Tag>
                    )}
                    {iv?.hasFeedback && <Tag>Graded</Tag>}
                    {!iv && <Tag muted>Not started</Tag>}
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-hairline">
                    <Link
                      href={`/company/${a.id}`}
                      className="inline-flex items-center gap-2 bg-gradient-brand text-white px-4 py-2 text-sm rounded-md transition"
                    >
                      {iv && iv.transcriptLength > 0 ? (
                        <>
                          Resume rehearsal
                          <MessageSquare className="size-4" />
                        </>
                      ) : (
                        <>
                          Start rehearsal
                          <Sparkles className="size-4" />
                        </>
                      )}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Tag({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={[
        "font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border",
        muted
          ? "border-hairline text-mute"
          : "border-[var(--color-c-blue)]/20 text-[var(--color-c-blue)] bg-[var(--color-c-blue)]/[0.06]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
