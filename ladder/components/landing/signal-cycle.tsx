"use client";

import { useEffect, useState } from "react";

const PANELS = [
  {
    code: "01",
    label: "Discovery",
    title: "Fresh roles ranked against the CV.",
    meta: "scored 4s ago",
    rows: [
      ["Partly", "94", "Christchurch · API + frontend"],
      ["Rocket Lab", "88", "Auckland · avionics software"],
      ["Stats NZ", "84", "Wellington · data internship"],
      ["Lumin", "82", "Christchurch · SaaS engineering"],
    ],
  },
  {
    code: "02",
    label: "Tracker",
    title: "Email signals become pipeline movement.",
    meta: "synced from Gmail",
    rows: [
      ["Partly", "Screening", "phone screen confirmed"],
      ["Trade Me", "Interview", "technical panel booked"],
      ["Canva", "Applied", "auto-reply received"],
      ["Beca", "Wishlist", "role saved from discovery"],
    ],
  },
  {
    code: "03",
    label: "Coach",
    title: "Company context turns into rehearsal.",
    meta: "studio ready",
    rows: [
      ["Values", "4", "summarised from company profile"],
      ["Questions", "6", "role-specific prompts"],
      ["Voice", "Live", "hold to answer"],
      ["Feedback", "3", "practice points after wrap"],
    ],
  },
];

export function SignalCycle({ mode = "normal" }: { mode?: "normal" | "ambient" }) {
  const [active, setActive] = useState(0);
  const panel = PANELS[active];

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % PANELS.length),
      4400,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={[
        "signal-console relative overflow-hidden rounded-lg border border-hairline bg-paper/88 shadow-[var(--shadow-pop)] backdrop-blur-xl",
        mode === "ambient" ? "mt-6" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 sm:px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-mute">
            Ladder studio
          </p>
          <p className="font-display text-xl sm:text-2xl text-ink mt-1 font-semibold">
            {panel.title}
          </p>
        </div>
        <span className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.22em] text-mute border border-hairline rounded-sm px-2 py-1">
          {panel.meta}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px bg-hairline">
        {PANELS.map((item, i) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setActive(i)}
            className={[
              "bg-paper px-3 py-3 text-left transition",
              i === active ? "text-ink" : "text-mute hover:text-ink",
            ].join(" ")}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] tabular">
              {item.code}
            </span>
            <span className="block font-display text-sm sm:text-base font-semibold mt-1">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <ol key={panel.code} className="p-4 sm:p-5 flex flex-col gap-2.5">
        {panel.rows.map(([left, right, note], i) => (
          <li
            key={`${panel.code}-${left}`}
            className="signal-row grid grid-cols-[1fr_auto] gap-4 rounded-md border border-hairline bg-white/70 px-4 py-3"
            style={{ animationDelay: `${i * 85}ms` }}
          >
            <div className="min-w-0">
              <p className="font-display text-base sm:text-lg text-ink truncate font-semibold">
                {left}
              </p>
              <p className="text-[12.5px] text-mute truncate mt-0.5">{note}</p>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-c-deep)] self-center tabular">
              {right}
            </span>
          </li>
        ))}
      </ol>

      <div className="border-t border-hairline bg-paper-strong/70 px-4 sm:px-5 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mute">
          UC career pipeline
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          <span className="size-1.5 rounded-full bg-[var(--color-c-gold)] pulse-dot" />
          live
        </span>
      </div>
    </div>
  );
}
