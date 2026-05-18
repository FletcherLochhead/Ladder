import { redirect } from "next/navigation";
import Link from "next/link";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, course, graduation_year, resume_text, gmail_email, gmail_last_synced_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-hairline">
        <div className="mx-auto max-w-[1480px] px-8 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
            Profile
          </p>
          <h1 className="font-display text-2xl text-ink">Your details.</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] w-full px-8 py-10">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-4">
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Update your name, course, or CV any time. The AI uses your CV text
              to rank job matches — keep it current and specific.
            </p>
            <ul className="text-sm text-ink-soft leading-relaxed space-y-2 font-editorial italic">
              <li>· Specific projects beat generic skill lists</li>
              <li>· Upload a PDF or paste plain text</li>
              <li>· Changes take effect on the next AI rescan</li>
            </ul>
            <div className="mt-8 border border-hairline rounded-md bg-paper-strong/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute mb-2">
                Gmail
              </p>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                {profile?.gmail_email
                  ? `Connected as ${profile.gmail_email}.`
                  : "Seed sync works for demo mode. Connect Gmail to read real application mail."}
              </p>
              <Link
                href="/api/gmail/connect"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm rounded-md border border-hairline hover:border-ink hover:bg-paper transition"
              >
                {profile?.gmail_email ? "Reconnect Gmail" : "Connect Gmail"}
              </Link>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <OnboardingForm
              redirectTo="/dashboard"
              submitLabel="Save changes"
              initial={{
                displayName: profile?.display_name ?? "",
                course: profile?.course ?? "",
                graduationYear: profile?.graduation_year ?? null,
                resumeText: profile?.resume_text ?? "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
