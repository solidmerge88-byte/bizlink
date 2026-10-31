-- Run in Supabase SQL Editor after creating your project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  roles text[] not null default '{}',
  education_level text,
  interests text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint allowed_roles check (roles <@ array['student','entrepreneur','creator','professional']::text[]),
  constraint allowed_education check (education_level is null or education_level in ('secondary','university','college')),
  constraint display_name_length check (char_length(display_name)<=80),
  constraint bio_length check (char_length(bio)<=500)
);
-- Private age information: never expose birth dates in public profiles.
create table if not exists public.account_age (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_date date not null,
  created_at timestamptz not null default now()
);
alter table public.account_age enable row level security;
-- No client-facing SELECT/INSERT/UPDATE policies: only the security-definer signup trigger writes it.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  dob date;
begin
  if coalesce(new.raw_user_meta_data ->> 'birth_date','') !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'Valid birth date required';
  end if;
  dob := (new.raw_user_meta_data ->> 'birth_date')::date;
  if dob > (current_date - interval '18 years')::date then
    raise exception 'BIZLINK beta requires age 18 or older';
  end if;
  insert into public.account_age(user_id,birth_date) values(new.id,dob);
  insert into public.profiles(id,display_name)
  values(new.id,coalesce(new.raw_user_meta_data ->> 'display_name',''))
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using ((select auth.uid())=id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
-- Public discovery should use a separate curated public_profiles view/table later, not expose private profile rows.
