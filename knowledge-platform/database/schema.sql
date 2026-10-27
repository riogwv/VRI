-- ============================================================================
-- Knowledge Platform — Database Schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL Editor.
-- ============================================================================

-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookmarks (user-saved content)
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content_type text not null, -- 'article' | 'fun-fact' | 'trivia' | 'news'
  content_id text not null,
  title text,
  category text,
  source text,
  created_at timestamptz default now(),
  unique (user_id, content_type, content_id)
);

-- Reactions (like / love / insightful / funny)
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content_type text not null,
  content_id text not null,
  reaction text not null check (reaction in ('like','love','insightful','funny')),
  created_at timestamptz default now(),
  unique (user_id, content_type, content_id, reaction)
);

-- Comments
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content_type text not null,
  content_id text not null,
  parent_id uuid references public.comments on delete cascade,
  body text not null check (length(body) > 0 and length(body) <= 2000),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reports (content moderation)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  content_type text not null,
  content_id text not null,
  reason text not null,
  status text default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  created_at timestamptz default now()
);

-- ============================================================================
-- Indexes
-- ============================================================================
create index idx_bookmarks_user on public.bookmarks(user_id);
create index idx_bookmarks_content on public.bookmarks(content_type, content_id);
create index idx_reactions_content on public.reactions(content_type, content_id);
create index idx_comments_content on public.comments(content_type, content_id);
create index idx_comments_parent on public.comments(parent_id);
create index idx_reports_status on public.reports(status);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;

-- Profiles: public read, own write
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Bookmarks: own read/write
create policy "Users can view own bookmarks" on public.bookmarks
  for select using (auth.uid() = user_id);
create policy "Users can insert own bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Reactions: own read/write
create policy "Users can view own reactions" on public.reactions
  for select using (auth.uid() = user_id);
create policy "Users can insert own reactions" on public.reactions
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own reactions" on public.reactions
  for delete using (auth.uid() = user_id);

-- Comments: public read, own write
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);
create policy "Users can insert own comments" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments
  for update using (auth.uid() = user_id);
create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Reports: authenticated users can insert; reading requires privileged access.
create policy "Authenticated users can insert reports" on public.reports
  for insert with check (auth.uid() = user_id);
-- No public read policy: add staff access only after defining trusted staff roles.