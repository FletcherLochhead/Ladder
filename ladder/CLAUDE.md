# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # next build
npm run start    # production server (after build)
npm run lint     # eslint (flat config: eslint.config.mjs)
```

There is no test runner configured. Don't invent one — confirm with the user before adding Jest/Vitest/Playwright.

## Architecture

**InternTrack** is a Next.js 16 App Router app with three product surfaces (Discovery / Tracker / Coach) sharing a Supabase backend. Key things that span multiple files:

### Auth + request lifecycle
- **`proxy.ts`** is the Next.js 16 replacement for `middleware.ts`. It runs `lib/supabase/middleware.ts:updateSession` on every request to refresh the Supabase session cookie.
- The proxy `matcher` excludes `/api/cron/*` because cron routes authenticate via `CRON_SECRET`, not Supabase. If you add another non-Supabase route, exclude it here too.
- Three Supabase clients in `lib/supabase/`:
  - `client.ts` — browser client (anon key)
  - `server.ts` — RSC/server-action client (reads cookies)
  - `middleware.ts` — proxy.ts client (writes refreshed cookies)
  Pick the one that matches your runtime — they are NOT interchangeable.
- RLS policies in `supabase/migrations/0001_initial.sql` scope every row to `auth.uid()`. Server code that bypasses RLS must use the service role key explicitly.

### Route groups
`app/` uses three groups that share no URL prefix but separate layouts/auth posture:
- `(marketing)` — public landing
- `(auth)` — `/login`, `/onboarding`
- `(app)` — `/dashboard`, `/company/[appId]` (require session)
- `app/auth/callback` — Supabase OAuth bridge (do not move into a group)

### Hybrid integrations (real OR seed)
Gmail and job discovery both ship a real-API path and a deterministic seed fallback so the demo works without credentials. Pattern lives in:
- `lib/gmail/{oauth,parser,seed}.ts` — falls back to fixtures when OAuth env vars are missing
- `lib/jobs/{adzuna,discovery,seed}.ts` — falls back to curated UC seed when Adzuna keys are missing

When editing either, preserve both branches. Don't delete the seed path.

### AI calls
- `lib/ai/openrouter.ts` wraps the Vercel AI SDK 6 (`streamText` / `useChat`) over OpenRouter. Default model from `OPENROUTER_MODEL` (fallback `openai/gpt-5`).
- Prompts live in `lib/ai/prompts.ts` — keep them there, don't inline strings in route handlers.

### Cron
`vercel.json` schedules `/api/cron/daily-sync` at 7am NZ Mon–Fri (`0 19 * * 1-5` UTC). The route handler must verify `CRON_SECRET` itself.

## Conventions

- **Path alias**: `@/*` maps to repo root (see `tsconfig.json`). Use it instead of relative imports across modules.
- **shadcn/ui**: `components.json` is configured with `style: base-nova`, `baseColor: neutral`, CSS variables in `app/globals.css`. Add primitives with `npx shadcn@latest add <name>` — don't hand-roll Button/Card/Input.
- **Tailwind v4**: No `tailwind.config.js`. Brand tokens go in `app/globals.css` under `@theme`. PostCSS via `@tailwindcss/postcss`.
- **Server Components by default**. `"use client"` only for interactivity (dnd-kit board, voice mic, motion animations).
- **Encrypted Gmail tokens**: `GMAIL_TOKEN_ENC_KEY` (32-byte base64) encrypts refresh tokens at rest. Generation command is in README.md.

## Things easy to break

- Editing `proxy.ts`'s matcher — wrong regex silently logs everyone out.
- Using the browser Supabase client in a server action (or vice versa) — auth state will be wrong.
- Removing the seed fallback in `lib/gmail` or `lib/jobs` — the live demo depends on it.
- Adding a new top-level route that needs auth without making sure `proxy.ts` matches it.
