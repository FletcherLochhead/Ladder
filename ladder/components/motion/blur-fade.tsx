"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type BlurFadeProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  blur?: number;
  inView?: boolean;
};

export function BlurFade({
  children,
  delay = 0,
  duration = 0.7,
  y = 12,
  blur = 8,
  inView = true,
  className,
  ...rest
}: BlurFadeProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    );
  }
  const initial = { opacity: 0, y, filter: `blur(${blur}px)` };
  const target = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div
      initial={initial}
      whileInView={inView ? target : undefined}
      animate={inView ? undefined : target}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
