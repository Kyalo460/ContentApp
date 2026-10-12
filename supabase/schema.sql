-- ContentApp Database Schema
-- Run this in the Supabase SQL Editor to set up your project.

-- ==========================================================
-- PROFILES
-- ==========================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================================
-- CONTENT
-- ==========================================================
create table if not exists public.content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null check (type in ('image', 'video', 'live')),
  url text not null,
  thumbnail_url text,
  duration numeric,
  width integer,
  height integer,
  file_size bigint,
  mime_type text,
  tags text[] default '{}',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  view_count integer default 0,
  like_count integer default 0
);

create index if not exists content_created_at_idx on public.content (created_at desc);
create index if not exists content_published_idx on public.content (is_published, created_at desc);
create index if not exists content_type_idx on public.content (type);
create index if not exists content_tags_idx on public.content using gin (tags);

alter table public.content enable row level security;

drop policy if exists "Published content is public" on public.content;
create policy "Published content is public"
  on public.content for select using (is_published = true);

drop policy if exists "Authors can view all their own content" on public.content;
create policy "Authors can view all their own content"
  on public.content for select using (auth.uid() = author_id);

drop policy if exists "Authors can insert content" on public.content;
create policy "Authors can insert content"
  on public.content for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update their own content" on public.content;
create policy "Authors can update their own content"
  on public.content for update using (auth.uid() = author_id);

drop policy if exists "Authors can delete their own content" on public.content;
create policy "Authors can delete their own content"
  on public.content for delete using (auth.uid() = author_id);

-- View counter helper
create or replace function public.increment_view_count(content_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.content
  set view_count = view_count + 1
  where id = content_id;
end;
$$;

-- ==========================================================
-- LIKES (per-user, toggled from the lightbox)
-- ==========================================================
drop table if exists public.likes;
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, content_id)
);

alter table public.likes enable row level security;

drop policy if exists "Likes are viewable by everyone" on public.likes;
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

drop policy if exists "Users can like content" on public.likes;
create policy "Users can like content"
  on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unlike content" on public.likes;
create policy "Users can unlike content"
  on public.likes for delete using (auth.uid() = user_id);

create or replace function public.toggle_like(content_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  already_liked boolean;
begin
  select exists (
    select 1 from public.likes
    where user_id = auth.uid() and likes.content_id = toggle_like.content_id
  ) into already_liked;

  if already_liked then
    delete from public.likes
    where user_id = auth.uid() and likes.content_id = toggle_like.content_id;
    update public.content
    set like_count = greatest(like_count - 1, 0)
    where id = toggle_like.content_id;
    return false;
  else
    insert into public.likes (user_id, content_id)
    values (auth.uid(), toggle_like.content_id)
    on conflict do nothing;
    update public.content
    set like_count = like_count + 1
    where id = toggle_like.content_id;
    return true;
  end if;
end;
$$;

-- ==========================================================
-- LIVE STREAMS
-- ==========================================================
create table if not exists public.live_streams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  stream_key text not null,
  playback_url text,
  status text not null default 'idle' check (status in ('idle', 'live', 'ended')),
  started_at timestamptz,
  ended_at timestamptz,
  viewer_count integer default 0,
  max_viewers integer default 0,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  author_id uuid references public.profiles(id) on delete cascade not null
);

create index if not exists live_streams_status_idx on public.live_streams (status, created_at desc);

alter table public.live_streams enable row level security;

drop policy if exists "Streams are viewable by everyone" on public.live_streams;
create policy "Streams are viewable by everyone"
  on public.live_streams for select using (true);

drop policy if exists "Authors can insert streams" on public.live_streams;
create policy "Authors can insert streams"
  on public.live_streams for insert with check (auth.uid() = author_id);

drop policy if exists "Authors can update their own streams" on public.live_streams;
create policy "Authors can update their own streams"
  on public.live_streams for update using (auth.uid() = author_id);

drop policy if exists "Authors can delete their own streams" on public.live_streams;
create policy "Authors can delete their own streams"
  on public.live_streams for delete using (auth.uid() = author_id);

-- ==========================================================
-- STORAGE BUCKETS  (run after enabling Storage in the UI)
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;

drop policy if exists "Public read access" on storage.objects;
create policy "Public read access"
  on storage.objects for select
  using ( bucket_id = 'content' );

drop policy if exists "Authenticated users can upload" on storage.objects;
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'content' and auth.role() = 'authenticated' );

drop policy if exists "Owners can update their uploads" on storage.objects;
create policy "Owners can update their uploads"
  on storage.objects for update
  using ( bucket_id = 'content' and auth.uid() = owner )
  with check ( bucket_id = 'content' and auth.uid() = owner );

drop policy if exists "Owners can delete their uploads" on storage.objects;
create policy "Owners can delete their uploads"
  on storage.objects for delete
  using ( bucket_id = 'content' and auth.uid() = owner );

-- ==========================================================
-- UPDATED_AT HELPER
-- ==========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_set_updated_at on public.content;
create trigger content_set_updated_at
  before update on public.content
  for each row execute procedure public.set_updated_at();

drop trigger if exists live_streams_set_updated_at on public.live_streams;
create trigger live_streams_set_updated_at
  before update on public.live_streams
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ==========================================================
-- MAKE YOURSELF ADMININATOR
-- ==========================================================
-- After signing up, run this with your own email to unlock
-- admin access everywhere:
--   update public.profiles set is_admin = true where email = 'you@example.com';