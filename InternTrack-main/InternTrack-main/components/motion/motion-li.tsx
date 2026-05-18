"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
};

export function MotionLi({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.7,
}: Props) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <li className={className}>{children}</li>;
  }
  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.li>
  );
}
