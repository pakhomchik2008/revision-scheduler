-- Revision Scheduler schema. Run in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  exam_date date not null,
  color text not null default '#6366F1',
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  difficulty smallint not null default 2 check (difficulty between 1 and 3),
  notes text default '',
  order_index int not null default 0
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  scheduled_date date not null,
  completed boolean not null default false,
  skipped boolean not null default false,
  rating smallint check (rating between 1 and 4),
  duration_minutes int default 0,
  repetition_count int not null default 0,
  ease_factor real not null default 2.5,
  next_review_date date,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_date_idx
  on public.study_sessions (user_id, scheduled_date);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_study_hours int not null default 3 check (daily_study_hours between 1 and 8),
  study_start_hour int not null default 9 check (study_start_hour between 0 and 23),
  include_weekends boolean not null default true,
  timezone text not null default 'UTC'
);

-- Row Level Security
alter table public.exams enable row level security;
alter table public.topics enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_settings enable row level security;

create policy "own exams" on public.exams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own topics" on public.topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own sessions" on public.study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
