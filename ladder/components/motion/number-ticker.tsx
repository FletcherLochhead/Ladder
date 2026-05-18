"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function NumberTicker({
  value,
  duration = 1.1,
  format = (n) => Math.round(n).toString(),
  className,
  delay = 0,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, delay, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(reduce ? value : display)}
    </span>
  );
}
