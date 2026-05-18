import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Compass,
  MailCheck,
  Mic2,
  Sparkles,
} from "lucide-react";

import { LadderMark } from "@/components/brand/ladder-mark";
import { Reveal } from "@/components/landing/reveal";
import { SignalCycle } from "@/components/landing/signal-cycle";
import { Magnetic } from "@/components/motion/magnetic";
import { MotionLi } from "@/components/motion/motion-li";
import { NumberTicker } from "@/components/motion/number-ticker";
import { ParallaxY } from "@/components/motion/parallax";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main className="flex-1 flex flex-col landing-surface">
        <Hero />
        <InfiniteSignals />
        <ProofBand />
        <Features />
        <LiveFlow />
        <Numbers />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

/* ----------------------------------------------------------------------- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline glass-bar">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between px-5 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <LadderMark size={30} />
          <span className="font-display text-xl font-semibold text-ink">
            Ladder
          </span>
          <span className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.2em] text-mute border border-hairline px-2 py-0.5 rounded-sm">
            AI career concierge
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="#workflows"
            className="hidden sm:block text-mute hover:text-foreground transition"
          >
            Workflows
          </Link>
          <Link
            href="#demo"
            className="hidden sm:block text-mute hover:text-foreground transition"
          >
            Demo path
          </Link>
          <Magnetic range={80} strength={0.18} className="inline-flex">
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 bg-gradient-brand text-white px-4 py-2 text-sm font-medium rounded-md transition hover:brightness-105 shadow-[var(--shadow-brand)]"
            >
              Sign in{" "}
              <ArrowUpRight className="size-3.5 transition group-hover:rotate-45" />
            </Link>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------- */

function Hero() {
  const stats = [
    { value: 12, suffix: "", label: "ranked roles in the pitch path" },
    { value: 7, suffix: "am", label: "daily NZ concierge sync" },
    { value: 3, suffix: "", label: "AI workflows beyond a chat box" },
  ];

  return (
    <section className="hero-scene relative isolate overflow-hidden border-b border-hairline min-h-[calc(100dvh-73px)]">
      <div className="absolute inset-y-0 right-0 hidden xl:block w-[52%] pointer-events-none">
        <div className="absolute inset-0 signal-stage-mask" />
        <div className="relative h-full pl-8 pr-10 pt-24">
          <SignalCycle mode="ambient" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-6 pt-14 pb-10 sm:pt-20 lg:pt-24 lg:pb-12">
        <div className="max-w-[760px]">
          <p className="word font-mono text-[11px] uppercase tracking-[0.3em] text-mute mb-7 flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-[var(--color-c-gold)] pulse-dot" />
            AI-powered · Built for students
          </p>
          <h1 className="font-display text-[54px] sm:text-[74px] lg:text-[90px] leading-[0.94] text-ink font-semibold">
            <span className="word" style={{ animationDelay: "60ms" }}>
              Career
            </span>
            <br />
            <span className="word" style={{ animationDelay: "180ms" }}>
              concierge
            </span>{" "}
            <span className="word" style={{ animationDelay: "250ms" }}>
              for
            </span>
            <br />
            <span className="word" style={{ animationDelay: "320ms" }}>
              UC
            </span>{" "}
            <span
              className="word text-gradient"
              style={{ animationDelay: "460ms" }}
            >
              students.
            </span>
          </h1>
          <p
            className="word mt-7 max-w-[600px] text-base sm:text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: "680ms" }}
          >
            Ladder turns a pasted CV, a noisy inbox, and a looming interview
            into one focused internship workflow: ranked roles, an application
            tracker, and voice-led company prep.
          </p>
          <div
            className="word hero-cta mt-8"
            style={{ animationDelay: "860ms" }}
          >
            <Magnetic range={120} strength={0.26} className="inline-flex">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 bg-gradient-brand text-white px-6 py-3.5 text-sm font-medium rounded-md transition hover:brightness-105 shadow-[var(--shadow-brand)]"
              >
                Open the studio
                <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
              </Link>
            </Magnetic>
            <Link
              href="#demo"
              className="hero-secondary-link inline-flex items-center gap-2 px-1 py-3 text-sm font-medium text-ink hover:text-[var(--color-c-deep)] transition underline-offset-[6px] underline decoration-hairline hover:decoration-[var(--color-c-coral)]"
            >
              See the demo path
            </Link>
          </div>
        </div>

        <div className="xl:hidden mt-14">
          <SignalCycle />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-hairline bg-hairline rounded-lg overflow-hidden max-w-[860px]">
          {stats.map((stat, i) => (
            <div key={stat.label} className="bg-paper/82 backdrop-blur p-5">
              <p className="font-display text-3xl text-ink tabular">
                <NumberTicker
                  value={stat.value}
                  duration={1.1}
                  delay={0.2 + i * 0.08}
                />
                {stat.suffix}
              </p>
              <p className="text-sm text-mute leading-snug mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function InfiniteSignals() {
  const companies = [
    "Partly",
    "Lumin",
    "Rocket Lab",
    "Stats NZ",
    "Dawn Aerospace",
    "Trade Me",
    "Datacom",
    "Beca",
    "Orion",
    "Tait Communications",
  ];
  const signals = [
    "CV-fit scores",
    "Gmail stage detection",
    "Company research",
    "Voice mock interviews",
    "Feedback briefs",
    "Kanban updates",
    "UC-relevant seed roles",
    "Adzuna live search",
  ];

  return (
    <section
      aria-label="Live product signals"
      className="border-b border-hairline overflow-hidden bg-paper"
    >
      <div className="marquee-track flex whitespace-nowrap py-5">
        {[...companies, ...companies, ...companies].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-2xl sm:text-3xl text-ink mx-7 inline-flex items-center gap-7 font-semibold"
          >
            {item}
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute">
              NZ internship signal
            </span>
          </span>
        ))}
      </div>
      <div className="marquee-track marquee-track-reverse flex whitespace-nowrap py-4 border-t border-hairline bg-paper-strong">
        {[...signals, ...signals, ...signals].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink-soft mx-6 inline-flex items-center gap-6"
          >
            <span className="size-1.5 rounded-full bg-[var(--color-c-coral)]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function ProofBand() {
  return (
    <section className="border-b border-hairline bg-paper-strong/70">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 py-16 lg:py-20">
        <Reveal className="grid grid-cols-12 gap-8 items-end">
          <p className="col-span-12 lg:col-span-4 font-mono text-[11px] uppercase tracking-[0.28em] text-mute">
            Built for a five-minute live demo in Christchurch.
          </p>
          <p className="col-span-12 lg:col-span-8 text-2xl sm:text-3xl lg:text-[40px] leading-tight text-ink font-display font-semibold">
            A polished workflow for students who need to move from
            &ldquo;where do I even apply?&rdquo; to a tracked, researched,
            rehearsed opportunity.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function Features() {
  const items = [
    {
      n: "01",
      title: "Discovery",
      icon: <Compass className="size-5" />,
      body: "Reads the student CV, scans live listings plus a curated UC seed, then ranks roles with specific fit reasons.",
      meta: "CV · job listings · ranking",
    },
    {
      n: "02",
      title: "Tracker",
      icon: <MailCheck className="size-5" />,
      body: "Connects to Gmail in read-only mode and turns application emails into a clean Kanban pipeline with manual drag control.",
      meta: "Gmail · parsing · stages",
    },
    {
      n: "03",
      title: "Coach",
      icon: <Mic2 className="size-5" />,
      body: "Researches the company, runs a voice-led mock interview, and returns a concise practice brief after the session.",
      meta: "research · voice · feedback",
    },
  ];

  return (
    <section id="workflows" className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 py-24 lg:py-32">
        <Reveal className="grid grid-cols-12 gap-8 mb-14">
          <div className="col-span-12 lg:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">
              Three workflows · one studio
            </p>
          </div>
          <h2 className="col-span-12 lg:col-span-8 font-display text-5xl lg:text-[70px] text-ink leading-[0.95] font-semibold">
            AI doing the work that usually falls between tabs.
          </h2>
        </Reveal>

        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-hairline border border-hairline rounded-lg overflow-hidden">
          {items.map((it, i) => (
            <MotionLi
              delay={i * 0.08}
              key={it.n}
              className="group bg-paper p-7 sm:p-8 lg:p-10 min-h-[390px] flex flex-col transition hover:bg-paper-strong"
            >
              <div className="flex items-start justify-between gap-6 mb-10">
                <span className="font-display tabular text-5xl text-gradient leading-none font-semibold">
                  {it.n}
                </span>
                <span className="grid size-11 place-items-center rounded-md border border-hairline bg-white/60 text-[var(--color-c-deep)] transition group-hover:border-[var(--color-c-coral)]/45">
                  {it.icon}
                </span>
              </div>
              <h3 className="font-display text-3xl text-ink mb-4 font-semibold">
                {it.title}
              </h3>
              <p className="text-mute text-[15px] leading-relaxed mb-8 flex-1">
                {it.body}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft pt-4 border-t border-hairline">
                {it.meta}
              </p>
            </MotionLi>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function LiveFlow() {
  const steps = [
    {
      icon: <BriefcaseBusiness className="size-4" />,
      title: "Paste the CV",
      body: "A UC student profile becomes the matching brief.",
    },
    {
      icon: <Sparkles className="size-4" />,
      title: "Rank the market",
      body: "Fresh and seeded roles are scored against the brief.",
    },
    {
      icon: <MailCheck className="size-4" />,
      title: "Sync the inbox",
      body: "Application emails become live stages in the tracker.",
    },
    {
      icon: <CalendarCheck className="size-4" />,
      title: "Rehearse the interview",
      body: "Company context turns into a focused voice practice session.",
    },
  ];

  return (
    <section id="demo" className="border-b border-hairline bg-paper-strong">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 py-24 lg:py-32">
        <Reveal className="grid grid-cols-12 gap-8 items-end mb-16">
          <h2 className="col-span-12 lg:col-span-7 font-display text-5xl lg:text-[70px] text-ink leading-[0.95] font-semibold">
            The pitch path is already the product path.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-mute text-base lg:text-lg leading-relaxed">
            The demo moves through the same sequence a student would actually
            use before internship season: discover, track, prepare.
          </p>
        </Reveal>

        <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-px bg-hairline border border-hairline rounded-lg overflow-hidden">
          {steps.map((s, i) => (
            <MotionLi
              delay={i * 0.08}
              key={s.title}
              className="relative bg-paper-strong p-7 lg:p-8 min-h-[260px] flex flex-col justify-between hover:bg-paper transition"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-md bg-paper border border-hairline text-[var(--color-c-deep)]">
                  {s.icon}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-mute tabular">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl text-ink mb-3 font-semibold">
                  {s.title}
                </h3>
                <p className="text-sm text-mute leading-relaxed">{s.body}</p>
              </div>
            </MotionLi>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function Numbers() {
  const stats = [
    { value: 40, suffix: "+", label: "UC-relevant roles available in the demo seed" },
    { value: 8, suffix: "", label: "seed inbox events for reliable live judging" },
    { value: 1, suffix: "", label: "company-specific interview studio per application" },
  ];

  return (
    <section className="border-b border-hairline bg-paper">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 py-20">
        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline rounded-lg overflow-hidden">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-paper p-8 lg:p-10">
              <span className="font-display tabular text-6xl lg:text-7xl text-ink leading-none font-semibold flex items-baseline">
                <NumberTicker
                  value={s.value}
                  duration={1.35}
                  delay={0.14 + i * 0.08}
                />
                {s.suffix && <span className="text-gradient">{s.suffix}</span>}
              </span>
              <span className="block text-mute text-sm leading-relaxed max-w-[300px] mt-5">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="hero-gradient text-white relative overflow-hidden">
      <ParallaxY
        range={64}
        className="pointer-events-none absolute inset-0 opacity-40"
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(105deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_28px)]" />
      </ParallaxY>
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 py-28 lg:py-40">
        <Reveal className="grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60 mb-8 inline-flex items-center gap-3">
              <CheckCircle2 className="size-3.5" />
              Ready for Sunday judging
            </p>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-[112px] leading-[0.92] font-semibold">
              From CV to interview prep before the next coffee.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:justify-self-end">
            <Magnetic range={140} strength={0.3} className="inline-flex">
              <Link
                href="/login"
                className="group inline-flex items-center gap-3 bg-white text-ink px-7 py-4 text-base font-medium rounded-md hover:bg-white/90 transition"
              >
                Open the studio
                <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper-strong">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div className="flex items-center gap-3">
          <LadderMark size={22} />
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
            © 2026 Ladder · AI career concierge.
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
          <a
            href="https://github.com/zaviert115/InternTrack"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition"
          >
            GitHub ↗
          </a>
          <Link
            href="/login"
            className="hover:text-foreground transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
