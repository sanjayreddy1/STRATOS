-- Stratos initial schema (core tables for phases 1-5)
-- Enable extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  timezone text default 'Asia/Kolkata',
  age int,
  engineering_branch text,
  graduation_year int,
  target_date date,
  height_cm numeric,
  weight_kg numeric,
  fitness_baseline jsonb default '{}'::jsonb,
  weak_areas text[] default '{}',
  daily_hours numeric default 2,
  preferred_reminder_time time default '06:30',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Roadmap tasks
create table if not exists public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase int not null,
  month_index int not null,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending', -- pending, in_progress, done, missed, rescheduled
  original_due_date date,
  rescheduled_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Topics and progress
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  status text not null default 'not_started', -- not_started, learning, revising, strong
  confidence int not null default 1 check (confidence between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, category, name)
);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  status text,
  confidence int,
  logged_at timestamptz default now()
);

-- Tasks (daily/weekly planner)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  planned_minutes int,
  completed boolean default false,
  completed_at timestamptz,
  source text default 'manual', -- manual, roadmap, system
  roadmap_task_id uuid references public.roadmap_tasks(id) on delete set null,
  created_at timestamptz default now()
);

-- Daily logs
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  planned_tasks int default 0,
  completed_tasks int default 0,
  hours_studied numeric default 0,
  mood text,
  energy text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

-- Practice & test attempts
create table if not exists public.practice_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type text not null,
  practiced_at timestamptz default now(),
  score numeric,
  self_rating int,
  ai_feedback jsonb,
  weak_points text[],
  raw_input jsonb,
  created_at timestamptz default now()
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_type text not null,
  payload jsonb,
  result jsonb,
  score numeric,
  created_at timestamptz default now()
);

-- OLQ scores over time
create table if not exists public.olq_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null, -- wat,srt,tat,sd,ppdt,interview,mock
  scores jsonb not null,
  olq_tags text[] default '{}',
  created_at timestamptz default now()
);

-- Interview tracking
create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null for global seed
  question text not null,
  category text,
  my_answer text,
  ai_critique jsonb,
  status text default 'needs_work', -- needs_work, good
  revisit_on date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_snapshot jsonb,
  transcript jsonb,
  feedback jsonb,
  created_at timestamptz default now()
);

-- Mocks
create table if not exists public.mock_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, -- mock_interview, mock_ssb
  date date,
  source text,
  mentor text,
  feedback text,
  action_items text[],
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.mock_ssb_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_session_id uuid references public.mock_sessions(id) on delete cascade,
  report jsonb not null,
  created_at timestamptz default now()
);

-- Flashcards & SRS
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null for global
  front text not null,
  back text not null,
  tags text[] default '{}',
  source text default 'seed',
  ease_factor numeric default 2.5,
  interval_days int default 0,
  repetitions int default 0,
  due_at timestamptz default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Workout & fitness
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase text not null, -- base, build, peak
  week_start date,
  plan jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  workout_type text,
  exercises jsonb,
  run_distance_km numeric,
  run_time_sec int,
  pushups int,
  pullups int,
  situps int,
  notes text,
  fatigue int,
  created_at timestamptz default now()
);

create table if not exists public.fitness_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  body_weight_kg numeric,
  resting_hr int,
  sleep_hours numeric,
  hydration_liters numeric,
  nutrition_notes text,
  test_1_6km_sec int,
  created_at timestamptz default now()
);

-- Reminders & email
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text default 'custom', -- custom, revision, system
  run_at timestamptz,
  next_run_at timestamptz,
  timezone text default 'Asia/Kolkata',
  repeat_rule text, -- none,daily,weekly,monthly,rrule-like simple
  enabled boolean default true,
  last_sent_at timestamptz,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_brief boolean default true,
  daily_brief_time time default '06:30',
  evening_nudge boolean default true,
  evening_nudge_time time default '20:30',
  weekly_report boolean default true,
  revision_reminders boolean default true,
  milestone_countdown boolean default true,
  inactivity_alert boolean default true,
  recruitment_alert boolean default true,
  custom_reminders boolean default true,
  paused_all boolean default false,
  unsubscribe_token text default encode(gen_random_bytes(16), 'hex'),
  daily_cap int default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  to_email text not null,
  subject text not null,
  email_type text,
  idempotency_key text unique,
  status text not null, -- queued,sent,failed,skipped
  error text,
  provider_message_id text,
  attempts int default 0,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- News & notebook
create table if not exists public.news_cache (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text,
  source text,
  published_at timestamptz,
  content text,
  summary text,
  interview_angles jsonb,
  topics text[] default '{}',
  raw jsonb,
  fetched_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '6 hours')
);

create table if not exists public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  news_id uuid references public.news_cache(id) on delete set null,
  url text not null,
  title text,
  note text,
  created_at timestamptz default now(),
  unique(user_id, url)
);

create table if not exists public.notebook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.topics enable row level security;
alter table public.topic_progress enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.practice_logs enable row level security;
alter table public.test_attempts enable row level security;
alter table public.olq_scores enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.mock_sessions enable row level security;
alter table public.mock_ssb_reports enable row level security;
alter table public.flashcards enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_logs enable row level security;
alter table public.fitness_metrics enable row level security;
alter table public.reminders enable row level security;
alter table public.email_preferences enable row level security;
alter table public.email_logs enable row level security;
alter table public.news_cache enable row level security;
alter table public.saved_articles enable row level security;
alter table public.notebook_entries enable row level security;

-- Policies: owner-only (user_id = auth.uid()) or profile id = auth.uid()
create policy "profiles own" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "roadmap own" on public.roadmap_tasks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "topics own" on public.topics for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "topic_progress own" on public.topic_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks own" on public.tasks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily_logs own" on public.daily_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "practice_logs own" on public.practice_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "test_attempts own" on public.test_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "olq_scores own" on public.olq_scores for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interview_questions read global or own" on public.interview_questions for select to authenticated using (user_id is null or user_id = auth.uid());
create policy "interview_questions write own" on public.interview_questions for insert to authenticated with check (user_id = auth.uid());
create policy "interview_questions update own" on public.interview_questions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interview_questions delete own" on public.interview_questions for delete to authenticated using (user_id = auth.uid());
create policy "interview_sessions own" on public.interview_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mock_sessions own" on public.mock_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mock_ssb_reports own" on public.mock_ssb_reports for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "flashcards read global or own" on public.flashcards for select to authenticated using (user_id is null or user_id = auth.uid());
create policy "flashcards write own" on public.flashcards for insert to authenticated with check (user_id = auth.uid());
create policy "flashcards update own" on public.flashcards for update to authenticated using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid() or user_id is null);
create policy "flashcards delete own" on public.flashcards for delete to authenticated using (user_id = auth.uid());
create policy "workout_plans own" on public.workout_plans for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workout_logs own" on public.workout_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "fitness_metrics own" on public.fitness_metrics for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reminders own" on public.reminders for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "email_preferences own" on public.email_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "email_logs own select" on public.email_logs for select to authenticated using (user_id = auth.uid());
create policy "saved_articles own" on public.saved_articles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notebook_entries own" on public.notebook_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
-- news_cache readable by authenticated users (shared cache)
create policy "news_cache read" on public.news_cache for select to authenticated using (true);
-- service role bypasses RLS for cron/writes; no anon policies by default

-- Trigger: create profile & email prefs on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.email_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger topics_updated before update on public.topics for each row execute procedure public.set_updated_at();
create trigger daily_logs_updated before update on public.daily_logs for each row execute procedure public.set_updated_at();
create trigger reminders_updated before update on public.reminders for each row execute procedure public.set_updated_at();
create trigger email_preferences_updated before update on public.email_preferences for each row execute procedure public.set_updated_at();
create trigger notebook_updated before update on public.notebook_entries for each row execute procedure public.set_updated_at();
