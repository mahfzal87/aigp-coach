-- Multi-exam support: progress rows (both the anonymous sync codes and the
-- account backups) become one row PER EXAM. Existing rows are AIGP's.
-- Run once in the SQL Editor (safe to re-run).

alter table public.progress_sync add column if not exists exam_id text not null default 'aigp';
alter table public.progress_sync drop constraint if exists progress_sync_pkey;
alter table public.progress_sync add primary key (code, exam_id);

alter table public.account_progress add column if not exists exam_id text not null default 'aigp';
alter table public.account_progress drop constraint if exists account_progress_pkey;
alter table public.account_progress add primary key (user_id, exam_id);
