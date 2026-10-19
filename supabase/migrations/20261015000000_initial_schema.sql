-- Supabase Migration: 20261015000000_initial_schema.sql
-- BuildProfile AI Database Schema and Strict Row-Level Security (RLS)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Helper function for updating updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ====================================================================
-- 1. PROFILES TABLE
-- ====================================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text,
  avatar_url text,
  location text,
  linkedin_url text,
  current_status text check (current_status in ('Student', 'Fresher', 'Professional', 'Switcher')),
  headline text,
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  certifications jsonb default '[]'::jsonb,
  skills text[] default '{}'::text[],
  current_industry text,
  target_industry text,
  target_roles text[] default '{}'::text[],
  career_goals text[] default '{}'::text[],
  preferences jsonb default '{"tone": "Professional", "targetAudience": "Industry Peers", "postingFrequency": "Weekly"}'::jsonb,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Automatically create profile on new user registration in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ====================================================================
-- 2. PROFILE AUDITS TABLE
-- ====================================================================
create table if not exists public.profile_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  category_scores jsonb not null default '{}'::jsonb,
  strengths text[] default '{}'::text[],
  recommendations jsonb not null default '[]'::jsonb,
  action_plan jsonb default '[]'::jsonb,
  raw_input_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.profile_audits enable row level security;

create policy "Users can view their own profile audits"
  on public.profile_audits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile audits"
  on public.profile_audits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile audits"
  on public.profile_audits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own profile audits"
  on public.profile_audits for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- 3. CONTENT CONVERSATIONS TABLE
-- ====================================================================
create table if not exists public.content_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.content_conversations enable row level security;

create policy "Users can view their own content conversations"
  on public.content_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own content conversations"
  on public.content_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own content conversations"
  on public.content_conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own content conversations"
  on public.content_conversations for delete
  using (auth.uid() = user_id);

create trigger tr_content_conversations_updated_at
  before update on public.content_conversations
  for each row execute function public.handle_updated_at();

-- ====================================================================
-- 4. CONTENT MESSAGES TABLE
-- ====================================================================
create table if not exists public.content_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.content_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.content_messages enable row level security;

create policy "Users can view their own content messages"
  on public.content_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own content messages"
  on public.content_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own content messages"
  on public.content_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own content messages"
  on public.content_messages for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- 5. POST DRAFTS TABLE
-- ====================================================================
create table if not exists public.post_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  hook text,
  body text not null,
  hashtags text[] default '{}'::text[],
  cta text,
  image_url text,
  image_source text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'archived', 'published')),
  topic text,
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.post_drafts enable row level security;

create policy "Users can view their own post drafts"
  on public.post_drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own post drafts"
  on public.post_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own post drafts"
  on public.post_drafts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own post drafts"
  on public.post_drafts for delete
  using (auth.uid() = user_id);

create trigger tr_post_drafts_updated_at
  before update on public.post_drafts
  for each row execute function public.handle_updated_at();

-- ====================================================================
-- 6. CONNECTION SUGGESTIONS TABLE
-- ====================================================================
create table if not exists public.connection_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  professional_title text,
  organisation text,
  location text,
  profile_url text,
  relevance_score integer check (relevance_score >= 0 and relevance_score <= 100),
  relevance_explanation text,
  suggested_message text,
  status text not null default 'saved' check (status in ('saved', 'contacted', 'dismissed')),
  created_at timestamptz default now()
);

alter table public.connection_suggestions enable row level security;

create policy "Users can view their own connection suggestions"
  on public.connection_suggestions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connection suggestions"
  on public.connection_suggestions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connection suggestions"
  on public.connection_suggestions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own connection suggestions"
  on public.connection_suggestions for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- 7. CAREER MILESTONES TABLE
-- ====================================================================
create table if not exists public.career_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.career_milestones enable row level security;

create policy "Users can view their own career milestones"
  on public.career_milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert their own career milestones"
  on public.career_milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own career milestones"
  on public.career_milestones for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own career milestones"
  on public.career_milestones for delete
  using (auth.uid() = user_id);

create trigger tr_career_milestones_updated_at
  before update on public.career_milestones
  for each row execute function public.handle_updated_at();

-- ====================================================================
-- 8. USER ACTIVITY TABLE
-- ====================================================================
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.user_activity enable row level security;

create policy "Users can view their own user activity"
  on public.user_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert their own user activity"
  on public.user_activity for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profile_audits_user_id on public.profile_audits(user_id);
create index if not exists idx_content_conversations_user_id on public.content_conversations(user_id);
create index if not exists idx_content_messages_conversation_id on public.content_messages(conversation_id);
create index if not exists idx_content_messages_user_id on public.content_messages(user_id);
create index if not exists idx_post_drafts_user_id on public.post_drafts(user_id);
create index if not exists idx_connection_suggestions_user_id on public.connection_suggestions(user_id);
create index if not exists idx_career_milestones_user_id on public.career_milestones(user_id);
create index if not exists idx_user_activity_user_id on public.user_activity(user_id);
