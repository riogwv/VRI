-- Phase 7: account-owned progression; active game sessions remain browser-local.
alter table public.profiles add column if not exists bio text check (char_length(bio) <= 280);

create table if not exists public.player_progress (
  user_id uuid primary key references auth.users on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists idx_player_progress_updated_at on public.player_progress(updated_at desc);
alter table public.player_progress enable row level security;
create policy "Users can view own player progress" on public.player_progress for select using (auth.uid() = user_id);
create policy "Users can insert own player progress" on public.player_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own player progress" on public.player_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Existing bookmarks use upsert from the client; restrict updates to the owner too.
create policy "Users can update own bookmarks" on public.bookmarks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
