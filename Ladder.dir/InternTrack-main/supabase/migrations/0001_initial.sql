-- =====================================================================
-- InternTrack — initial schema
-- profiles, jobs, applications, email_events, interviews + RLS
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  course text,
  graduation_year int,
  resume_text text,
  avatar_url text,
  gmail_refresh_token_encrypted text,
  gmail_email text,
  gmail_last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- jobs (discovered listings, per user)
-- ---------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  title text not null,
  company text not null,
  location text,
  description text,
  source_url text not null,
  posted_at timestamptz,
  ai_match_score numeric,
  ai_match_reasons text[] default '{}',
  discovered_at timestamptz not null default now()
);

create index jobs_user_score_idx on public.jobs (user_id, ai_match_score desc nulls last);
create index jobs_user_company_idx on public.jobs (user_id, company);

-- ---------------------------------------------------------------------
-- applications (Kanban rows)
-- ---------------------------------------------------------------------
create type public.application_stage as enum (
  'wishlist','applied','screening','interview','offer','rejected','withdrawn'
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  job_id uuid references public.jobs on delete set null,
  company text not null,
  position text,
  stage public.application_stage not null default 'wishlist',
  applied_at timestamptz,
  last_email_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_stage_idx on public.applications (user_id, stage);

-- ---------------------------------------------------------------------
-- email_events (signals parsed out of Gmail or seed)
-- ---------------------------------------------------------------------
create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  application_id uuid references public.applications on delete cascade,
  gmail_message_id text,
  subject text,
  snippet text,
  ai_classified_stage public.application_stage,
  ai_summary text,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index email_events_gmail_msg_uidx
  on public.email_events (user_id, gmail_message_id)
  where gmail_message_id is not null;
create index email_events_application_idx on public.email_events (application_id);

-- ---------------------------------------------------------------------
-- interviews (per-company chatbot transcripts + research cache)
-- ---------------------------------------------------------------------
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  company text not null,
  ai_research jsonb,
  transcript jsonb not null default '[]'::jsonb,
  feedback jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interviews_user_company_idx on public.interviews (user_id, company);

-- ---------------------------------------------------------------------
-- updated_at touch trigger (shared)
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.touch_updated_at();
create trigger applications_touch before update on public.applications
  for each row execute procedure public.touch_updated_at();
create trigger interviews_touch before update on public.interviews
  for each row execute procedure public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.jobs          enable row level security;
alter table public.applications  enable row level security;
alter table public.email_events  enable row level security;
alter table public.interviews    enable row level security;

create policy "profiles: self select"   on public.profiles for select using (id = auth.uid());
create policy "profiles: self update"   on public.profiles for update using (id = auth.uid());
create policy "profiles: self insert"   on public.profiles for insert with check (id = auth.uid());

create policy "jobs: self crud"         on public.jobs         for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "applications: self crud" on public.applications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "email_events: self crud" on public.email_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interviews: self crud"   on public.interviews   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Storage bucket for avatars (created idempotently)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatars: read public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: write own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: update own"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
