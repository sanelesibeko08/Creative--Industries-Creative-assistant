-- ─────────────────────────────────────────────────────────────
-- Creative Ideation & Storytelling Assistant — Initial Schema
-- Migration: 001_initial_schema.sql
-- Apply this via the Supabase dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- ── sessions ──────────────────────────────────────────────────
-- One row per creative working session.
-- `mode` reflects the last active mode (brainstorm | outline | draft | visual).
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default 'Untitled Session',
  mode       text not null default 'brainstorm'
               check (mode in ('brainstorm', 'outline', 'draft', 'visual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on sessions
  for each row execute function update_updated_at();

-- ── messages ──────────────────────────────────────────────────
-- One row per user/assistant exchange within a session.
-- `metadata` stores mode-specific extras (outline nodes, sd prompt, image url, etc.)
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null default '',
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_session_id_idx on messages(session_id);

-- ── preferences ───────────────────────────────────────────────
-- Single-row-per-key preference store (no user auth needed).
-- Known keys: preferred_genre, preferred_tone, preferred_style
create table if not exists preferences (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb not null default 'null',
  updated_at timestamptz not null default now()
);

create trigger preferences_updated_at
  before update on preferences
  for each row execute function update_updated_at();

-- Seed default preference rows so reads never return null
insert into preferences (key, value) values
  ('preferred_genre', '"fantasy"'),
  ('preferred_tone',  '"neutral"'),
  ('preferred_style', '"descriptive"')
on conflict (key) do nothing;

-- ── Row-Level Security (open access — single-user demo) ───────
alter table sessions    enable row level security;
alter table messages    enable row level security;
alter table preferences enable row level security;

create policy "allow_all_sessions"    on sessions    for all using (true) with check (true);
create policy "allow_all_messages"    on messages    for all using (true) with check (true);
create policy "allow_all_preferences" on preferences for all using (true) with check (true);
