import Link from "next/link";

import { LadderMark } from "@/components/brand/ladder-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <LadderMark size={28} />
            <span className="font-display text-xl tracking-tight font-semibold">
              Ladder
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute border border-hairline px-2 py-0.5 rounded-sm">
              AI career concierge
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-mute hover:text-foreground transition"
          >
            ← Back home
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
