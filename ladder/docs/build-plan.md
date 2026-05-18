# InternTrack — AI Career Concierge for UC Students

## Context

**SaaSathon hackathon project.** Friday 8 May → Sunday 10 May 2026. Today is Saturday 9 May; submission closes Sunday ~12:00pm. Team has 4+ builders and ~60+ person-hours of focused build time.

UC engineering students must complete a mandatory number of internship hours to graduate. The wider student body also lacks a single tool to (1) discover relevant internships/grad roles, (2) track applications across the funnel, (3) prepare for company-specific interviews. **InternTrack** solves all three by putting AI to work on each step:

- **AI agent** ranks fresh job listings against the student's CV and surfaces "why this fits you" reasons.
- **AI email parser** reads Gmail and auto-builds a Kanban tracker (with manual override).
- **AI interviewer** researches the company, then runs a voice-enabled adaptive mock interview and grades the user.

Why this wins as a hackathon submission: AI does **real, defensible work** on three different unstructured-data surfaces (web listings, emails, conversation), not just "chat box on top of an app." That maps cleanly onto the SaaSathon "creative AI productivity" theme and the Innovation + Impact judging criteria.

Repo already exists at `github.com/zaviert115/InternTrack` (currently empty).

## Scope (locked)

**Polished — must work flawlessly in the live demo:**
1. Auth (Google OAuth + email/password via Supabase Auth)
2. Landing page in **Editorial Minimal** aesthetic
3. Dashboard with AI Job Discovery
4. Application Kanban tracker (manual drag + auto from emails)
5. Hybrid Gmail integration (real OAuth + always-on demo seed fallback)
6. Per-company Research + voice-enabled AI Interview Coach + post-interview feedback

**Stretch — build only if Polished is locked first:**
7. AI avatar (one-shot stylized portrait at signup; OpenAI image API)
8. Vercel Cron daily auto-sync (Mon–Fri 7am NZ)

**Cut for v1:**
- Animated character throughout the site
- Outlook/non-Gmail email
- Multi-user / sharing / teams
- Mobile-specific layout (responsive, but desktop is the demo target)

## Architecture

**Stack** (matches SaaSathon recommendation):
- **Frontend**: Next.js (App Router, latest stable) + React + TypeScript
- **Styling/UI**: Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Auth/DB/Storage**: Supabase (Auth + Postgres + Storage)
- **Hosting**: Vercel (preview + prod)
- **AI text**: OpenRouter (hackathon-provided key) — default to a frontier model (e.g. `openai/gpt-5.5` or `anthropic/claude-sonnet-4.6` — whichever the team confirms is provisioned)
- **AI image**: OpenAI direct (the $50 Codex credits) — `gpt-image-1` for avatar only
- **Voice input**: browser-native Web Speech API (zero cost, zero latency)
- **Email**: Gmail API (`googleapis`) with `gmail.readonly` scope, OAuth in **testing mode** (no verification needed; up to 100 test users — covers the team + judges)

**Repo layout:**
```
InternTrack/
├── app/
│   ├── (marketing)/page.tsx                # landing
│   ├── (auth)/login/page.tsx
│   ├── (auth)/onboarding/page.tsx          # CV paste + course
│   ├── (app)/dashboard/page.tsx            # discovery + kanban
│   ├── (app)/company/[appId]/page.tsx      # research + interview studio
│   └── api/
│       ├── jobs/discover/route.ts
│       ├── gmail/connect/route.ts
│       ├── gmail/callback/route.ts
│       ├── gmail/sync/route.ts
│       ├── company/research/route.ts
│       ├── interview/chat/route.ts         # streaming
│       ├── interview/grade/route.ts
│       └── cron/daily-sync/route.ts
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── landing/             # hero, sections
│   ├── kanban/              # board, columns, cards, drawer
│   ├── interview/           # chat, voice button, feedback card
│   └── motion/              # Framer wrappers + presets
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── ai/{openrouter,prompts,stream}.ts
│   ├── gmail/{oauth,parser,seed}.ts
│   └── jobs/{discovery,seed,adzuna}.ts
├── supabase/migrations/0001_initial.sql
└── README.md
```

## Data model (Supabase Postgres)

```sql
-- profiles: extends auth.users (one row per user)
profiles (
  id uuid pk references auth.users on delete cascade,
  display_name text,
  course text,
  graduation_year int,
  resume_text text,                    -- pasted CV (powers AI ranking)
  avatar_url text,
  gmail_refresh_token_encrypted text,  -- nullable; null = use seed
  created_at timestamptz default now()
)

-- jobs: discovered listings (per user; results may differ by CV)
jobs (
  id uuid pk default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  title text not null,
  company text not null,
  location text,
  description text,
  source_url text not null,
  posted_at timestamptz,
  ai_match_score numeric,              -- 0–100
  ai_match_reasons text[],
  discovered_at timestamptz default now()
)

-- applications: tracked applications (Kanban rows)
applications (
  id uuid pk default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  job_id uuid references jobs on delete set null,
  company text not null,               -- denormalized so manual entries work
  position text,
  stage text default 'wishlist',       -- wishlist|applied|screening|interview|offer|rejected|withdrawn
  applied_at timestamptz,
  last_email_at timestamptz,
  notes text,
  created_at timestamptz default now()
)

-- email_events: signals parsed out of Gmail (or seed)
email_events (
  id uuid pk default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  application_id uuid references applications on delete cascade,
  gmail_message_id text,               -- nullable for seed events; unique when present
  subject text,
  snippet text,
  ai_classified_stage text,
  ai_summary text,
  received_at timestamptz,
  created_at timestamptz default now()
)

-- interviews: per-company chat transcripts + research cache
interviews (
  id uuid pk default gen_random_uuid(),
  user_id uuid references profiles on delete cascade,
  company text not null,
  ai_research jsonb,                   -- {values, recent_news, likely_questions}
  transcript jsonb default '[]'::jsonb,
  feedback jsonb,
  created_at timestamptz default now()
)
```
RLS on every table: `user_id = auth.uid()`. Indexes on `applications(user_id, stage)`, `email_events(application_id)`, `interviews(user_id, company)`.

## Visual design system — Editorial Minimal

- **Type**: Inter Display (display, 600/700) + Inter (body, 400/500). Hero up to 96px, dashboard headings 32–56px, body 15–17px. Generous tracking on display.
- **Color**:
  - Background: `#FAFAF7` (warm white) light / `#0E0E0F` dark
  - Text: `#0E0E0F` / `#FAFAF7`
  - Mid grey: `#6B6B70`
  - **Single accent**: `#3D2EFF` (electric indigo) — used sparingly for primary buttons, focus rings, active stage pill, AI "thinking" cursor
- **Layout**: 12-col grid, max content 1200px, paragraph rag ≤ 65ch, generous gutters, hairline (1px) rules instead of heavy panel chrome
- **Motion** (the "nice animations"):
  - Page transitions: 280ms ease-out fade + 8px slide-up
  - Hero text reveal: per-word stagger, 40ms each
  - Kanban card drop: spring (`stiffness: 320, damping: 28`)
  - Hover lift: 1.5px translate, 120ms
  - AI streaming text: shimmer on cursor; "thinking" dots only when no token in last 600ms
  - Discovery scan: progress bar → cards materialize with staggered fade+rise
- **Components**: shadcn/ui primitives, customized — buttons default to ghost with sharp corners (radius 6px), accent only on primary CTAs
- **Iconography**: Lucide thin-stroke (1.5px)
- **Reference vibe**: Linear + Stripe + Vercel docs

## AI integration

**Prompts** (registry in `lib/ai/prompts.ts`):
1. `rankJobs(resume, jobList)` → `[{job_id, score, reasons[]}]`
2. `parseEmail({subject, body, from})` → `{is_application_related, company?, role?, stage?, applied_date?, summary}` JSON
3. `researchCompany(name, role?)` → `{values[], recent_news[], culture_notes[], likely_questions[]}` JSON
4. `interviewerTurn(company, research, history, userMessage)` → next interviewer message (streamed)
5. `gradeInterview(company, transcript)` → `{strengths[], gaps[], suggested_followups[]}`

**Defaults**:
- Use Vercel AI SDK for streaming + tool use ergonomics
- Cache `researchCompany` output in `interviews.ai_research` keyed by `(company, role)` — pre-warm before pitch
- Temperature 0.3 for parsing/ranking, 0.7 for interviewer, 0.4 for grading

## Feature lanes (4 builders working in parallel)

### Lane A — Foundation, Auth, Landing (Builder 1)
- Scaffold Next.js + Tailwind 4 + shadcn/ui + Framer Motion (~1h)
- Create Supabase project, link to Vercel, wire env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID/SECRET`) (~1h)
- Apply migration `0001_initial.sql` (~30m)
- Landing page (Editorial Minimal hero + 3 feature sections + footer) (~3h)
- `/login` (Supabase Auth UI) (~1h)
- `/onboarding` (course, grad year, paste CV) (~1h)
- Dashboard shell + sidebar nav + design tokens (~2h)

### Lane B — Discovery + Kanban (Builder 2)
- Seed file `lib/jobs/seed.ts` with 40 real UC-relevant listings (engineering, CS, business — Partly, Lumin, FundTap, Wellington-Christchurch tech, govt grad programmes) (~1h)
- Adzuna integration for fresh listings (free public API) (~1h)
- `POST /api/jobs/discover` — pulls seed + Adzuna, calls `rankJobs` prompt, persists top 12 to `jobs` (~3h)
- Kanban board with `dnd-kit` — 6 stages, optimistic drag-and-drop, server persist (~3h)
- "Add manually" dialog + form (~1h)
- "AI rescan" button → discover → animated card reveal (~2h)
- Card detail drawer (right slide-over) — job description, email events list, notes, "Open Interview Studio" CTA (~2h)

### Lane C — Gmail Integration (Builder 3)
- Google Cloud project + OAuth client (testing mode, scope `gmail.readonly`); add team Gmail accounts as test users (~2h)
- `/api/gmail/connect` (redirect to consent) + `/api/gmail/callback` (exchange code, encrypt + store refresh token) (~3h)
- `/api/gmail/sync` — fetch last 30d messages, batch through `parseEmail` prompt, upsert into `applications` + `email_events` (dedupe via `gmail_message_id`) (~4h)
- "Sync now" button + sync status indicator (last synced, count) (~1h)
- **Demo seed**: `lib/gmail/seed.ts` with 8 fixtures (covers screening invite, interview booked, rejection, offer, "thanks for applying" auto-reply, etc.). When user is in demo mode (no refresh token), `/api/gmail/sync` runs the same `parseEmail` pipeline against the seed (~1h)
- Vercel Cron config (`vercel.json` → `0 19 * * 1-5`) → `/api/cron/daily-sync` iterates over connected users (~1h)

### Lane D — Company Research + Interview Studio (Builder 4)
- `/company/[appId]/page.tsx` — two-pane layout: research left, interview right (~1h)
- `POST /api/company/research` — call `researchCompany`, write to `interviews.ai_research`, return cached if exists (~3h)
- Research panel UI: values cards, recent news list, "likely questions" accordion (~2h)
- `POST /api/interview/chat` — streaming endpoint using Vercel AI SDK + `interviewerTurn` (~2h)
- Chat UI with `useChat` hook + Framer message-reveal motion (~2h)
- **Voice button**: hold-to-talk; `SpeechRecognition` API with `continuous=false, interimResults=true`; on release, send final transcript to chat input + auto-submit (~2h)
- "Wrap interview" → `/api/interview/grade` → feedback card with strengths/gaps/follow-ups (~2h)

### Stretch — AI Avatar (whoever is free)
- Headshot upload (Supabase Storage bucket `avatars`)
- Server action: send headshot + style prompt to `gpt-image-1` ("minimal flat-line portrait, single accent stroke, white background, tasteful, no text"), 1024×1024, n=1
- Save URL to `profiles.avatar_url`
- Show in sidebar header + as the interviewer's portrait in chat

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Gmail OAuth fails in front of judges | Med | Hybrid mode — `/api/gmail/sync` always runs the same parser; if no refresh token, use `gmail/seed.ts`. Demo on a seeded account if real account flakes. |
| OpenRouter rate limits or model latency mid-pitch | Med | Pre-warm the demo company's research + discovery 60s before pitch. Cache hits in `interviews.ai_research`. |
| Web Speech API browser-specific | Low | Demo on Chrome/Edge. Type-input always available as fallback. |
| Vercel cold start visible | Low | Open all routes 60s before the demo; Next.js prefetch on link hover. |
| Image gen latency / cost | Low | Avatar is stretch only — feature flag it, default off. |
| 4 builders converging on same files | Med | Lanes are deliberately file-disjoint; merge to `main` via short-lived branches with PR-per-feature. |

## Demo script (5 min, hits all polished features)

1. **0:00–0:30** — Landing page on big screen. "Find your future. Faster." Sign in with Google.
2. **0:30–1:00** — Onboarding: pre-filled CV. Click "Run discovery" → 12 ranked internships materialize with match scores + "why this fits you."
3. **1:00–1:45** — Drag a card to "Applied". Click **Sync Gmail** → 4 cards auto-populate from inbox: 1 in "Screening", 1 in "Interview", 2 in "Applied" — hover shows AI summary of the source email.
4. **1:45–2:00** — "I have an interview at Partly Friday — let's prep." Open the card's drawer → "Open Interview Studio".
5. **2:00–4:00** — Company page: research renders Partly's values + likely questions. "Start Interview" → AI greets you. **Hold voice button** → speak answer → transcript appears → AI follows up. Two rounds.
6. **4:00–4:30** — "End interview" → AI feedback card: 2 strengths, 1 gap, 1 follow-up to practice.
7. **4:30–5:00** — Back to dashboard. "Your concierge runs daily at 7am." Show next-sync indicator. Close.

## Build sequence (24h, Saturday 12:00 → Sunday 12:00)

| Window | Lane A | Lane B | Lane C | Lane D |
|---|---|---|---|---|
| Sat 12:00–18:00 | Scaffold → auth → landing | Schema + seed jobs + dashboard shell | Google Cloud + OAuth setup (longest lead) | Research API + chat skeleton |
| Sat 18:00–24:00 | Dashboard polish + tokens | Discover API + Kanban DnD | Email parser + manual sync | Chat UI + voice input |
| Sun 00:00–06:00 (rest as needed) | Help B/D polish | Card detail drawer | Seed fallback + demo flag | Feedback card + grade API |
| Sun 06:00–10:00 | All hands: end-to-end test | …on the demo path | …including pre-warm script | Stretch: avatar |
| Sun 10:00–12:00 | Final deploy → cache pre-warm → submit → rehearse |

## Verification (end-to-end)

1. **Auth**: Sign up via Google + via email; both land on `/onboarding`, then `/dashboard`.
2. **Discovery**: With CV pasted, click "AI rescan" → ≥10 jobs persisted in `jobs` with non-zero `ai_match_score`; reasons render on card.
3. **Kanban**: Drag a card across all 6 stages; reload; stage persists; manual "Add" creates a card.
4. **Gmail real**: Connect a team test account; trigger sync; verify ≥1 `email_events` row + matching `applications` upsert.
5. **Gmail seed**: Brand-new account (no Gmail connect) clicks Sync → seed events parse → 4 applications populate Kanban.
6. **Company research**: Type "Partly" → research output renders within 6s cold; <1s warm.
7. **Voice**: Hold-to-talk → speak → release → final transcript in input within 500ms; auto-submits.
8. **Interview**: 4-turn streamed conversation; "Wrap interview" → feedback card with all four fields populated.
9. **Cron**: `vercel cron run` succeeds without auth errors; verifies for connected users.
10. **Lighthouse**: Landing & dashboard ≥85 perf, ≥95 a11y on Chrome desktop.

## Critical files to create

- `app/(marketing)/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/onboarding/page.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/company/[appId]/page.tsx`
- `app/api/jobs/discover/route.ts`
- `app/api/gmail/{connect,callback,sync}/route.ts`
- `app/api/company/research/route.ts`
- `app/api/interview/{chat,grade}/route.ts`
- `app/api/cron/daily-sync/route.ts`
- `lib/ai/{openrouter,prompts,stream}.ts`
- `lib/gmail/{oauth,parser,seed}.ts`
- `lib/jobs/{discovery,seed,adzuna}.ts`
- `lib/supabase/{client,server,middleware}.ts`
- `components/{landing,kanban,interview,motion}/...`
- `supabase/migrations/0001_initial.sql`
- `vercel.json` (cron config)
- `tailwind.config.ts` (design tokens)

## Skills to invoke during implementation

- `frontend-design:frontend-design` — invoke before building the landing page hero and the dashboard chrome to get distinctive, production-grade visual treatment that doesn't look generic-AI. This was an explicit user request.
- `vercel:nextjs` and `vercel:shadcn` — for App Router patterns and shadcn primitives.
- `supabase:supabase` — for Supabase Auth + RLS migration setup.
- `vercel:deploy` — Sunday morning, after the build window.

## Reused / off-the-shelf pieces

- **Supabase Auth UI** for login/signup (avoids reinventing forms)
- **shadcn/ui** for primitives (Button, Dialog, Drawer, Tooltip, Badge, Tabs)
- **dnd-kit** for Kanban DnD (vs the unmaintained `react-beautiful-dnd`)
- **Vercel AI SDK** (`ai/react` `useChat`) for streaming chat
- **`googleapis`** Node SDK for Gmail
- **Adzuna public job API** for live listings (free tier, no auth required for basic search)
- **Web Speech API** (`window.SpeechRecognition`) for voice — no library needed
- **Lucide React** for icons

## Open decisions to confirm at start of build

1. Final accent color (`#3D2EFF` indigo proposed — a UC-orange or Partly-pink may be on-brand alternatives).
2. Confirm OpenRouter routes to GPT-5.5 (or Claude Sonnet 4.6) — pick whichever is faster + provisioned.
3. Avatar feature ON or OFF (default OFF unless Lane A finishes early).
4. Whether to deploy to a custom subdomain or use the default `*.vercel.app`.
