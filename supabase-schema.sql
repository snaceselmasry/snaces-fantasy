-- SNACES FOOTBALL: Supabase SQL setup
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique,
 created_at timestamptz not null default now()
);
create table if not exists public.game_scores (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 game text not null,
 score integer not null default 0 check (score >= 0),
 played_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.game_scores enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "profile owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profile owner update" on public.profiles for update using (auth.uid() = id);
create policy "scores readable" on public.game_scores for select using (true);
create policy "score owner insert" on public.game_scores for insert with check (auth.uid() = user_id);
create index if not exists game_scores_score_idx on public.game_scores(score desc);
