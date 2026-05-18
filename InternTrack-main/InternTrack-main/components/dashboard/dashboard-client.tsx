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
import {
  Loader2,
  Mail,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ApplicationCard } from "@/components/dashboard/application-card";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import { JobCard } from "@/components/dashboard/job-card";
import { AddApplicationDialog } from "@/components/dashboard/add-application-dialog";
import {
  APPLICATION_STAGES,
  STAGE_LABELS,
  type ApplicationStage,
} from "@/lib/types";

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
  course: string;
  gmailEmail: string | null;
  gmailLastSyncedAt: string | null;
};

export function DashboardClient({
  profile,
  initialJobs,
  initialApplications,
}: {
  profile: Profile;
  initialJobs: Job[];
  initialApplications: Application[];
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [discoveryStatus, setDiscoveryStatus] = useState<
    "idle" | "running" | "error"
  >("idle");
  const [discoveryNote, setDiscoveryNote] = useState<string | null>(null);
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

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a)),
    );

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (!res.ok) {
      // Rollback
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, stage: current.stage } : a)),
      );
    } else {
      router.refresh();
    }
  }

  async function handleDiscover() {
    setDiscoveryStatus("running");
    setDiscoveryNote(null);
    try {
      const res = await fetch("/api/jobs/discover", { method: "POST" });
      if (!res.ok) throw new Error("Discovery failed");
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setDiscoveryNote(
        data.preserved
          ? (data.message ?? "Kept existing matches; rescan returned nothing.")
          : `${data.jobs?.length ?? 0} matches ranked just now`,
      );
      setDiscoveryStatus("idle");
    } catch {
      setDiscoveryStatus("error");
      setDiscoveryNote("Concierge stalled, try again in a moment.");
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
      const created = (await res.json()).application as Application;
      setApplications((prev) => [created, ...prev]);
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-hairline">
        <div className="mx-auto max-w-[1480px] px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
              Studio · {greeting()} {profile.displayName.split(" ")[0]}
            </p>
            <h1 className="font-display text-2xl text-ink">
              Today&rsquo;s concierge
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncGmail}
              disabled={syncStatus === "running"}
              className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm border border-hairline hover:border-ink hover:bg-paper-strong transition disabled:opacity-60"
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
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm border border-hairline hover:border-ink hover:bg-paper-strong transition"
              >
                Connect Gmail
              </Link>
            )}
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm border border-hairline hover:border-ink hover:bg-paper-strong transition"
            >
              <Plus className="size-4" />
              Add manually
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] w-full px-8 py-10 flex flex-col gap-12">
        {/* DISCOVERY PANEL */}
        <section>
          <div className="flex items-end justify-between mb-6 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-2 flex items-center gap-3">
                <span className="inline-block size-1.5 rounded-full bg-primary" />
                Concierge · Discovery
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[0.95]">
                Today&rsquo;s{" "}
                <span className="font-editorial italic text-primary">
                  matches.
                </span>
              </h2>
              {discoveryNote && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-3 tabular">
                  {discoveryNote}
                </p>
              )}
            </div>
            <button
              onClick={handleDiscover}
              disabled={discoveryStatus === "running"}
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 text-sm rounded-sm hover:bg-[var(--color-c-deep)] transition disabled:opacity-60"
            >
              {discoveryStatus === "running" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {discoveryStatus === "running"
                ? "Ranking against your CV…"
                : "Run AI rescan"}
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="border border-hairline rounded-md p-10 text-center bg-paper-strong/40">
              <p className="font-display text-2xl text-ink mb-2">
                No matches yet.
              </p>
              <p className="text-sm text-mute mb-6 max-w-[420px] mx-auto">
                Hit <strong className="text-ink">Run AI rescan</strong> and
                Ladder will rank a fresh slate of UC-relevant roles
                against your CV.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
              {jobs.map((job, i) => (
                <li key={job.id} className="bg-paper">
                  <JobCard
                    job={job}
                    rank={i + 1}
                    tracked={applications.some((a) => a.job_id === job.id)}
                    onTrack={() => handleTrack(job)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* KANBAN */}
        <section>
          <div className="flex items-end justify-between mb-6 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-2 flex items-center gap-3">
                <span className="inline-block size-1.5 rounded-full bg-primary" />
                Tracker · {applications.length}{" "}
                {applications.length === 1 ? "application" : "applications"}
              </p>
              <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[0.95]">
                Pipeline.{" "}
                <span className="font-editorial italic text-primary">
                  Drag freely.
                </span>
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-3 tabular">
                {syncNote}
              </p>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-3 overflow-x-auto pb-4">
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
        </section>
      </div>

      <AddApplicationDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(a) => setApplications((prev) => [a, ...prev])}
      />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up,";
  if (h < 12) return "Morning,";
  if (h < 17) return "Afternoon,";
  if (h < 22) return "Evening,";
  return "Late one,";
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
