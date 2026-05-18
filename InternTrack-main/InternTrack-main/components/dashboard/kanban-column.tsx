"use client";

import { useDroppable } from "@dnd-kit/core";

import { ApplicationCard } from "@/components/dashboard/application-card";
import type { ApplicationStage } from "@/lib/types";

type Application = {
  id: string;
  job_id: string | null;
  company: string;
  position: string | null;
  stage: ApplicationStage;
  applied_at: string | null;
  last_email_at: string | null;
  notes: string | null;
  updated_at: string;
};

const STAGE_TONE: Record<ApplicationStage, string> = {
  wishlist: "text-mute",
  applied: "text-ink",
  screening: "text-ink",
  interview: "text-primary",
  offer: "text-primary",
  rejected: "text-mute",
  withdrawn: "text-mute",
};

export function KanbanColumn({
  stage,
  label,
  applications,
  draggingId,
}: {
  stage: ApplicationStage;
  label: string;
  applications: Application[];
  draggingId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={
        "shrink-0 w-[280px] flex flex-col rounded-md border transition " +
        (isOver
          ? "border-primary bg-primary/5"
          : "border-hairline bg-paper-strong/40")
      }
    >
      <header className="px-4 py-3 border-b border-hairline flex items-center justify-between">
        <span
          className={
            "font-mono text-[10px] uppercase tracking-[0.32em] " +
            STAGE_TONE[stage]
          }
        >
          {label}
        </span>
        <span className="font-mono text-[11px] tabular text-mute">
          {applications.length}
        </span>
      </header>
      <ol className="flex flex-col gap-2.5 p-3 min-h-[120px]">
        {applications.map((a) => (
          <ApplicationCard
            key={a.id}
            app={a}
            hidden={a.id === draggingId}
          />
        ))}
        {applications.length === 0 && (
          <p className="font-editorial italic text-mute/60 text-xs px-2 py-3">
            empty
          </p>
        )}
      </ol>
    </div>
  );
}
