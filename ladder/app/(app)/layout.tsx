import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Compass,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Settings,
} from "lucide-react";

import { LadderMark } from "@/components/brand/ladder-mark";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStage } from "@/lib/types";

const ACTIVE_STAGES: ApplicationStage[] = ["applied", "screening", "interview"];

const STAGE_TONE: Record<ApplicationStage, string> = {
  wishlist: "var(--color-stage-wishlist)",
  applied: "var(--color-stage-applied)",
  screening: "var(--color-stage-screening)",
  interview: "var(--color-stage-interview)",
  offer: "var(--color-stage-offer)",
  rejected: "var(--color-stage-rejected)",
  withdrawn: "var(--color-stage-withdrawn)",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: apps }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, course, avatar_url, gmail_email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("stage")
      .eq("user_id", user.id),
  ]);

  const stageCounts = (apps ?? []).reduce<Record<ApplicationStage, number>>(
    (acc, a) => {
      const s = a.stage as ApplicationStage;
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<ApplicationStage, number>,
  );
  const liveCount = ACTIVE_STAGES.reduce(
    (sum, s) => sum + (stageCounts[s] ?? 0),
    0,
  );
  const offerCount = stageCounts.offer ?? 0;

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:flex flex-col border-r border-hairline bg-paper sticky top-0 h-dvh">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-hairline">
          <LadderMark size={28} />
          <div>
            <Link
              href="/"
              className="font-display text-lg font-semibold tracking-tight text-ink"
            >
              Ladder
            </Link>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-mute mt-0.5">
              AI career concierge
            </p>
          </div>
        </div>

        <SidebarSection label="Concierge" />
        <SidebarNav
          routes={[
            {
              href: "/dashboard",
              label: "Dashboard",
              icon: <LayoutDashboard className="size-4" />,
            },
            {
              href: "/discovery",
              label: "Discovery",
              icon: <Compass className="size-4" />,
            },
            {
              href: "/tracker",
              label: "Tracker",
              icon: <Layers className="size-4" />,
              badge: liveCount > 0 ? String(liveCount) : undefined,
            },
            {
              href: "/inbox",
              label: "Inbox",
              icon: <Mail className="size-4" />,
            },
            {
              href: "/coach",
              label: "Coach",
              icon: <MessageSquare className="size-4" />,
            },
          ]}
        />

        <SidebarSection label="Pipeline" />
        <div className="px-4 pb-2">
          <p className="text-[12.5px] text-mute mb-2.5 leading-snug">
            <b className="text-ink">{liveCount} live</b>{" "}
            {liveCount === 1 ? "application" : "applications"} ·{" "}
            <b className="text-ink">
              {offerCount} offer{offerCount === 1 ? "" : "s"}
            </b>
          </p>
          <PipelineBar counts={stageCounts} />
        </div>

        <div className="mt-auto border-t border-hairline p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-paper-strong transition">
            <div className="size-8 rounded-full bg-gradient-brand text-white grid place-items-center text-[11px] font-semibold tracking-wide shrink-0">
              {profile?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="size-full rounded-full object-cover"
                />
              ) : (
                initialsOf(profile?.display_name ?? user.email ?? "?")
              )}
            </div>
            <Link href="/settings" className="flex-1 min-w-0 group">
              <p className="text-[13px] font-semibold text-ink truncate group-hover:text-primary transition">
                {profile?.display_name ?? user.email}
              </p>
              <p className="text-[11px] text-mute truncate">
                {profile?.course ?? "Student"}
              </p>
            </Link>
            <Link
              href="/settings"
              className="text-mute hover:text-ink transition p-1"
              title="Edit profile"
            >
              <Settings className="size-4" />
            </Link>
            <LogoutButton>
              <LogOut className="size-4" />
            </LogoutButton>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex flex-col">{children}</main>
    </div>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mute-soft)]">
      {label}
    </div>
  );
}

function PipelineBar({
  counts,
}: {
  counts: Record<ApplicationStage, number>;
}) {
  const order: ApplicationStage[] = [
    "wishlist",
    "applied",
    "screening",
    "interview",
    "offer",
  ];
  const total = order.reduce((s, k) => s + (counts[k] ?? 0), 0);
  if (total === 0) {
    return (
      <div className="h-1.5 rounded-full bg-[var(--color-hairline-strong)]" />
    );
  }
  return (
    <div className="flex gap-px h-1.5 rounded-full overflow-hidden bg-[var(--color-hairline-strong)]">
      {order.map((s) => {
        const n = counts[s] ?? 0;
        if (!n) return null;
        return (
          <div
            key={s}
            title={`${s}: ${n}`}
            style={{
              width: `${(n / total) * 100}%`,
              background: STAGE_TONE[s],
            }}
          />
        );
      })}
    </div>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
}
