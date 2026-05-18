# Animation Elevation — Handoff

**Status as of 2026-05-09 ~16:50 GMT+12** · Branch: `main` · Owner: Cohen

This document is a mid-flight handoff for any agent (Codex, Claude, human) picking up the animation elevation pass. The full original plan lives at `~/.claude/plans/i-want-to-take-fluffy-snowflake.md` (user-private). What's below is the project-side summary so anyone in this repo can continue without that file.

---

## 1. Goal

Make Ladder feel like a Linear / Vercel / Resend-tier product for SaaSathon judging. Add motion across the entire surface (landing → auth → dashboard → studio) without changing the stack, breaking functionality, or rewriting routes.

**Hard constraints** (already in effect, do not violate):
1. **No stack rewrites.** Stay on `motion@12.38.0`, Tailwind v4, Next.js 16. Two adds allowed and already installed: `canvas-confetti` (5kb, grade moment) and `react-wrap-balancer` (1.1kb, currently unused after revert — safe to remove if you want to slim deps). Skip Lenis, GSAP, Lottie, Three.js, Spline.
2. **No functionality changes.** Drag-drop, AI streaming, auth, RLS, cron — untouched.
3. **Hybrid brand call:** Keep current Ladder palette (navy `#0b1739` + blue→purple gradient `#3b6bff → #8b5cf6 → #5b3fe4` on white) and borrow editorial typography moves only in italic accent words and one editorial display font. Do **not** revert to AGENTS.md's "cinnabar / warm-paper / Editorial × Electric" — that doc is stale; live `app/globals.css` is the truth.

---

## 2. What's shipped (working, verified visually)

### Phase 1 — Demo-critical moments
| Surface | What's in | Files |
|---|---|---|
| Hero | Magnetic CTA wrapping primary button, dual conic-gradient `HeroBlob` rotating behind hero (60s + 90s, low opacity), Gambarino italic accent on "Faster." word only | `app/page.tsx` Hero block, `components/motion/{magnetic,hero-blob}.tsx` |
| Discovery rescan | `LayoutGroup` + per-card `motion.li layout` for FLIP rank-reorder, `AnimatePresence` skeleton crossfade during loading, `NumberTicker` count-up on every score chip per rescan | `components/dashboard/{discovery-client,job-card}.tsx`, `components/motion/number-ticker.tsx` |
| Route morph | `experimental.viewTransition: true` enabled in `next.config.ts`. `view-transition-name: app-${id}` and `app-title-${id}` set on Tracker `application-card.tsx` and matching pair on `/company/[appId]` `interview-studio.tsx` header. CSS in `globals.css` controls 280–480ms easing + reduced-motion no-op. | `next.config.ts`, `components/dashboard/application-card.tsx`, `components/interview/interview-studio.tsx`, `app/globals.css` |
| Studio mic | Spring scale 1→1.08 on press, pulsing halo ring, Web Audio `AnalyserNode` 5-bar live waveform replacing static `Mic` icon during listening | `components/interview/interview-studio.tsx`, `components/motion/voice-waveform.tsx` |
| Grade reveal | Single fired-once `canvas-confetti` cascade (3 staggered bursts, brand palette `#3b6bff #8b5cf6 #5b3fe4 #f59e0b`), staggered 3-block entrance, item-count `NumberTickers` next to "strengths / gaps / to practise", per-item slide-in | `components/interview/feedback-card.tsx` |

### Phase 2 (partial) — Landing scroll storytelling
| Pattern | Where |
|---|---|
| Top-of-page scroll progress bar (brand gradient, springy) | `<ScrollProgress />` in `app/page.tsx` |
| Marquee strip edge-mask (CSS `mask-image: linear-gradient(...)`) | `app/page.tsx` Marquee block |
| `FadeUp` stagger on Features eyebrow + headline + each card | `app/page.tsx` Features |
| `FadeUp` stagger on HowItWorks header + each step + scroll-driven `TracingLine` SVG drawing as user scrolls past the steps grid | `app/page.tsx` HowItWorks, `components/motion/tracing-line.tsx` |
| `NumberTicker` on each Numbers stat (40+, 7, 1) — "+" rendered in gradient | `app/page.tsx` Numbers |
| `FadeUp` build-up on FinalCTA eyebrow → headline (36px blur-rise) → magnetic-wrapped button. `ParallaxY` conic-gradient drifts behind | `app/page.tsx` FinalCTA |

### Foundation
- `motion@12.38.0` was installed but **never imported** before this pass. Now actively used.
- New dependencies added: `canvas-confetti` + `@types/canvas-confetti` (used), `react-wrap-balancer` (installed but no longer imported — see §6).
- Gambarino loaded via Fontshare CDN `<link>` in `app/layout.tsx`. URL: `https://api.fontshare.com/v2/css?f%5B%5D=gambarino@400&display=swap`. Note: Fontshare only ships **regular weight, no italic** for Gambarino — italic is browser-synthesized and looks fine.
- All motion components check `useReducedMotion()` and gracefully degrade to static.

---

## 3. Motion utilities — reusable inventory

All in `components/motion/`. Each has `"use client"` + `useReducedMotion` guard.

```
components/motion/
  magnetic.tsx          Magnetic — pointer-attract wrapper around CTAs
  hero-blob.tsx         HeroBlob — dual rotating conic-gradient backdrop
  blur-fade.tsx         BlurFade — generic whileInView blur+y reveal
  number-ticker.tsx     NumberTicker — value count-up on viewport entry
  reveal-stagger.tsx    StaggerGroup + StaggerItem — orchestrated child stagger
  scroll-progress.tsx   ScrollProgress — top-of-viewport gradient progress bar
  parallax.tsx          ParallaxY — translateY scroll-bound for backgrounds
  section-reveal.tsx    SectionHeading + FadeUp — heading + section reveals
                        (Note: SectionHeading is exported but currently unused
                        — it broke col-span grids; FadeUp is the workhorse.)
  tracing-line.tsx      TracingLine — vertical SVG line that draws on scroll
  voice-waveform.tsx    VoiceWaveform — Web Audio FFT-driven mic bars
  motion-li.tsx         MotionLi — motion.li with viewport reveal (use this
                        instead of <FadeUp><li/></FadeUp> inside <ul>/<ol>;
                        FadeUp wraps in a div which is invalid as <ul> child)
```

---

## 4. Files modified

```
app/
  layout.tsx                                  + Gambarino <link rel="stylesheet"> in <head>
  globals.css                                 + --font-editorial token (Gambarino)
                                              + font-gambarino @utility
                                              + ::view-transition-* easing rules
                                              + prefers-reduced-motion guard for VT
                                              (NOTE: --font-display kept on Geist —
                                              do not re-alias to Gambarino, see §6.)
  page.tsx                                    Major rewrite of Hero, Marquee, Features,
                                              HowItWorks, Numbers, FinalCTA. Import
                                              cleanup: react-wrap-balancer no longer
                                              imported (was causing line-break issues
                                              in hero h1).

next.config.ts                                + experimental.viewTransition: true

components/
  dashboard/discovery-client.tsx              LayoutGroup, AnimatePresence, motion.li
                                              FLIP, SkeletonGrid component, rescanCount
                                              tracking for ticker re-trigger.
  dashboard/job-card.tsx                      NumberTicker on score chip, rescanKey prop.
  dashboard/application-card.tsx              view-transition-name on article + h4.
  interview/interview-studio.tsx              VoiceWaveform mic, motion ring/scale,
                                              view-transition-name on header.
  interview/feedback-card.tsx                 canvas-confetti single-burst, NumberTickers,
                                              motion stagger on blocks + items.
  motion/                                     11 new files (see §3).

package.json / package-lock.json              + canvas-confetti, @types/canvas-confetti,
                                              + react-wrap-balancer (currently unused,
                                              safe to remove if pruning deps).
```

**Files NOT touched** (keep this way unless explicitly asked):
- `proxy.ts`, `lib/supabase/*`, `lib/ai/*`, `lib/gmail/*`, `lib/jobs/*`
- `app/api/**`, `supabase/migrations/*`, `vercel.json`
- `components/ui/button.tsx`, dnd-kit drag mechanics

---

## 5. What's pending (continue here)

Order is suggested by demo-judge ROI; pick whichever surface is weakest in your dogfood pass.

### Phase 2 remainder
1. **Auth + onboarding stage transitions** (`app/(auth)/{login,onboarding}/page.tsx`, `app/(auth)/layout.tsx`):
   - `AnimatePresence mode="wait"` + 24px horizontal slide between onboarding stages (CV paste → role select → finish)
   - Login card blur-fade-up entry
   - One-time `motion.path` `pathLength` 0→1 over 900ms on the LadderMark icon at `components/brand/ladder-mark.tsx`
   - Brand-blue underline grow on form field focus (formalize existing CSS hover behaviour)
2. **Tracker (Kanban) drag polish** (`components/dashboard/{kanban-column,application-card}.tsx`):
   - Add `motion` springy `whileDrag` rotation (-1.5deg) + scale 1.02 + drop-spring on release. The `dragging` boolean is already plumbed through `application-card.tsx`.
   - Wrap stage chips in `motion.div layout` so chip color/text changes morph instead of snap.
   - Empty column: animated dashed border draw (`motion.svg` stroke-dashoffset), once on mount.

### Phase 3 — Micro-interactions
1. **Page transition wrapper** at `app/(app)/layout.tsx` — 200ms opacity + 8px translateY between routes via `AnimatePresence` on `pathname`. Combine with View Transitions; they coexist fine.
2. **Button tap scale** on `components/ui/button.tsx` — Tailwind `active:scale-[0.98] transition-transform` is the cheap way; or wrap with `motion.button whileTap={{ scale: 0.98 }}`.
3. **Branded loaders** — replace `Loader2 animate-spin` (13 occurrences) with a 3-bar climbing micro-loader echoing the LadderMark.
4. **Inbox sync state** — apply the same skeleton-crossfade pattern used in `discovery-client.tsx` SkeletonGrid.

---

## 6. Recently-fixed issues / gotchas (do not redo)

These were already broken once and fixed. Listed so you don't repeat the mistake:

1. **Don't alias `--font-display` to Gambarino.** It propagates Gambarino to the wordmark, nav, numbers, every small label using the `font-display` utility — looked terrible. Keep `--font-display: var(--font-geist), ...` and use Gambarino only via `font-editorial` (italic, used on accent words like "Faster.", "land it.", "matters most.") or the new `font-gambarino` utility (regular, currently unused but available).
2. **Don't wrap hero h1 in `<Balancer>`.** It fights the `<br />` between "future." and "Faster." and produces awkward 3-line breaks. The current natural CSS wrap + `<br />` is correct.
3. **Don't use `<FadeUp>` inside `<ul>` or `<ol>`.** `FadeUp` renders a `<motion.div>` wrapper; nesting `<div><li>...</li></div>` inside `<ul>` is invalid HTML and breaks grid layout. Use `<MotionLi>` (also at `components/motion/motion-li.tsx`) instead. Same applies to `<dl>`/`<dd>` etc. — write a typed wrapper if needed.
4. **Don't use `gambarino@1` or `gambarino@400i` Fontshare URLs.** `@1` returns 18 bytes (no font), `@400i` 500s. Only `@400` works. Italic is browser-synthesized.
5. **`SectionHeading`** in `components/motion/section-reveal.tsx` is exported but **don't use it for grid-layout headers** — its motion.div wrappers don't propagate `col-span-*` classes. Use direct `<FadeUp className="col-span-...">` per child instead.
6. **`browse` server (`~/.claude/skills/gstack/browse`) is currently stuck** in "Starting server..." state from earlier in this session. We've been using `agent-browser` (homebrew CLI at `/opt/homebrew/bin/agent-browser`) successfully. Prefer it for visual QA: `agent-browser goto <url>` → `agent-browser screenshot /tmp/x.png`.

---

## 7. Verify quickly

```bash
# Build (should compile with viewTransition experiment active)
npm run build

# Dev server
npm run dev   # then http://localhost:3000

# Visual smoke (agent-browser is faster than gstack browse on this machine)
agent-browser goto http://localhost:3000
agent-browser screenshot /tmp/landing.png

# Quick HTML probes (motion classes + font links present?)
node -e "fetch('http://localhost:3000/').then(r=>r.text()).then(h=>console.log({\
  gambarino: /api\\.fontshare\\.com.*gambarino@400/.test(h),\
  scroll_progress: /fixed top-0 left-0 right-0 z-50 h-\\[2px\\]/.test(h),\
  hero_blob: /pointer-events-none absolute inset-0 overflow-hidden/.test(h),\
  marquee_mask: /WebkitMaskImage/.test(h),\
  conic_gradient_count: (h.match(/conic-gradient/g)||[]).length\
}))"
```

Auth-gated routes (`/dashboard`, `/discovery`, `/tracker`, `/inbox`, `/coach`, `/company/[id]`, `/onboarding`, `/settings`) all 307 → `/login`. Sign in (Google or email) to see them; the demo arc is in CLAUDE.md / AGENTS.md.

---

## 8. Brand reality check (don't get confused)

`AGENTS.md` says "Editorial × Electric / cinnabar / warm-paper / Gambarino + Switzer / Fontshare". **That doc is stale.** Live `app/globals.css` describes the actual brand:

- Background: `#fafafc` (white-ish), card `#ffffff`
- Ink: `#0b1739` deep navy
- Brand gradient (logo bars + sparkle): `#b8ccff → #3b6bff → #8b5cf6 → #5b3fe4`
- Type: Geist sans (display + body), JetBrains Mono (code/labels), Gambarino (italic accents only)
- Stage chips: blue / purple / amber / emerald / red / grey

If you continue motion work, **target this palette**, not AGENTS.md's. A future cleanup PR should rewrite `AGENTS.md` to match — out of scope for the animation pass.

---

## 9. Scope discipline

If something looks like a brand decision rather than a motion polish (e.g. "should we change the hero copy", "the CTA color is wrong"), surface it as a question and don't silently change. The user's brief is *amplify what's there with motion*, not redesign.
