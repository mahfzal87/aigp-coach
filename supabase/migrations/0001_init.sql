-- AIGP Coach — content schema. All content is PUBLIC READ (anon SELECT);
-- writes happen only via the service-role seed script. No user data lives here
-- (progress is client-side in localStorage).

create table if not exists domains (
  id text primary key,
  code text not null,
  name text not null,
  summary text,
  min_q int,
  max_q int,
  sort int default 0
);

create table if not exists competencies (
  id text primary key,
  domain_id text references domains(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  min_q int,
  max_q int,
  sort int default 0
);
create index if not exists idx_competencies_domain on competencies(domain_id);

create table if not exists study_notes (
  id text primary key,
  competency_id text references competencies(id) on delete set null,
  title text not null,
  body_md text not null,
  tags text[] default '{}',
  sort int default 0,
  source text
);
create index if not exists idx_notes_competency on study_notes(competency_id);

create table if not exists questions (
  id text primary key,
  competency_id text references competencies(id) on delete cascade,
  type text not null,
  difficulty int not null default 1,
  scenario text,
  stem text not null,
  is_multiselect boolean default false,
  correct_explanation text,
  why_wrong jsonb default '{}',
  strategy_note text,
  trap_type text default 'none',
  bok_ref text,
  source text default 'authored',
  status text default 'live',
  created_at timestamptz default now()
);
create index if not exists idx_questions_competency on questions(competency_id, type, difficulty, status);

create table if not exists question_options (
  id bigint generated always as identity primary key,
  question_id text references questions(id) on delete cascade,
  label text not null,
  text text not null,
  is_correct boolean default false,
  sort int default 0
);
create index if not exists idx_options_question on question_options(question_id);

create table if not exists flashcards (
  id text primary key,
  competency_id text references competencies(id) on delete cascade,
  front text not null,
  back text not null,
  tags text[] default '{}'
);
create index if not exists idx_flashcards_competency on flashcards(competency_id);

create table if not exists law_updates (
  id text primary key,
  title text not null,
  body_md text not null,
  source_url text,
  jurisdiction text,
  published_date date,
  bok_relevant boolean default false,
  severity text default 'info',
  status text default 'published',
  created_at timestamptz default now()
);
create index if not exists idx_updates_status_date on law_updates(status, published_date desc);

create table if not exists content_meta (
  key text primary key,
  value text
);

-- ── Row Level Security: public read only ──
do $$
declare t text;
begin
  foreach t in array array['domains','competencies','study_notes','questions','question_options','flashcards','law_updates','content_meta']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read %1$s" on %1$I', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true)', t);
  end loop;
end $$;
