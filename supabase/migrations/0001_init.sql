-- ============================================================================
-- AFTO Connect — initial schema
-- Multi-tenant from day one: every row belongs to an organization; RLS keeps
-- tenants isolated. Public profile reads are exposed via narrow anon SELECT
-- policies (published profiles only). All public writes (leads / events / AI)
-- go through trusted server routes using the service-role key.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type plan_tier as enum ('personal', 'pro', 'ai', 'business');
create type member_role as enum ('owner', 'admin', 'member');
create type lead_status as enum ('new', 'contacted', 'archived');
create type event_type as enum (
  'profile_view', 'contact_save', 'whatsapp_click', 'linkedin_click',
  'email_click', 'website_click', 'lead_submit', 'ai_chat_start'
);

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  plan        plan_tier not null default 'pro',
  branding    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Mirror of auth.users (kept in sync by trigger below).
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  created_at  timestamptz not null default now()
);

create table memberships (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  role             member_role not null default 'owner',
  created_at       timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table profiles (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  slug             text not null unique,
  published        boolean not null default false,
  full_name        text not null,
  title            text,
  company          text,
  bio              text,
  avatar_url       text,
  logo_url         text,
  phone            text,
  email            text,
  website          text,
  whatsapp         text,
  linkedin         text,
  theme            jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table profile_links (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  type         text not null default 'custom',
  label        text not null,
  url          text not null,
  icon         text,
  sort_order   integer not null default 0
);

create table leads (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  profile_id       uuid not null references profiles(id) on delete cascade,
  full_name        text not null,
  company          text,
  email            text,
  phone            text,
  message          text,
  source           text,
  campaign         text,
  user_agent       text,
  referrer         text,
  status           lead_status not null default 'new',
  created_at       timestamptz not null default now()
);

create table events (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  profile_id       uuid not null references profiles(id) on delete cascade,
  type             event_type not null,
  source           text,
  campaign         text,
  user_agent       text,
  referrer         text,
  created_at       timestamptz not null default now()
);

create table ai_conversations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  profile_id       uuid not null references profiles(id) on delete cascade,
  visitor_ref      text,
  source           text,
  campaign         text,
  created_at       timestamptz not null default now()
);

create table ai_messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references ai_conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (hot paths: slug lookup, per-profile analytics/leads)
-- ---------------------------------------------------------------------------
create index idx_profiles_org on profiles(organization_id);
create index idx_profile_links_profile on profile_links(profile_id, sort_order);
create index idx_leads_profile on leads(profile_id, created_at desc);
create index idx_leads_org on leads(organization_id, created_at desc);
create index idx_events_profile on events(profile_id, created_at desc);
create index idx_events_org_type on events(organization_id, type);
create index idx_memberships_user on memberships(user_id);
create index idx_ai_conv_profile on ai_conversations(profile_id);
create index idx_ai_msg_conv on ai_messages(conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Triggers: keep users mirror in sync, maintain updated_at
-- ---------------------------------------------------------------------------
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on profiles
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Membership helper (SECURITY DEFINER avoids RLS recursion in policies)
-- ---------------------------------------------------------------------------
create or replace function is_org_member(org uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table organizations   enable row level security;
alter table users           enable row level security;
alter table memberships     enable row level security;
alter table profiles        enable row level security;
alter table profile_links   enable row level security;
alter table leads           enable row level security;
alter table events          enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages     enable row level security;

-- users: a user can read/update only their own mirror row.
create policy "users self read"   on users for select using (id = auth.uid());
create policy "users self update" on users for update using (id = auth.uid());

-- memberships: a user sees their own memberships.
create policy "memberships self" on memberships
  for select using (user_id = auth.uid());

-- organizations: members read their org; anon reads orgs that have a
-- published profile (needed to render the public page: name/plan/branding).
create policy "org member read" on organizations
  for select using (is_org_member(id));
create policy "org public read" on organizations
  for select to anon using (
    exists (
      select 1 from profiles p
      where p.organization_id = organizations.id and p.published
    )
  );
create policy "org member update" on organizations
  for update using (is_org_member(id));

-- profiles: members manage their org's profiles; anon reads published ones.
create policy "profiles member all" on profiles
  for all using (is_org_member(organization_id))
  with check (is_org_member(organization_id));
create policy "profiles public read" on profiles
  for select to anon using (published = true);

-- profile_links: follow their profile's visibility.
create policy "links member all" on profile_links
  for all using (
    is_org_member((select organization_id from profiles p where p.id = profile_id))
  )
  with check (
    is_org_member((select organization_id from profiles p where p.id = profile_id))
  );
create policy "links public read" on profile_links
  for select to anon using (
    exists (select 1 from profiles p where p.id = profile_id and p.published)
  );

-- leads / events / ai: members read within their org. Public WRITES are done
-- by trusted server routes with the service-role key (which bypasses RLS), so
-- no anon insert policies are defined here on purpose.
create policy "leads member read" on leads
  for select using (is_org_member(organization_id));
create policy "leads member update" on leads
  for update using (is_org_member(organization_id));

create policy "events member read" on events
  for select using (is_org_member(organization_id));

create policy "ai conv member read" on ai_conversations
  for select using (is_org_member(organization_id));
create policy "ai msg member read" on ai_messages
  for select using (
    is_org_member((
      select organization_id from ai_conversations c where c.id = conversation_id
    ))
  );
