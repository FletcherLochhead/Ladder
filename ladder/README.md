# InternTrack

> An AI career concierge for University of Canterbury students. Built at SaaSathon &lsquo;26 (8–10 May 2026).

InternTrack puts AI to work on the three things that decide whether a UC student lands an internship or grad role:

- **Discovery** — an AI agent ranks fresh listings (curated UC seed + optional Adzuna) against the student&rsquo;s pasted CV with reasons for each match.
- **Tracker** — connect Gmail (read-only) and InternTrack&rsquo;s AI parses your inbox into a Kanban tracker. Hybrid mode: real OAuth when configured, deterministic seed when not, so the demo never breaks.
- **Coach** — open any tracked company and the studio researches values + likely questions, runs a voice-led mock interview (Web Speech API), and grades you afterwards.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind v4 · shadcn/ui · Motion (Framer)
- Supabase (Auth + Postgres + Storage) — RLS scoped to `auth.uid()`
- Vercel AI SDK 6 (`streamText` / `useChat`) over OpenRouter
- `googleapis` for Gmail (testing-mode OAuth, scope `gmail.readonly`)
- `@dnd-kit` for the Kanban
- Web Speech API (browser-native) for voice input

## Getting started

```bash
cp .env.example .env.local      # fill in real values
npm install                     # already done if you cloned recently
npm run dev                     # http://localhost:3000
```

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema:
   ```bash
   # Easiest — paste supabase/migrations/0001_initial.sql into the SQL editor.
   # Or, with Supabase CLI:
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
3. In **Auth → Providers**, enable **Google** and add your Google OAuth client.
4. Copy the URL + anon key + service role key into `.env.local`.

### 2. OpenRouter

Hackathon participants get an OpenRouter key from the SaaSathon dashboard. Add it as `OPENROUTER_API_KEY` and pick a model (default: `openai/gpt-5`) via `OPENROUTER_MODEL`.

### 3. Google OAuth (Gmail)

Required for the **real** Gmail integration. The seed-only fallback works without this.

1. In Google Cloud Console, create an OAuth 2.0 client (Web application).
2. Add `http://localhost:3000/api/gmail/callback` (and your prod URL) as redirect URIs.
3. Add the team&rsquo;s Gmail addresses as **test users** under OAuth consent screen → Audience.
4. Enable **Gmail API** in the project.
5. Drop client id, secret, and redirect URI into `.env.local`.
6. Generate `GMAIL_TOKEN_ENC_KEY` (32 bytes, base64):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### 4. Adzuna (optional)

Free tier — register at [developer.adzuna.com](https://developer.adzuna.com/) and drop the app id + key in. Without it we still rank the curated UC seed.

### 5. OpenAI (optional, for avatar)

Stretch feature — generates a stylised portrait at signup using `gpt-image-1`.

## Demo path

1. **/** Landing — hero, three feature blocks, marquee strip, CTA.
2. **/login** Google or email/password.
3. **/onboarding** Course + grad year + paste CV (a demo CV is one click away).
4. **/dashboard**
   - Hit **Run AI rescan** → 12 ranked roles materialise with score + reasons.
   - Hit **Sync Gmail** → in seed mode, parses 8 fixtures into the Kanban.
   - Drag cards across the 6 stages.
5. **Click any application&rsquo;s ↗** → `/company/[id]` Interview Studio
   - AI dossier renders (values, recent moves, likely questions).
   - Hold the mic, speak an answer, release — final transcript lands in the input.
   - Submit → the AI interviewer streams its next turn.
   - **Wrap & grade** → feedback card with strengths, gaps, and follow-up rehearsal.

## Repo layout

```
InternTrack/
├── app/
│   ├── (marketing)/page.tsx
│   ├── (auth)/login, onboarding
│   ├── (app)/dashboard, company/[appId]
│   ├── api/{jobs,gmail,company,interview,applications,cron}/...
│   └── auth/callback (Supabase OAuth bridge)
├── components/{auth,dashboard,interview,landing,ui}/
├── lib/
│   ├── ai/{openrouter,prompts}.ts
│   ├── gmail/{oauth,parser,seed}.ts
│   ├── jobs/{adzuna,discovery,seed}.ts
│   └── supabase/{client,server,middleware}.ts
├── supabase/migrations/0001_initial.sql
├── proxy.ts                    # Next.js 16 (formerly middleware.ts)
└── vercel.json                 # daily cron config
```

## Deploying

```bash
vercel link
vercel env pull .env.local       # if env already pushed to Vercel
vercel --prod
```

Cron `/api/cron/daily-sync` runs Mon–Fri at 7am NZ to sync connected Gmail accounts.

## License

Hackathon project — all rights reserved by the team.
