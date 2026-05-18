"use client";

import { ExternalLink, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { STAGE_LABELS, type ApplicationStage } from "@/lib/types";

type InboxRow = {
  id: string;
  subject: string;
  snippet: string;
  stage: ApplicationStage | null;
  summary: string | null;
  receivedAt: string | null;
  application: { id: string; company: string; position: string | null } | null;
};

type Profile = {
  gmailEmail: string | null;
  gmailLastSyncedAt: string | null;
};

type SyncResponse = {
  applications_detected?: number;
  applications_upserted?: number;
  events_inserted?: number;
  email_events?: InboxRow[];
};

const STAGE_TONE: Record<ApplicationStage, string> = {
  wishlist: "var(--color-stage-wishlist)",
  applied: "var(--color-stage-applied)",
  screening: "var(--color-stage-screening)",
  interview: "var(--color-stage-interview)",
  offer: "var(--color-stage-offer)",
  rejected: "var(--color-stage-rejected)",
  withdrawn: "var(--color-stage-withdrawn)",
};

export function InboxClient({
  profile,
  initialEvents,
}: {
  profile: Profile;
  initialEvents: InboxRow[];
}) {
  const [syncedEvents, setSyncedEvents] = useState<InboxRow[] | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "running" | "error">(
    "idle",
  );
  const [syncNote, setSyncNote] = useState<string | null>(
    profile.gmailLastSyncedAt
      ? `Last sync ${formatRel(profile.gmailLastSyncedAt)}`
      : "No sync yet",
  );
  const [, startTransition] = useTransition();
  const router = useRouter();
  const events = syncedEvents ?? initialEvents;

  async function handleSync() {
    setSyncStatus("running");
    setSyncNote(null);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as SyncResponse;
      if (Array.isArray(data.email_events)) {
        setSyncedEvents(data.email_events);
      }
      setSyncNote(
        `${data.applications_detected ?? data.applications_upserted ?? 0} applications detected · ${data.events_inserted ?? 0} email events parsed`,
      );
      setSyncStatus("idle");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSyncStatus("error");
      setSyncNote("Couldn't sync, try again.");
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-30 glass-bar border-b border-hairline">
        <div className="mx-auto max-w-[1280px] px-8 py-4 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
              Inbox · {events.length}{" "}
              {events.length === 1 ? "email" : "emails"}
            </p>
            <h1 className="font-display text-2xl text-ink">
              Parsed application mail
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!profile.gmailEmail && (
              <Link
                href="/api/gmail/connect"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-[var(--color-c-deep)] transition"
              >
                <ExternalLink className="size-4" />
                Connect Gmail
              </Link>
            )}
            <button
              onClick={handleSync}
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
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] w-full px-8 py-10 flex flex-col gap-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-2">
              <span className="inline-block size-1.5 rounded-full bg-[var(--color-c-blue)] align-middle mr-2" />
              {profile.gmailEmail ?? "Demo seed mode"}
            </p>
            <h2 className="font-display text-4xl lg:text-5xl text-ink leading-[1]">
              Every signal,{" "}
              <span className="text-gradient">classified.</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute tabular">
            {syncNote}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="border border-hairline rounded-md bg-paper-strong/40 p-14 text-center">
            <p className="font-display text-2xl text-ink mb-2">
              Inbox empty.
            </p>
            {!profile.gmailEmail ? (
              <>
                <p className="text-sm text-mute mb-6 max-w-[460px] mx-auto leading-relaxed">
                  Connect your Gmail account and the AI parser will read your
                  recent mail and classify every application thread.
                </p>
                <Link
                  href="/api/gmail/connect"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-[var(--color-c-deep)] transition"
                >
                  <ExternalLink className="size-4" />
                  Connect Gmail
                </Link>
              </>
            ) : (
              <p className="text-sm text-mute mb-6 max-w-[460px] mx-auto leading-relaxed">
                Hit <strong className="text-ink">Sync Gmail</strong> and the AI
                parser will read recent mail and classify every
                application thread into the right stage.
              </p>
            )}
          </div>
        ) : (
          <ol className="flex flex-col gap-px bg-hairline border border-hairline rounded-md overflow-hidden">
            {events.map((e) => (
              <li
                key={e.id}
                className="bg-paper p-5 lg:p-6 flex items-start gap-5 hover:bg-paper-strong/60 transition"
              >
                <div className="shrink-0 w-[110px]">
                  {e.stage && (
                    <span
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full"
                      style={{
                        background:
                          "color-mix(in srgb, " +
                          STAGE_TONE[e.stage] +
                          " 14%, transparent)",
                        color: STAGE_TONE[e.stage],
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: STAGE_TONE[e.stage] }}
                      />
                      {STAGE_LABELS[e.stage]}
                    </span>
                  )}
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute mt-2 tabular">
                    {e.receivedAt ? formatRel(e.receivedAt) : "·"}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    {e.application ? (
                      <Link
                        href={`/company/${e.application.id}`}
                        className="font-display text-lg text-ink hover:text-[var(--color-c-blue)] transition"
                      >
                        {e.application.company}
                      </Link>
                    ) : (
                      <span className="font-display text-lg text-mute">
                        Unmatched
                      </span>
                    )}
                    {e.application?.position && (
                      <span className="text-[12.5px] text-mute truncate">
                        · {e.application.position}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-ink leading-snug mb-1.5 truncate">
                    {e.subject}
                  </p>
                  {e.summary && (
                    <p className="font-editorial italic text-[13px] text-ink-soft leading-relaxed">
                      &ldquo;{e.summary}&rdquo;
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
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
