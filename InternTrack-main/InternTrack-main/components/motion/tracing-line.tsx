"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

export function TracingLine({
  className,
  height = "100%",
  color = "url(#tracing-gradient)",
}: {
  className?: string;
  height?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });
  const scaleY = useTransform(smooth, [0, 1], [0, 1]);
  if (reduce) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", top: 0, bottom: 0, width: "2px", height }}
    >
      <svg
        width="2"
        height="100%"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient
            id="tracing-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#3b6bff" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#5b3fe4" />
          </linearGradient>
        </defs>
        <line
          x1="1"
          x2="1"
          y1="0"
          y2="100"
          stroke="var(--color-hairline)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <motion.div
        style={{
          scaleY,
          transformOrigin: "0% 0%",
          background: color,
          width: "2px",
          height: "100%",
        }}
        className="absolute inset-y-0"
      />
    </div>
  );
}
