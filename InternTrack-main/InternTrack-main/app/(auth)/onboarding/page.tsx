import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, course, graduation_year, resume_text")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="min-h-[calc(100dvh-65px)] px-6 py-16">
      <div className="mx-auto max-w-[1280px] grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-mute mb-6 flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            One screen of setup
          </p>
          <h1 className="font-display text-5xl lg:text-[64px] text-ink leading-[0.95] mb-5">
            Tell the concierge{" "}
            <span className="font-editorial italic text-primary">about you.</span>
          </h1>
          <p className="text-mute text-base leading-relaxed mb-8 max-w-[440px]">
            Paste your CV, the more concrete the projects and courses, the
            better the AI ranks listings against your profile. We don&rsquo;t
            store your CV anywhere except your own row in our database.
          </p>
          <ul className="text-sm text-ink-soft leading-relaxed space-y-2 font-editorial italic">
            <li>· Course and graduation year shape the ranking</li>
            <li>· Specific projects beat generic skill lists</li>
            <li>· Mention companies / OSS contributions you&rsquo;ve touched</li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <OnboardingForm
            initial={{
              displayName: profile?.display_name ?? "",
              course: profile?.course ?? "",
              graduationYear: profile?.graduation_year ?? null,
              resumeText: profile?.resume_text ?? "",
            }}
          />
        </div>
      </div>
    </section>
  );
}
