"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";

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

export function ApplicationCard({
  app,
  hidden = false,
  dragging = false,
}: {
  app: Application;
  hidden?: boolean;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: app.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: hidden ? 0.18 : 1,
    viewTransitionName: dragging ? undefined : `app-${app.id}`,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={
        "group bg-paper border border-hairline rounded-md p-3.5 cursor-grab active:cursor-grabbing transition " +
        (dragging
          ? "shadow-[0_24px_48px_-16px_rgba(23,23,23,0.25)] rotate-[-1deg]"
          : "hover:border-ink hover:-translate-y-0.5")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4
            className="font-display text-lg text-ink leading-tight truncate"
            style={{ viewTransitionName: dragging ? undefined : `app-title-${app.id}` }}
          >
            {app.company}
          </h4>
          {app.position && (
            <p className="text-[12px] text-mute truncate">{app.position}</p>
          )}
        </div>
        <Link
          href={`/company/${app.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-mute hover:text-primary transition shrink-0 -mr-1"
          title="Open interview studio"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
      {app.last_email_at && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-3 flex items-center gap-1.5">
          <Mail className="size-3" />
          Last email {formatRel(app.last_email_at)}
        </p>
      )}
      {!app.last_email_at && app.applied_at && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-3 tabular">
          Applied {formatRel(app.applied_at)}
        </p>
      )}
    </article>
  );
}

function formatRel(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
