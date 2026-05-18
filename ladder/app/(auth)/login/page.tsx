import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(params.next || "/dashboard");

  return (
    <section className="min-h-[calc(100dvh-65px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[460px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-mute mb-6 flex items-center gap-3">
          <span className="inline-block size-1.5 rounded-full bg-primary" />
          Open the studio
        </p>
        <h1 className="font-display text-5xl lg:text-6xl text-ink leading-[0.95] mb-4">
          Welcome{" "}
          <span className="font-editorial italic text-primary">back.</span>
        </h1>
        <p className="text-mute text-base leading-relaxed mb-10 max-w-[420px]">
          Sign in to keep the concierge running, your tracker synced, and your
          interview prep at the ready.
        </p>
        <LoginForm next={params.next} error={params.error} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-10">
          By continuing you agree to our terms of service.
        </p>
      </div>
    </section>
  );
}
