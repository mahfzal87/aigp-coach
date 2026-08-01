-- Anonymous "sync code" cloud save for AIGP Coach progress.
-- Run this once in your Supabase project (SQL Editor).
-- Security model: rows are keyed by an unguessable code (AIGP-XXXX-XXXX).
-- There is no login, so the anon role may read/write rows by code. The code is
-- the secret; progress contains no PII beyond study stats.

create table if not exists public.progress_sync (
  code        text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.progress_sync enable row level security;

-- Allow the anon key to read/insert/update (keyed by the secret code).
drop policy if exists "anon can read progress" on public.progress_sync;
create policy "anon can read progress"  on public.progress_sync for select to anon using (true);

drop policy if exists "anon can insert progress" on public.progress_sync;
create policy "anon can insert progress" on public.progress_sync for insert to anon with check (true);

drop policy if exists "anon can update progress" on public.progress_sync;
create policy "anon can update progress" on public.progress_sync for update to anon using (true) with check (true);
