-- FairMeet database schema
-- Run this in your Supabase SQL Editor to set up the database

-- profiles table: auto-created on user signup via trigger
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  home_location jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- friends table: saved contacts with locations
create table public.friends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  location jsonb not null,
  avatar_color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- groups table
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  emoji text default '👥',
  created_at timestamptz default now()
);

-- group_members junction table
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  friend_id uuid references public.friends(id) on delete cascade,
  primary key (group_id, friend_id)
);

-- meetup_history table
create table public.meetup_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  participants jsonb not null,
  meeting_point jsonb not null,
  travel_mode text,
  algorithm text,
  total_distance float,
  total_duration float,
  share_token text unique,
  created_at timestamptz default now()
);

-- Indexes
create index idx_friends_user_id on public.friends(user_id);
create index idx_groups_user_id on public.groups(user_id);
create index idx_meetup_history_user_id on public.meetup_history(user_id);
create index idx_meetup_history_share_token on public.meetup_history(share_token);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.friends enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.meetup_history enable row level security;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Friends policies
create policy "Users can read own friends"
  on public.friends for select using (auth.uid() = user_id);
create policy "Users can insert own friends"
  on public.friends for insert with check (auth.uid() = user_id);
create policy "Users can update own friends"
  on public.friends for update using (auth.uid() = user_id);
create policy "Users can delete own friends"
  on public.friends for delete using (auth.uid() = user_id);

-- Groups policies
create policy "Users can read own groups"
  on public.groups for select using (auth.uid() = user_id);
create policy "Users can insert own groups"
  on public.groups for insert with check (auth.uid() = user_id);
create policy "Users can update own groups"
  on public.groups for update using (auth.uid() = user_id);
create policy "Users can delete own groups"
  on public.groups for delete using (auth.uid() = user_id);

-- Group members policies
create policy "Users can read own group members"
  on public.group_members for select
  using (exists (select 1 from public.groups where groups.id = group_members.group_id and groups.user_id = auth.uid()));
create policy "Users can insert own group members"
  on public.group_members for insert
  with check (exists (select 1 from public.groups where groups.id = group_members.group_id and groups.user_id = auth.uid()));
create policy "Users can delete own group members"
  on public.group_members for delete
  using (exists (select 1 from public.groups where groups.id = group_members.group_id and groups.user_id = auth.uid()));

-- Meetup history policies
create policy "Users can read own meetup history"
  on public.meetup_history for select using (auth.uid() = user_id);
create policy "Anyone can read shared meetups"
  on public.meetup_history for select using (share_token is not null);
create policy "Users can insert own meetup history"
  on public.meetup_history for insert with check (auth.uid() = user_id);
create policy "Users can delete own meetup history"
  on public.meetup_history for delete using (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
