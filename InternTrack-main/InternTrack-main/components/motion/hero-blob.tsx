"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroBlob() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{
          rotate: reduce ? 0 : 360,
          opacity: 1,
        }}
        transition={{
          rotate: { duration: 60, ease: "linear", repeat: Infinity },
          opacity: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
        }}
        className="absolute -top-[18%] -right-[20%] size-[820px] rounded-full blur-[80px]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(59,107,255,0.18), rgba(139,92,246,0.20), rgba(91,63,228,0.16), rgba(184,204,255,0.10), rgba(59,107,255,0.18))",
          mixBlendMode: "multiply",
        }}
      />
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{
          rotate: reduce ? 0 : -360,
          opacity: 1,
        }}
        transition={{
          rotate: { duration: 90, ease: "linear", repeat: Infinity },
          opacity: { duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
        }}
        className="absolute -bottom-[30%] -left-[15%] size-[680px] rounded-full blur-[100px]"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(91,63,228,0.14), rgba(59,107,255,0.10), rgba(184,204,255,0.16), rgba(139,92,246,0.10))",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
