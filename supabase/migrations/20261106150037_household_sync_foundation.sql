-- Angebotsküche: secure, household-scoped storage for the existing v1 app-state
-- payload. The private tables are intentionally not part of the Data API.

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated;

create table app_private.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table app_private.household_members (
  household_id uuid not null references app_private.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index household_members_user_id_idx
  on app_private.household_members (user_id, household_id);

create table app_private.household_state (
  household_id uuid primary key references app_private.households (id) on delete cascade,
  payload jsonb not null,
  revision bigint not null check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  check (jsonb_typeof(payload) = 'object'),
  check (payload -> 'version' = '1'::jsonb),
  check (octet_length(payload::text) <= 600000)
);

alter table app_private.households enable row level security;
alter table app_private.household_members enable row level security;
alter table app_private.household_state enable row level security;

revoke all on all tables in schema app_private from public, anon, authenticated;

-- This helper rejects missing and anonymous Auth sessions. Supabase anonymous
-- users also use the authenticated Postgres role, so role checks alone are not
-- sufficient for data ownership.
create or replace function app_private.require_user_id()
returns uuid
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null
     or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception using
      errcode = '42501',
      message = 'A non-anonymous signed-in user is required.';
  end if;
  return v_user_id;
end;
$$;

create or replace function app_private.create_household_impl(p_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := app_private.require_user_id();
  v_household_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
begin
  if char_length(v_name) not between 1 and 80 then
    raise exception using errcode = '22023', message = 'Household name must be 1 to 80 characters.';
  end if;

  insert into app_private.households (name, created_by)
  values (v_name, v_user_id)
  returning id into v_household_id;

  insert into app_private.household_members (household_id, user_id, role)
  values (v_household_id, v_user_id, 'owner');

  return v_household_id;
end;
$$;

create or replace function app_private.list_my_households_impl()
returns table (
  household_id uuid,
  name text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := app_private.require_user_id();
begin
  return query
  select h.id, h.name, hm.role, h.created_at
  from app_private.households as h
  join app_private.household_members as hm on hm.household_id = h.id
  where hm.user_id = v_user_id
  order by h.created_at, h.id;
end;
$$;

create or replace function app_private.get_household_state_impl(p_household_id uuid)
returns table (
  payload jsonb,
  revision bigint,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := app_private.require_user_id();
begin
  if not exists (
    select 1
    from app_private.household_members as hm
    where hm.household_id = p_household_id and hm.user_id = v_user_id
  ) then
    raise exception using errcode = '42501', message = 'Not a member of this household.';
  end if;

  return query
  select s.payload, s.revision, s.updated_at
  from app_private.household_state as s
  where s.household_id = p_household_id;
end;
$$;

create or replace function app_private.save_household_state_impl(
  p_household_id uuid,
  p_expected_revision bigint,
  p_payload jsonb
)
returns table (
  revision bigint,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := app_private.require_user_id();
  v_key text;
  v_array_keys text[] := array[
    'pantry', 'favorites', 'dismissedRecipes', 'pinnedRecipes',
    'customOffers', 'manualShoppingItems'
  ];
  v_object_keys text[] := array[
    'settings', 'shoppingChecks', 'liveOfferStatus', 'manualPlan',
    'recipeRatings', 'suggestionPreferences'
  ];
  v_revision bigint;
  v_updated_at timestamptz;
begin
  if not exists (
    select 1
    from app_private.household_members as hm
    where hm.household_id = p_household_id
      and hm.user_id = v_user_id
      and hm.role in ('owner', 'editor')
  ) then
    raise exception using errcode = '42501', message = 'Household edit permission is required.';
  end if;

  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception using errcode = '22023', message = 'Expected revision must be zero or greater.';
  end if;

  if p_payload is null
     or jsonb_typeof(p_payload) <> 'object'
     or p_payload -> 'version' is distinct from '1'::jsonb then
    raise exception using errcode = '22023', message = 'Unsupported or invalid app-state payload.';
  end if;

  foreach v_key in array v_array_keys loop
    if p_payload ? v_key then
      if jsonb_typeof(p_payload -> v_key) <> 'array' then
        raise exception using errcode = '22023', message = 'Invalid array in app-state payload.';
      end if;
      if jsonb_array_length(p_payload -> v_key) > 5000 then
        raise exception using errcode = '22023', message = 'App-state array exceeds the item limit.';
      end if;
    end if;
  end loop;

  foreach v_key in array v_object_keys loop
    if p_payload ? v_key and jsonb_typeof(p_payload -> v_key) <> 'object' then
      raise exception using errcode = '22023', message = 'Invalid object in app-state payload.';
    end if;
  end loop;

  if octet_length(p_payload::text) > 600000 then
    raise exception using errcode = '22023', message = 'App-state payload exceeds 600000 bytes.';
  end if;

  if p_expected_revision = 0 then
    insert into app_private.household_state (
      household_id, payload, revision, updated_by
    )
    values (p_household_id, p_payload, 1, v_user_id)
    on conflict (household_id) do nothing
    returning household_state.revision, household_state.updated_at
      into v_revision, v_updated_at;
  else
    update app_private.household_state as s
    set payload = p_payload,
        revision = s.revision + 1,
        updated_at = now(),
        updated_by = v_user_id
    where s.household_id = p_household_id
      and s.revision = p_expected_revision
    returning s.revision, s.updated_at into v_revision, v_updated_at;
  end if;

  if v_revision is null then
    raise exception using
      errcode = '40001',
      message = 'Household state changed on another device; reload and merge before saving.';
  end if;

  return query select v_revision, v_updated_at;
end;
$$;

-- Public RPC wrappers are SECURITY INVOKER. Their implementations stay in the
-- non-exposed schema and perform the authorization checks before touching data.
create or replace function public.create_household(p_name text)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select app_private.create_household_impl(p_name); $$;

create or replace function public.list_my_households()
returns table (
  household_id uuid,
  name text,
  role text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$ select * from app_private.list_my_households_impl(); $$;

create or replace function public.get_household_state(p_household_id uuid)
returns table (
  payload jsonb,
  revision bigint,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$ select * from app_private.get_household_state_impl(p_household_id); $$;

create or replace function public.save_household_state(
  p_household_id uuid,
  p_expected_revision bigint,
  p_payload jsonb
)
returns table (
  revision bigint,
  updated_at timestamptz
)
language sql
security invoker
set search_path = ''
as $$ select * from app_private.save_household_state_impl(p_household_id, p_expected_revision, p_payload); $$;

revoke all on function app_private.require_user_id() from public, anon, authenticated;
revoke all on function app_private.create_household_impl(text) from public, anon, authenticated;
revoke all on function app_private.list_my_households_impl() from public, anon, authenticated;
revoke all on function app_private.get_household_state_impl(uuid) from public, anon, authenticated;
revoke all on function app_private.save_household_state_impl(uuid, bigint, jsonb) from public, anon, authenticated;

grant execute on function app_private.require_user_id() to authenticated;
grant execute on function app_private.create_household_impl(text) to authenticated;
grant execute on function app_private.list_my_households_impl() to authenticated;
grant execute on function app_private.get_household_state_impl(uuid) to authenticated;
grant execute on function app_private.save_household_state_impl(uuid, bigint, jsonb) to authenticated;

revoke all on function public.create_household(text) from public, anon, authenticated;
revoke all on function public.list_my_households() from public, anon, authenticated;
revoke all on function public.get_household_state(uuid) from public, anon, authenticated;
revoke all on function public.save_household_state(uuid, bigint, jsonb) from public, anon, authenticated;

grant execute on function public.create_household(text) to authenticated;
grant execute on function public.list_my_households() to authenticated;
grant execute on function public.get_household_state(uuid) to authenticated;
grant execute on function public.save_household_state(uuid, bigint, jsonb) to authenticated;

comment on schema app_private is 'Private Angebotsküche household data; do not expose through the Supabase Data API.';
comment on table app_private.household_state is 'Versioned v1 app-state aggregate; saves use compare-and-swap revisions to detect cross-device conflicts.';
