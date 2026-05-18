"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavRoute = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
};

export function SidebarNav({ routes }: { routes: NavRoute[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-px px-2.5">
      {routes.map((r) => {
        const active =
          pathname === r.href ||
          (r.href !== "/dashboard" && pathname.startsWith(r.href));
        return <NavItem key={r.href} {...r} active={active} />;
      })}
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: NavRoute & { active: boolean }) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition",
        active
          ? "bg-paper-strong text-ink"
          : "text-[var(--color-ink-mid)] hover:bg-paper-strong hover:text-ink",
      ].join(" ")}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-gradient-brand" />
      )}
      <span className="text-[var(--color-mute)] group-hover:text-ink transition">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span
          className={[
            "font-mono text-[10px] tabular px-1.5 py-px rounded-full",
            active
              ? "bg-paper border border-hairline text-ink"
              : "bg-[var(--color-hairline-strong)] text-mute",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
