-- 0001_identity.sql
-- Identity and roles: the slice of the schema that authentication itself
-- depends on. Content, engagement, and analytics tables (Section 2 of
-- ARCHITECTURE.md) are added in the Milestone 4 migration — this migration
-- is deliberately scoped to what Milestone 3 (Authentication) requires.

create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'editor', 'author', 'moderator', 'user');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is
  'One row per auth.users row. Role elevation (author/editor/admin) is a '
  'manual/admin-panel action only — never self-service, so signup can '
  'never grant elevated access.';

-- Keep updated_at current on every mutation, reused by every future table
-- that needs the same behavior (see Milestone 4 migration).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth.users row appears (email
-- signup or OAuth). Username is derived from the auth metadata Supabase
-- populates for OAuth providers, falling back to the email local-part,
-- with a random suffix to guarantee uniqueness without a retry loop.
create or replace function handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
begin
  base_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'preferred_username',
    split_part(new.email, '@', 1)
  );
  final_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'))
    || '_' || substr(new.id::text, 1, 6);

  insert into profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ RLS ============

alter table profiles enable row level security;

-- Reusable role-check function so every future table's RLS policy calls
-- one function instead of repeating the same subquery (see ARCHITECTURE.md
-- Section 2 — this is that shared function).
create or replace function is_role(roles user_role[])
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = any(roles)
  );
$$ language sql security definer stable;

create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (
    -- Prevent self-elevation: a user can update their own row, but the
    -- `role` column can only be changed by an admin (enforced below).
    auth.uid() = id and role = (select role from profiles where id = auth.uid())
  );

create policy "Admins can update any profile including role"
  on profiles for update
  using (is_role(array['admin']::user_role[]));

create index idx_profiles_role on profiles(role);
create index idx_profiles_username on profiles(username);
