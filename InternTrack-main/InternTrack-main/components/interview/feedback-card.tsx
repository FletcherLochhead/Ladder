"use client";

import confetti from "canvas-confetti";
import { CheckCircle2, Compass, MessageSquare } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { NumberTicker } from "@/components/motion/number-ticker";
import type { InterviewFeedback } from "@/lib/types";

export function FeedbackCard({ feedback }: { feedback: InterviewFeedback }) {
  const reduce = useReducedMotion();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || reduce) return;
    fired.current = true;
    const colors = ["#3b6bff", "#8b5cf6", "#5b3fe4", "#f59e0b"];
    const burst = (origin: { x: number; y: number }) => {
      confetti({
        particleCount: 70,
        spread: 65,
        startVelocity: 38,
        ticks: 180,
        gravity: 1.05,
        scalar: 0.9,
        decay: 0.92,
        origin,
        colors,
        disableForReducedMotion: true,
      });
    };
    burst({ x: 0.5, y: 0.45 });
    setTimeout(() => burst({ x: 0.3, y: 0.55 }), 140);
    setTimeout(() => burst({ x: 0.7, y: 0.55 }), 220);
  }, [reduce]);

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
          Post-interview brief
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          ✓ Wrapped
        </span>
      </div>
      <h3 className="font-display text-3xl text-ink leading-[1.05]">
        Strengths,{" "}
        <span className="font-editorial italic text-primary">gaps,</span> and a
        couple of follow-ups.
      </h3>

      <div className="flex flex-wrap items-baseline gap-x-7 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
        <span className="flex items-baseline gap-1.5">
          <NumberTicker
            value={feedback.strengths.length}
            duration={0.9}
            className="font-display tabular text-2xl text-ink leading-none normal-case"
          />
          strengths
        </span>
        <span className="flex items-baseline gap-1.5">
          <NumberTicker
            value={feedback.gaps.length}
            duration={0.9}
            delay={0.1}
            className="font-display tabular text-2xl text-primary leading-none normal-case"
          />
          gaps
        </span>
        <span className="flex items-baseline gap-1.5">
          <NumberTicker
            value={feedback.suggested_followups.length}
            duration={0.9}
            delay={0.2}
            className="font-display tabular text-2xl text-ink leading-none normal-case"
          />
          to practise
        </span>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline rounded-md overflow-hidden mt-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
        }}
      >
        <Block
          tone="ink"
          icon={<CheckCircle2 className="size-4" />}
          label="Strengths"
          items={feedback.strengths}
        />
        <Block
          tone="primary"
          icon={<Compass className="size-4" />}
          label="Gaps"
          items={feedback.gaps}
        />
        <Block
          tone="ink"
          icon={<MessageSquare className="size-4" />}
          label="Practise next"
          items={feedback.suggested_followups}
        />
      </motion.div>
    </motion.div>
  );
}

function Block({
  tone,
  icon,
  label,
  items,
}: {
  tone: "ink" | "primary";
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  return (
    <motion.div
      className="bg-paper p-5 flex flex-col gap-3"
      variants={{
        hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      <p
        className={
          "font-mono text-[10px] uppercase tracking-[0.32em] flex items-center gap-2 " +
          (tone === "primary" ? "text-primary" : "text-mute")
        }
      >
        <span>{icon}</span>
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-mute font-editorial italic">
          (nothing notable to add)
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((s, i) => (
            <motion.li
              key={i}
              className="text-[13.5px] text-ink leading-relaxed flex gap-2"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.4 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="text-primary font-display">·</span>
              <span>{s}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
