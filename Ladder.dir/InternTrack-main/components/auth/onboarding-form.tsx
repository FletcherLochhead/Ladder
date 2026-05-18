"use client";

import { ArrowUpRight, FileText, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

const SAMPLE_CV = `Alex Martin, University of Canterbury, BE(Hons) Software Engineering (Year 4, expected 2026)

Projects:
- InternTrack (current): full-stack Next.js app for AI-driven internship discovery and interview prep. TypeScript, Supabase, Vercel AI SDK.
- LeafLog: SwiftUI iOS app tracking native NZ tree species; image classification model in Core ML; 800 weekly users.
- Refactor of Partly's parts-catalogue search (open-source PR): improved P95 latency by ~38% via better Redis caching keys.

Coursework:
- ENCE361 Embedded Systems (A+), COSC362 Cryptography (A), COSC363 Computer Graphics (A), STAT318 Data Mining (A-).

Tools: TypeScript, Python, Go, React, Postgres, Docker, AWS Lambda, GitHub Actions.

Internship: Lumin (Summer 2025), built a PDF-import flow shipped to ~300k users; mentored by senior engineers across the docs runtime.`;

export function OnboardingForm({
  initial,
  redirectTo = "/dashboard",
  submitLabel = "Open the studio",
}: {
  initial: {
    displayName: string;
    course: string;
    graduationYear: number | null;
    resumeText: string;
  };
  redirectTo?: string;
  submitLabel?: string;
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [course, setCourse] = useState(initial.course);
  const [graduationYear, setGraduationYear] = useState(
    initial.graduationYear ?? new Date().getFullYear() + 1,
  );
  const [resumeText, setResumeText] = useState(initial.resumeText);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "parsing" | "done" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfStatus("parsing");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setResumeText(data.text);
      setPdfStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not extract text from PDF.");
      setPdfStatus("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Session expired. Sign in again.");
        return;
      }
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: displayName.trim() || null,
          course: course.trim() || null,
          graduation_year: graduationYear,
          resume_text: resumeText.trim() || null,
        });
      if (upsertErr) {
        setError(upsertErr.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-7 bg-paper border border-hairline rounded-md p-7 lg:p-9"
    >
      <div className="grid grid-cols-2 gap-6">
        <Field label="Display name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Alex Martin"
            className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition placeholder:text-mute/60"
          />
        </Field>
        <Field label="Graduation year">
          <input
            type="number"
            min={2024}
            max={2032}
            value={graduationYear}
            onChange={(e) => setGraduationYear(Number(e.target.value))}
            className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition tabular"
          />
        </Field>
      </div>
      <Field label="Course">
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="BE(Hons) Software Engineering"
          className="w-full bg-transparent border-b border-hairline text-ink py-2 px-0 outline-none focus:border-primary transition placeholder:text-mute/60"
        />
      </Field>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-end justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
            CV / résumé
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setResumeText(SAMPLE_CV)}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute hover:text-ink transition"
            >
              Use demo →
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfStatus === "parsing"}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary hover:underline underline-offset-4 disabled:opacity-50"
            >
              {pdfStatus === "parsing" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : pdfStatus === "done" ? (
                <FileText className="size-3" />
              ) : (
                <Upload className="size-3" />
              )}
              {pdfStatus === "parsing" ? "Extracting…" : pdfStatus === "done" ? "PDF loaded ✓" : "Upload PDF →"}
            </button>
          </div>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={14}
          placeholder="Paste your CV here. Bullet points, projects, courses, internships, keep it specific."
          className="w-full bg-paper-strong/60 border border-hairline text-ink rounded-md p-4 outline-none focus:border-primary transition placeholder:text-mute/60 leading-relaxed text-[14px] font-mono"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute text-right tabular">
          {resumeText.length.toLocaleString()} / 8,000 chars
        </p>
      </div>

      {error && (
        <p className="text-sm text-ink-soft border-l-2 border-primary pl-4 py-2 bg-paper-strong/50 rounded-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !course || !resumeText}
        className="self-start group inline-flex items-center gap-3 bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium rounded-sm hover:bg-[var(--color-c-deep)] transition disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
        )}
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
        {label}
      </span>
      {children}
    </label>
  );
}
