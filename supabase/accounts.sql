-- Optional accounts (email + password) via Supabase Auth, with per-user
-- progress backup. Run once in your Supabase project (SQL Editor); safe to
-- re-run. Pairs with progress_sync.sql (the anonymous sync-code table).
--
-- Sessions auto-refresh client-side and Supabase does not time-box them by
-- default, so users stay signed in until they log out.
--
-- Tip: under Authentication → Sign In / Up → Email, turn OFF "Confirm email"
-- for instant sign-up (no SMTP needed), or configure your own SMTP sender.

-- One profile row per user, created automatically on sign-up.
-- `plan` is the future SaaS hook (free / pro / ...); everyone starts 'free'.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  plan       text not null default 'free',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One progress blob per user. Owner-only via RLS.
create table if not exists public.account_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.account_progress enable row level security;

drop policy if exists "own progress read" on public.account_progress;
create policy "own progress read" on public.account_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own progress insert" on public.account_progress;
create policy "own progress insert" on public.account_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "own progress update" on public.account_progress;
create policy "own progress update" on public.account_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- First name for personalisation (mirrored from auth user_metadata).
alter table public.profiles add column if not exists first_name text;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
