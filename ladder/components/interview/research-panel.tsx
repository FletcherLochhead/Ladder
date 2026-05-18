"use client";

import { Loader2 } from "lucide-react";

import type { CompanyResearch } from "@/lib/types";

export function ResearchPanel({
  research,
  status,
}: {
  research: CompanyResearch | null;
  status: "idle" | "loading" | "error";
}) {
  return (
    <aside className="bg-paper border border-hairline rounded-md sticky top-24">
      <header className="px-6 py-4 border-b border-hairline">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
          AI dossier
        </p>
      </header>

      {status === "loading" && !research && (
        <div className="px-6 py-12 flex flex-col items-center text-center gap-3">
          <Loader2 className="size-5 animate-spin text-primary" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
            Researching the company…
          </p>
          <p className="text-sm text-ink-soft max-w-[280px] leading-relaxed">
            Pulling values, recent moves, and the questions you&rsquo;re most
            likely to face.
          </p>
        </div>
      )}

      {status === "error" && !research && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">
            Research stalled. Try again from the wrap-up button.
          </p>
        </div>
      )}

      {research && (
        <div className="p-6 flex flex-col gap-7">
          <Section title="Values">
            <ul className="flex flex-wrap gap-2">
              {research.values.map((v, i) => (
                <li
                  key={i}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink border border-hairline px-2.5 py-1 rounded-sm bg-paper-strong/60"
                >
                  {v}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Signals">
            <ul className="flex flex-col gap-2.5">
              {research.recent_news.map((n, i) => (
                <li
                  key={i}
                  className="text-[13px] text-ink-soft leading-relaxed flex gap-2"
                >
                  <span className="text-primary font-display">·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Culture">
            <ul className="flex flex-col gap-2.5">
              {research.culture_notes.map((n, i) => (
                <li
                  key={i}
                  className="text-[13px] text-ink-soft leading-relaxed font-editorial italic"
                >
                  &ldquo;{n}&rdquo;
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Likely questions">
            <ol className="flex flex-col gap-3">
              {research.likely_questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-ink leading-snug">
                  <span className="font-mono tabular text-mute pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
