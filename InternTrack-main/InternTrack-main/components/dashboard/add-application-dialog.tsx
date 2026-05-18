"use client";

import { Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";

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

export function AddApplicationDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (a: Application) => void;
}) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("applied");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  function resetForm() {
    setCompany("");
    setPosition("");
    setStage("applied");
    setNotes("");
    setErr(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company,
          position: position || null,
          stage,
          notes: notes || null,
          applied_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setErr(payload.error || "Couldn't save");
        return;
      }
      const data = await res.json();
      onCreated(data.application as Application);
      resetForm();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-paper border border-hairline rounded-md w-full max-w-[480px] p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
            New application
          </p>
          <button
            onClick={handleClose}
            className="text-mute hover:text-ink transition"
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="font-display text-3xl text-ink mb-6 leading-tight">
          Track manually.
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Company" required>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Partly"
              className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition placeholder:text-mute/60"
            />
          </Field>
          <Field label="Position">
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Software Engineer Intern"
              className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition placeholder:text-mute/60"
            />
          </Field>
          <Field label="Stage">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ApplicationStage)}
              className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition"
            >
              {APPLICATION_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Heard back via call from the recruiter."
              className="w-full bg-paper-strong/60 border border-hairline rounded-md text-ink p-3 outline-none focus:border-primary transition placeholder:text-mute/60 text-sm"
            />
          </Field>

          {err && (
            <p className="text-sm text-ink-soft border-l-2 border-primary pl-3 py-1.5 bg-paper-strong/50 rounded-sm">
              {err}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm rounded-sm text-mute hover:text-ink transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!company || pending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm rounded-sm hover:bg-[var(--color-c-deep)] transition disabled:opacity-60"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Add to tracker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}
