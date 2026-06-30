-- ════════════════════════════════════════════════════════════════
--  MySalma — Supabase schema
--  Paste this whole file into Supabase → SQL Editor → Run.
--  Safe to run more than once.
-- ════════════════════════════════════════════════════════════════

-- ---------- PROFILES (one row per staff member) ----------
create table if not exists public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  name      text not null default 'Teammate',
  role      text default 'Team member',
  team      text default 'PT',
  tagline   text default '',
  bio       text default '',
  avatar    text,           -- data URL or image URL
  cover     text,
  created_at timestamptz default now()
);

-- Auto-create a blank profile when a new user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Teammate'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- POSTS ----------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author      uuid not null references public.profiles(id) on delete cascade,
  body        text default '',
  media       jsonb default '[]'::jsonb,   -- [{ src }]
  featured    text,                        -- 'kudos' | 'win' | null
  kudos_names jsonb default '[]'::jsonb,
  kudos_tag   text,
  capsule     text,
  created_at  timestamptz default now()
);

-- ---------- REACTIONS ----------
create table if not exists public.reactions (
  id       uuid primary key default gen_random_uuid(),
  post_id  uuid not null references public.posts(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  emoji    text not null,
  unique (post_id, user_id, emoji)
);

-- ---------- COMMENTS ----------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  text       text not null,
  created_at timestamptz default now()
);

-- ---------- EVENTS ----------
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  host       uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  d          int,
  m          text,
  day        text,
  time       text,
  location   text,
  tag        text,
  color      text,
  created_at timestamptz default now()
);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

-- ---------- CREWS ----------
create table if not exists public.crews (
  id         uuid primary key default gen_random_uuid(),
  emoji      text default '🌟',
  name       text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.crew_members (
  crew_id uuid not null references public.crews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (crew_id, user_id)
);

-- ---------- SHIFT SWAPS ----------
create table if not exists public.swaps (
  id         uuid primary key default gen_random_uuid(),
  by         uuid not null references public.profiles(id) on delete cascade,
  need       text not null,
  offer      text default '',
  note       text default '',
  urgency    text default 'med',
  team       text default 'PT',
  created_at timestamptz default now()
);

create table if not exists public.swap_covers (
  swap_id uuid not null references public.swaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (swap_id, user_id)
);

-- ---------- MOOD + DAILY (personal, one per day) ----------
create table if not exists public.moods (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day     date not null,
  mood    text,
  primary key (user_id, day)
);

create table if not exists public.dailies (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day     date not null,
  answer  text,
  primary key (user_id, day)
);

-- ════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--  Everyone signed in can READ everything (it's an internal team space).
--  You can only WRITE rows that belong to you.
-- ════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','posts','reactions','comments','events','event_rsvps',
    'crews','crew_members','swaps','swap_covers','moods','dailies'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- READ: any authenticated user
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','posts','reactions','comments','events','event_rsvps',
    'crews','crew_members','swaps','swap_covers','moods','dailies'
  ] loop
    execute format('drop policy if exists "read_all" on public.%I;', t);
    execute format('create policy "read_all" on public.%I for select to authenticated using (true);', t);
  end loop;
end $$;

-- WRITE: only your own rows. The "owner column" differs per table.
-- profiles.id
drop policy if exists "own_write" on public.profiles;
create policy "own_write" on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- posts.author
drop policy if exists "own_write" on public.posts;
create policy "own_write" on public.posts for all to authenticated
  using (author = auth.uid()) with check (author = auth.uid());

-- tables with user_id
do $$
declare t text;
begin
  foreach t in array array[
    'reactions','comments','event_rsvps','crew_members','swap_covers','moods','dailies'
  ] loop
    execute format('drop policy if exists "own_write" on public.%I;', t);
    execute format('create policy "own_write" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());', t);
  end loop;
end $$;

-- events.host
drop policy if exists "own_write" on public.events;
create policy "own_write" on public.events for all to authenticated
  using (host = auth.uid()) with check (host = auth.uid());

-- crews.created_by (anyone signed in may create; only creator may edit/delete)
drop policy if exists "own_write" on public.crews;
create policy "own_write" on public.crews for all to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());

-- ════════════════════════════════════════════════════════════════
--  REALTIME — broadcast row changes so every open app updates live.
-- ════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','posts','reactions','comments','events','event_rsvps',
    'crews','crew_members','swaps','swap_covers','moods','dailies'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when others then null;  -- already added
    end;
  end loop;
end $$;


-- ════════════════════════════════════════════════════════════════
--  MEMBER APPROVALS  (admin approves / rejects new sign-ups)
--  Safe to run on a fresh OR an existing database. Re-runnable.
-- ════════════════════════════════════════════════════════════════

-- 1) New columns on profiles.
alter table public.profiles add column if not exists status   text    not null default 'pending';   -- 'pending' | 'approved' | 'rejected'
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2) Helper: is the current user an admin?  (SECURITY DEFINER avoids RLS recursion.)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 3) New sign-ups start as 'pending'. The very FIRST account becomes the admin
--    (auto-approved) so there's always someone who can approve everyone else.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare existing int;
begin
  select count(*) into existing from public.profiles;
  insert into public.profiles (id, name, status, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Teammate'),
    case when existing = 0 then 'approved' else 'pending' end,
    existing = 0
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- 4) Stop privilege escalation: a normal user editing their own profile can
--    never change their own status or admin flag. Only admins can.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null in the SQL Editor / service-role context — allow those
  -- (trusted admin console) to set status & is_admin freely.
  if auth.uid() is not null and not public.is_admin() then
    new.status   := old.status;
    new.is_admin := old.is_admin;
  end if;
  return new;
end; $$;

drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- 5) Admins may update ANY profile (to approve / reject). This adds to the
--    existing "own_write" policy — Postgres ORs policies for the same command.
drop policy if exists "admin_update_profiles" on public.profiles;
create policy "admin_update_profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 6) Bootstrap for an EXISTING database (people who signed up before this
--    feature existed): if there is no admin yet, grandfather everyone in as
--    'approved' and make the earliest account the admin. Runs only once.
do $$
begin
  if not exists (select 1 from public.profiles where is_admin) then
    update public.profiles set status = 'approved';
    update public.profiles set is_admin = true
      where id = (select id from public.profiles order by created_at asc limit 1);
  end if;
end $$;

-- ── Optional: manually make a specific person an admin (replace the email) ──
-- update public.profiles set is_admin = true, status = 'approved'
--   where id = (select id from auth.users where email = 'you@salma-rehab.org');
