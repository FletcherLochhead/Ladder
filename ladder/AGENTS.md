# AGENTS.md — InternTrack

Project-specific rules for AI assistants working in this repo. Read `docs/build-plan.md` for the original build plan and `docs/saasathon-brief.md` for the hackathon context.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 — read before writing code

This project runs **Next.js 16** with React 19 and Tailwind v4. APIs, conventions, and file structure differ meaningfully from earlier versions. **Always read the relevant guide in `node_modules/next/dist/docs/01-app/` before touching framework concerns.**

Specific gotchas already biting in this repo:
- **`middleware.ts` was renamed to `proxy.ts`.** The exported function is `proxy(request)`, not `middleware(request)`. Don't rename it back.
- **`cookies()` returns a `Promise`.** Always `await cookies()` in Server Components, Route Handlers, and Server Actions. See `lib/supabase/server.ts`.
- **Route params are `Promise`-shaped** in dynamic routes (`{ params }: { params: Promise<{ id: string }> }`). Always `await params` before using.
- **Cache Components is opt-in via `cacheComponents: true`** in `next.config.ts`. We do **not** enable it — we use the previous caching model.
- **`unstable_instant`** can be exported from a route to make client-side navigation instant under Cache Components — not used here yet.
<!-- END:nextjs-agent-rules -->

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript 5
- Tailwind CSS v4 (CSS-based config via `@theme`) · shadcn/ui · `motion` (Framer)
- Supabase (Auth + Postgres + Storage) — RLS scoped to `auth.uid()`
- Vercel AI SDK 6 (`streamText`, `useChat`, `convertToModelMessages`) over OpenRouter (OpenAI-compatible)
- `googleapis` for Gmail (testing-mode OAuth, scope `gmail.readonly`)
- `@dnd-kit` for the Kanban
- Web Speech API (browser-native) for voice input — Chrome/Edge

## Aesthetic — "Editorial × Electric"

Locked in `app/globals.css`. Don't drift toward generic AI palettes (no purple-on-white, no Inter as display).

- **Type**: Gambarino (display, Fontshare) + Switzer (body, Fontshare) + JetBrains Mono via `next/font/google`. Loaded via `<link>` in the root layout.
- **Color**: warm-paper background (`#F5F2EA`), rich-black ink (`#171717`), single accent — electric vermillion / cinnabar `#E8482C`. Hairline borders (`#E5DFD2`), no heavy panel chrome.
- **Motion**: per-word stagger reveals on hero, springy Kanban drops, AI streaming cursor on `assistant` messages, paper grain via inline SVG noise.
- **Sharp corners** by default (`--radius: 0.375rem`). The accent color appears only on primary CTAs, focus rings, active stage chips, and AI cursors.

When adding new UI, match the palette and use the existing utilities: `font-display`, `font-editorial`, `tabular`, `grain`, `word`, `marquee-track`, `hairline-draw`, `spotlight`, `ai-cursor`.

## Repo layout

```
app/
  (marketing)/page.tsx                  # landing
  (auth)/{login,onboarding}/page.tsx
  (app)/dashboard/page.tsx              # discovery + kanban (server + client island)
  (app)/company/[appId]/page.tsx        # research + interview studio
  api/
    jobs/discover/route.ts              # AI ranking
    gmail/{connect,callback,sync}/...   # hybrid Gmail
    company/research/route.ts
    interview/{chat,grade}/route.ts     # streaming chat + post-grade
    applications/{,[id]}/route.ts       # CRUD
    cron/daily-sync/route.ts
  auth/callback/route.ts                # Supabase OAuth bridge
components/{auth,dashboard,interview,ui}/
lib/
  supabase/{client,server,middleware}.ts
  ai/{openrouter,prompts}.ts            # prompt registry
  gmail/{oauth,parser,seed}.ts
  jobs/{adzuna,discovery,seed}.ts
  types.ts                              # hand-rolled DB types until `supabase gen types`
proxy.ts                                # auth gate (renamed from middleware.ts)
supabase/migrations/0001_initial.sql
vercel.json                             # daily cron config
```

## Conventions

- **Server Components by default.** Add `"use client"` only when you need state, effects, or browser APIs. Most server work passes data into a single client island per route (e.g. `DashboardClient`, `InterviewStudio`).
- **Auth gate.** All `(app)` routes are protected by `proxy.ts`. Do not bypass — read `user_id = auth.uid()` from RLS instead.
- **Supabase clients:** `createClient` (server, awaits cookies), `createBrowserClient` (client), `createAdminClient` (bypasses RLS — only in cron + the OAuth-callback persist).
- **Prompt registry:** all AI calls compose system + user from `lib/ai/prompts.ts`. Tune phrasing/temperature/models there, not at call sites.
- **AI provider:** OpenRouter only for text. OpenAI direct (`gpt-image-1`) is reserved for the optional avatar.
- **JSON-mode prompts:** parse with the lenient `safeJsonParse` helpers (strip code fences, regex-extract first `{…}`). LLMs occasionally wrap or trail prose; never throw.
- **Demo resilience:** Gmail sync runs the same parser pipeline against `lib/gmail/seed.ts` whenever a user has no refresh token. The demo flow is identical in both modes — never gate on real OAuth.
- **No Claude attribution in commits.** Per the project owner.

## Environment

`.env.local` is gitignored. See `.env.example` for the full list. Critical vars:
- Supabase URL / publishable / secret
- `OPENROUTER_API_KEY` (+ optional `OPENROUTER_MODEL`)
- `GMAIL_TOKEN_ENC_KEY` — 32-byte base64; `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` to generate
- `GOOGLE_OAUTH_*` for the Gmail testing-mode app
- `CRON_SECRET` for `/api/cron/daily-sync`

## Demo path (the 5-minute pitch)

1. Land → "Find your future. Faster."
2. Sign in (Google or email) → Onboarding → paste CV
3. Dashboard: hit **Run AI rescan** → 12 ranked roles materialize with score + reasons
4. Hit **Sync Gmail** → in seed mode, parses 8 fixtures into the Kanban
5. Drag a card → click ↗ on the card → Interview Studio
6. AI dossier renders → hold mic, speak, release → AI streams next interviewer turn
7. **Wrap & grade** → feedback card with strengths / gaps / follow-ups
