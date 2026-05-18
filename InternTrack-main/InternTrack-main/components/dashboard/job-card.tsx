"use client";

import { ArrowUpRight, Check, Plus } from "lucide-react";

import { NumberTicker } from "@/components/motion/number-ticker";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  source_url: string;
  ai_match_score: number | null;
  ai_match_reasons: string[] | null;
};

export function JobCard({
  job,
  rank,
  tracked,
  onTrack,
  rescanKey = 0,
}: {
  job: Job;
  rank: number;
  tracked: boolean;
  onTrack: () => void;
  rescanKey?: number;
}) {
  const score = job.ai_match_score ? Math.round(job.ai_match_score) : null;
  const reasons = job.ai_match_reasons ?? [];
  return (
    <div className="p-6 lg:p-7 flex flex-col h-full group">
      <div className="flex items-baseline justify-between mb-5">
        <span className="font-mono text-[11px] tabular text-mute tracking-wider">
          {String(rank).padStart(2, "0")}
        </span>
        {score !== null && (
          <span
            className="font-display tabular text-3xl text-primary leading-none"
            aria-label={`Match score ${score} of 100`}
          >
            <NumberTicker
              key={`${job.id}-${rescanKey}`}
              value={score}
              duration={1.05}
              delay={Math.min(rank * 0.04, 0.45)}
            />
          </span>
        )}
      </div>
      <h3 className="font-display text-2xl text-ink leading-tight mb-1">
        {job.company}
      </h3>
      <p className="text-sm text-mute mb-1.5 truncate">{job.title}</p>
      {job.location && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mb-5 tabular">
          {job.location}
        </p>
      )}

      {reasons.length > 0 && (
        <div className="mb-6 mt-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-mute mb-2.5">
            Why you fit
          </p>
          <ul className="flex flex-col gap-2">
          {reasons.slice(0, 2).map((r, i) => (
            <li
              key={i}
              className="text-[13px] text-ink-soft leading-relaxed font-editorial italic flex gap-2"
            >
              <span className="text-primary">·</span>
              <span>&ldquo;{r}&rdquo;</span>
            </li>
          ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-5 border-t border-hairline flex items-center justify-between gap-3">
        <button
          onClick={onTrack}
          disabled={tracked}
          className={
            "inline-flex items-center gap-1.5 text-sm transition disabled:cursor-default" +
            (tracked
              ? " text-mute"
              : " text-ink hover:text-primary cursor-pointer")
          }
        >
          {tracked ? (
            <>
              <Check className="size-4" /> Tracking
            </>
          ) : (
            <>
              <Plus className="size-4" /> Track
            </>
          )}
        </button>
        <a
          href={job.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-mute hover:text-primary transition"
        >
          Source
          <ArrowUpRight className="size-3.5 transition group-hover:rotate-45" />
        </a>
      </div>
    </div>
  );
}
