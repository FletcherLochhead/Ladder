"use client";

import { Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef, useState } from "react";

import { JobCard } from "@/components/dashboard/job-card";

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

type Filter = "all" | "high" | "interns";

export function DiscoveryClient({
  initialJobs,
  trackedJobIds,
}: {
  initialJobs: Job[];
  trackedJobIds: string[];
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [tracked, setTracked] = useState<Set<string>>(new Set(trackedJobIds));
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const rescanCountRef = useRef(0);
  const [rescanCount, setRescanCount] = useState(0);

  async function handleDiscover() {
    setStatus("running");
    setNote(null);
    try {
      const res = await fetch("/api/jobs/discover", { method: "POST" });
      if (!res.ok) throw new Error("discover failed");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setNote(`${data.jobs?.length ?? 0} matches ranked just now`);
      setStatus("idle");
      rescanCountRef.current += 1;
      setRescanCount(rescanCountRef.current);
    } catch {
      setStatus("error");
      setNote("Concierge stalled, try again in a moment.");
    }
  }

  async function handleTrack(job: Job) {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        job_id: job.id,
        company: job.company,
        position: job.title,
        stage: "wishlist",
      }),
    });
    if (res.ok) {
      setTracked((prev) => {
        const next = new Set(prev);
        next.add(job.id);
        return next;
      });
    }
  }

  const filtered = jobs.filter((j) => {
    if (filter === "high") return (j.ai_match_score ?? 0) >= 80;
    if (filter === "interns")
      return /\b(intern|graduate|grad|summer)\b/i.test(j.title);
    return true;
  });

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 glass-bar border-b border-hairline">
        <div className="mx-auto max-w-[1480px] px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
              Discovery · {filtered.length} of {jobs.length} matches
            </p>
            <h1 className="font-display text-2xl text-ink">
              Today&rsquo;s concierge feed
            </h1>
          </div>
          <button
            onClick={handleDiscover}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 bg-gradient-brand text-white px-5 py-3 text-sm rounded-md transition disabled:opacity-60"
          >
            {status === "running" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {status === "running" ? "Searching the web…" : "Run AI rescan"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] w-full px-8 py-10 flex flex-col gap-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-2">
              <span className="inline-block size-1.5 rounded-full bg-[var(--color-c-blue)] align-middle mr-2" />
              Live feed
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[1]">
              Real roles.{" "}
              <span className="text-gradient">Ranked against you.</span>
            </h2>
            {note && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-3 tabular">
                {note}
              </p>
            )}
          </div>
          <FilterTabs value={filter} onChange={setFilter} />
        </div>

        {status === "running" && jobs.length === 0 ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <div className="border border-hairline rounded-md bg-paper-strong/40 p-14 text-center">
            <p className="font-display text-2xl text-ink mb-2">
              {jobs.length === 0
                ? "No matches yet."
                : "No matches in this filter."}
            </p>
            <p className="text-sm text-mute mb-6 max-w-[460px] mx-auto leading-relaxed">
              {jobs.length === 0
                ? "Hit Run AI rescan and the concierge will scour the live web for current NZ roles ranked against your CV."
                : "Try a different filter, or run a fresh rescan."}
            </p>
          </div>
        ) : (
          <LayoutGroup>
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
              <AnimatePresence initial={false}>
                {filtered.map((job, i) => (
                  <motion.li
                    layout
                    key={job.id}
                    className="bg-paper"
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 240,
                        damping: 28,
                      },
                      duration: 0.5,
                      delay: Math.min(i * 0.045, 0.45),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ viewTransitionName: `card-${job.id}` }}
                  >
                    <JobCard
                      job={job}
                      rank={i + 1}
                      tracked={tracked.has(job.id)}
                      onTrack={() => handleTrack(job)}
                      rescanKey={rescanCount}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="bg-paper p-6 lg:p-7">
          <motion.div
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="h-3 w-8 bg-hairline rounded-sm" />
              <div className="h-7 w-12 bg-hairline rounded-sm" />
            </div>
            <div className="h-7 w-3/4 bg-hairline rounded-sm" />
            <div className="h-3 w-2/3 bg-hairline rounded-sm" />
            <div className="h-3 w-1/3 bg-hairline rounded-sm mb-3" />
            <div className="h-3 w-full bg-hairline rounded-sm" />
            <div className="h-3 w-5/6 bg-hairline rounded-sm" />
            <div className="mt-6 pt-5 border-t border-hairline flex justify-between">
              <div className="h-3 w-16 bg-hairline rounded-sm" />
              <div className="h-3 w-12 bg-hairline rounded-sm" />
            </div>
          </motion.div>
        </li>
      ))}
    </ul>
  );
}

function FilterTabs({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (v: Filter) => void;
}) {
  const items: { v: Filter; label: string }[] = [
    { v: "all", label: "All" },
    { v: "high", label: "High match" },
    { v: "interns", label: "Intern · Grad" },
  ];
  return (
    <div className="inline-flex p-0.5 bg-paper-strong rounded-md border border-hairline">
      {items.map((it) => {
        const active = value === it.v;
        return (
          <button
            key={it.v}
            onClick={() => onChange(it.v)}
            className={[
              "px-3 py-1.5 text-xs rounded transition font-mono uppercase tracking-[0.18em]",
              active
                ? "bg-paper text-ink shadow-card"
                : "text-mute hover:text-ink",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
