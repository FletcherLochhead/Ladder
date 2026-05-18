"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className}>
        {eyebrow}
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
      }}
    >
      {eyebrow ? (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {eyebrow}
        </motion.div>
      ) : null}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
          show: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function FadeUp({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.7,
  margin = "-12% 0px",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  margin?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
