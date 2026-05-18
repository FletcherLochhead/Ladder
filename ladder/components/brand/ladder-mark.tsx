type LadderMarkProps = {
  size?: number;
  className?: string;
};

export function LadderMark({ size = 28, className }: LadderMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="ldr-lagoon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-c-light)" />
          <stop offset="55%" stopColor="var(--color-c-blue)" />
          <stop offset="100%" stopColor="var(--color-c-deep)" />
        </linearGradient>
        <linearGradient id="ldr-sunrise" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-c-gold)" />
          <stop offset="100%" stopColor="var(--color-c-coral)" />
        </linearGradient>
      </defs>
      <rect x="2" y="18" width="7" height="12" rx="1.6" fill="var(--color-c-light)" />
      <rect x="3.4" y="22" width="4.2" height="0.9" rx="0.45" fill="#FFFFFF" opacity="0.85" />
      <rect x="3.4" y="24.6" width="4.2" height="0.9" rx="0.45" fill="#FFFFFF" opacity="0.85" />

      <rect x="11" y="11" width="7" height="19" rx="1.6" fill="var(--color-c-blue)" />
      <rect x="12.4" y="22" width="4.2" height="0.9" rx="0.45" fill="#FFFFFF" opacity="0.9" />
      <rect x="12.4" y="24.6" width="4.2" height="0.9" rx="0.45" fill="#FFFFFF" opacity="0.9" />

      <rect x="20" y="4" width="9" height="26" rx="1.8" fill="url(#ldr-lagoon)" />
      <path
        d="M25.6 9.5 l0.7 1.6 l1.6 0.7 l-1.6 0.7 l-0.7 1.6 l-0.7 -1.6 l-1.6 -0.7 l1.6 -0.7 z"
        fill="url(#ldr-sunrise)"
      />
    </svg>
  );
}

export function LadderWordmark({
  size = 28,
  className,
}: LadderMarkProps) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LadderMark size={size} />
      <span
        style={{
          fontWeight: 700,
          fontSize: size >= 32 ? 22 : 18,
          letterSpacing: "-0.02em",
        }}
      >
        Ladder
      </span>
    </span>
  );
}
