-- ================================================================
-- OJT TRACKER — FIXED SUPABASE SQL SETUP (No Recursion)
-- Paste this ENTIRE file into: Supabase → SQL Editor → New Query → Run
-- ================================================================

-- ── 1. PROFILES ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  email            text not null,
  full_name        text default '',
  school           text default '',
  role             text default 'user' check (role in ('user','admin')),
  required_hours   integer default 500,
  company_name     text default '',
  supervisor_name  text default '',
  department       text default '',
  start_date       date,
  end_date         date,
  is_active        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── 2. LOGS ──────────────────────────────────────────────────────
create table if not exists public.logs (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references public.profiles(id) on delete cascade not null,
  date           date not null,
  time_in        time,
  time_out       time,
  break_minutes  integer default 0,
  hours_worked   numeric(5,2) default 0,
  description    text default '',
  tasks          text[] default '{}',
  mood           integer default 3 check (mood between 1 and 5),
  created_at     timestamptz default now()
);

-- ── 3. TASKS ─────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  title        text not null,
  description  text default '',
  priority     text default 'normal' check (priority in ('low','normal','high')),
  status       text default 'todo' check (status in ('todo','in-progress','done')),
  due_date     date,
  created_at   timestamptz default now()
);

-- ── 4. NOTES ─────────────────────────────────────────────────────
create table if not exists public.notes (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text default '',
  content     text not null,
  color       text default '#4f46e5',
  created_at  timestamptz default now()
);

-- ── 5. ANNOUNCEMENTS ─────────────────────────────────────────────
create table if not exists public.announcements (
  id         uuid default gen_random_uuid() primary key,
  admin_id   uuid references public.profiles(id) on delete set null,
  admin_name text default 'Admin',
  title      text not null,
  content    text not null,
  priority   text default 'normal' check (priority in ('low','normal','high','urgent')),
  created_at timestamptz default now()
);

-- ================================================================
-- SECURITY DEFINER FUNCTION — THE FIX FOR INFINITE RECURSION
-- Checks role via auth.users metadata, NOT by querying profiles
-- This breaks the recursion loop completely.
-- ================================================================
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table public.profiles      enable row level security;
alter table public.logs          enable row level security;
alter table public.tasks         enable row level security;
alter table public.notes         enable row level security;
alter table public.announcements enable row level security;

-- Drop ALL existing policies cleanly
drop policy if exists "profiles_select_own"    on public.profiles;
drop policy if exists "profiles_select_admin"  on public.profiles;
drop policy if exists "profiles_insert_own"    on public.profiles;
drop policy if exists "profiles_update_own"    on public.profiles;
drop policy if exists "profiles_update_admin"  on public.profiles;
drop policy if exists "logs_own"               on public.logs;
drop policy if exists "logs_admin"             on public.logs;
drop policy if exists "tasks_own"              on public.tasks;
drop policy if exists "tasks_admin"            on public.tasks;
drop policy if exists "notes_own"              on public.notes;
drop policy if exists "ann_read"               on public.announcements;
drop policy if exists "ann_admin"              on public.announcements;

-- ── Profiles policies ────────────────────────────────────────────
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.get_my_role() = 'admin');

-- ── Logs policies ────────────────────────────────────────────────
create policy "logs_own"
  on public.logs for all
  using (auth.uid() = user_id);

create policy "logs_admin"
  on public.logs for all
  using (public.get_my_role() = 'admin');

-- ── Tasks policies ───────────────────────────────────────────────
create policy "tasks_own"
  on public.tasks for all
  using (auth.uid() = user_id);

create policy "tasks_admin"
  on public.tasks for all
  using (public.get_my_role() = 'admin');

-- ── Notes policies ───────────────────────────────────────────────
create policy "notes_own"
  on public.notes for all
  using (auth.uid() = user_id);

-- ── Announcements policies ───────────────────────────────────────
create policy "ann_read"
  on public.announcements for select
  using (auth.uid() is not null);

create policy "ann_admin"
  on public.announcements for all
  using (public.get_my_role() = 'admin');

-- ================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, school)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'school', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- UPDATED_AT TRIGGER
-- ================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ================================================================
-- DONE! After signing up, make yourself admin with:
--   update public.profiles set role = 'admin' where email = 'YOUR@EMAIL.com';
-- ================================================================
