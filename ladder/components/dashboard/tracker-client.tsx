"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Loader2, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ApplicationCard } from "@/components/dashboard/application-card";
import { AddApplicationDialog } from "@/components/dashboard/add-application-dialog";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import {
  APPLICATION_STAGES,
  STAGE_LABELS,
  type ApplicationStage,
} from "@/lib/types";

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

type Profile = {
  displayName: string;
  gmailEmail: string | null;
  gmailLastSyncedAt: string | null;
};

export function TrackerClient({
  profile,
  initialApplications,
}: {
  profile: Profile;
  initialApplications: Application[];
}) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "error">(
    "idle",
  );
  const [syncNote, setSyncNote] = useState<string | null>(
    profile.gmailLastSyncedAt
      ? `Last sync ${formatRel(profile.gmailLastSyncedAt)}`
      : "Demo seed ready",
  );
  const [addOpen, setAddOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const groups = useMemo(() => {
    const map: Record<ApplicationStage, Application[]> = {
      wishlist: [],
      applied: [],
      screening: [],
      interview: [],
      offer: [],
      rejected: [],
      withdrawn: [],
    };
    for (const a of applications) map[a.stage].push(a);
    return map;
  }, [applications]);

  const draggingApp = applications.find((a) => a.id === draggingId) ?? null;

  function handleDragStart(e: DragStartEvent) {
    setDraggingId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setDraggingId(null);
    const overId = e.over?.id;
    if (!overId) return;
    const newStage = String(overId) as ApplicationStage;
    if (!APPLICATION_STAGES.includes(newStage)) return;

    const id = String(e.active.id);
    const current = applications.find((a) => a.id === id);
    if (!current || current.stage === newStage) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a)),
    );

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (!res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, stage: current.stage } : a)),
      );
    } else {
      router.refresh();
    }
  }

  async function handleSyncGmail() {
    setSyncStatus("running");
    setSyncNote(null);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      if (Array.isArray(data.applications)) {
        setApplications(
          (data.applications as Application[]).map((a) => ({
            ...a,
            stage: a.stage,
          })),
        );
      }
      setSyncNote(
        `${data.applications_detected ?? data.applications_upserted ?? 0} applications detected · ${data.events_inserted ?? 0} email events parsed`,
      );
      setSyncStatus("idle");
      startTransition(() => router.refresh());
    } catch {
      setSyncStatus("error");
      setSyncNote("Couldn't sync, try again.");
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 glass-bar border-b border-hairline">
        <div className="mx-auto max-w-[1480px] px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
              Tracker · {applications.length}{" "}
              {applications.length === 1 ? "application" : "applications"}
            </p>
            <h1 className="font-display text-2xl text-ink">Pipeline</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncGmail}
              disabled={syncStatus === "running"}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-md border border-hairline hover:border-ink hover:bg-paper-strong transition disabled:opacity-60"
            >
              {syncStatus === "running" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Sync Gmail
            </button>
            {!profile.gmailEmail && (
              <Link
                href="/api/gmail/connect"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-md border border-hairline hover:border-ink hover:bg-paper-strong transition"
              >
                Connect Gmail
              </Link>
            )}
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-md border border-hairline hover:border-ink hover:bg-paper-strong transition"
            >
              <Plus className="size-4" />
              Add manually
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] w-full px-8 py-10 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[1]">
            Drag freely.{" "}
            <span className="text-gradient">Stages live.</span>
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute tabular">
            {syncNote}
          </p>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4 mt-6">
            {APPLICATION_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                label={STAGE_LABELS[stage]}
                applications={groups[stage]}
                draggingId={draggingId}
              />
            ))}
          </div>
          <DragOverlay>
            {draggingApp ? (
              <ApplicationCard app={draggingApp} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>

        {applications.length === 0 && (
          <div className="border border-hairline rounded-md bg-paper-strong/40 p-12 text-center mt-4">
            <p className="font-display text-2xl text-ink mb-2">
              No applications yet.
            </p>
            <p className="text-sm text-mute mb-6 max-w-[460px] mx-auto leading-relaxed">
              Add one manually, or hit <strong className="text-ink">Sync Gmail</strong>{" "}
              and let the AI parse your inbox into the pipeline.
            </p>
          </div>
        )}
      </div>

      <AddApplicationDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(a) => setApplications((prev) => [a, ...prev])}
      />
    </div>
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
