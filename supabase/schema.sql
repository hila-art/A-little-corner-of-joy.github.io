-- Run this in the Supabase SQL Editor after creating the project.
-- Dashboard → SQL Editor → New query → paste → Run.

-- Anyone can sign up with an email magic code.
-- Each signed-in user can only read and write their own rows.

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    birthdate date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint display_name_length check (
        char_length(trim(display_name)) between 1 and 80
    )
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

create policy "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create table if not exists public.happy_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null,
    description text not null default '',
    category text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists happy_items_user_id_idx
    on public.happy_items (user_id);

alter table public.happy_items enable row level security;

drop policy if exists "happy_select_own" on public.happy_items;
drop policy if exists "happy_insert_own" on public.happy_items;
drop policy if exists "happy_update_own" on public.happy_items;
drop policy if exists "happy_delete_own" on public.happy_items;

create policy "happy_select_own"
    on public.happy_items for select
    using (auth.uid() = user_id);

create policy "happy_insert_own"
    on public.happy_items for insert
    with check (auth.uid() = user_id);

create policy "happy_update_own"
    on public.happy_items for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "happy_delete_own"
    on public.happy_items for delete
    using (auth.uid() = user_id);

create table if not exists public.photos (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    storage_path text not null,
    caption text not null default '',
    story text not null default '',
    favorite boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists photos_user_id_idx
    on public.photos (user_id);

alter table public.photos enable row level security;

drop policy if exists "photos_select_own" on public.photos;
drop policy if exists "photos_insert_own" on public.photos;
drop policy if exists "photos_update_own" on public.photos;
drop policy if exists "photos_delete_own" on public.photos;

create policy "photos_select_own"
    on public.photos for select
    using (auth.uid() = user_id);

create policy "photos_insert_own"
    on public.photos for insert
    with check (auth.uid() = user_id);

create policy "photos_update_own"
    on public.photos for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "photos_delete_own"
    on public.photos for delete
    using (auth.uid() = user_id);

create table if not exists public.playlists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    name text not null,
    description text not null default '',
    mood text not null,
    cover_path text,
    spotify_id text not null,
    spotify_url text not null,
    favorite boolean not null default false,
    created_at timestamptz not null default now(),
    unique (user_id, spotify_id)
);

create index if not exists playlists_user_id_idx
    on public.playlists (user_id);

alter table public.playlists enable row level security;

drop policy if exists "playlists_select_own" on public.playlists;
drop policy if exists "playlists_insert_own" on public.playlists;
drop policy if exists "playlists_update_own" on public.playlists;
drop policy if exists "playlists_delete_own" on public.playlists;

create policy "playlists_select_own"
    on public.playlists for select
    using (auth.uid() = user_id);

create policy "playlists_insert_own"
    on public.playlists for insert
    with check (auth.uid() = user_id);

create policy "playlists_update_own"
    on public.playlists for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "playlists_delete_own"
    on public.playlists for delete
    using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('user-media', 'user-media', false)
on conflict (id) do nothing;

drop policy if exists "media_select_own" on storage.objects;
drop policy if exists "media_insert_own" on storage.objects;
drop policy if exists "media_update_own" on storage.objects;
drop policy if exists "media_delete_own" on storage.objects;

create policy "media_select_own"
    on storage.objects for select
    using (
        bucket_id = 'user-media'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "media_insert_own"
    on storage.objects for insert
    with check (
        bucket_id = 'user-media'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "media_update_own"
    on storage.objects for update
    using (
        bucket_id = 'user-media'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "media_delete_own"
    on storage.objects for delete
    using (
        bucket_id = 'user-media'
        and auth.uid()::text = (storage.foldername(name))[1]
    );
