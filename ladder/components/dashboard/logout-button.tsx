"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function handle() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={handle}
      title="Sign out"
      className="text-mute hover:text-ink transition"
    >
      {children}
    </button>
  );
}
