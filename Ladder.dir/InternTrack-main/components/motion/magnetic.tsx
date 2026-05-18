"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { useRef, type PointerEvent } from "react";

type MagneticProps = HTMLMotionProps<"div"> & {
  range?: number;
  strength?: number;
};

export function Magnetic({
  children,
  range = 90,
  strength = 0.35,
  className,
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > range) {
      x.set(0);
      y.set(0);
      return;
    }
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
