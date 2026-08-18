-- Plancify MVP database schema
-- Paste this entire file into Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- The application uses Clerk for authentication and a Supabase secret key only
-- inside verified server routes. Browser roles receive no direct table access.

begin;

-- ---------------------------------------------------------------------------
-- 1. Early-access and school-pilot enquiries
-- ---------------------------------------------------------------------------

create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  email text not null,
  audience text not null,
  school_name text,
  contact_name text,
  student_range text,
  source text not null default 'planify-local-site',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint early_access_email_is_normalized
    check (
      email = lower(trim(email))
      and char_length(email) between 3 and 254
    ),
  constraint early_access_audience_value
    check (audience in ('family', 'school')),
  constraint early_access_clerk_user_id_length
    check (
      clerk_user_id is null
      or char_length(clerk_user_id) between 6 and 160
    ),
  constraint early_access_school_name_matches_audience
    check (
      (
        audience = 'family'
        and school_name is null
        and contact_name is null
        and student_range is null
      )
      or
      (
        audience = 'school'
        and char_length(trim(school_name)) between 2 and 160
        and char_length(trim(contact_name)) between 2 and 100
        and student_range in ('Under 150', '150-300', '300-600', '600+')
      )
    ),
  constraint early_access_email_audience_unique
    unique (email, audience)
);

-- Makes the script compatible with a database where an earlier Plancify
-- enquiry table was already created before the school-pilot fields existed.
alter table public.early_access_signups
  add column if not exists clerk_user_id text,
  add column if not exists contact_name text,
  add column if not exists student_range text,
  add column if not exists source text not null default 'planify-local-site',
  add column if not exists updated_at timestamptz not null default now();

-- Replace older, less complete checks with the final MVP checks. This block is
-- intentionally rerunnable; every constraint is recreated with the same name.
alter table public.early_access_signups
  drop constraint if exists early_access_email_is_normalized,
  drop constraint if exists early_access_audience_value,
  drop constraint if exists early_access_clerk_user_id_length,
  drop constraint if exists early_access_school_name_matches_audience,
  drop constraint if exists early_access_contact_name_length,
  drop constraint if exists early_access_student_range_value;

alter table public.early_access_signups
  add constraint early_access_email_is_normalized
    check (
      email = lower(trim(email))
      and char_length(email) between 3 and 254
    ),
  add constraint early_access_audience_value
    check (audience in ('family', 'school')),
  add constraint early_access_clerk_user_id_length
    check (
      clerk_user_id is null
      or char_length(clerk_user_id) between 6 and 160
    ),
  add constraint early_access_school_name_matches_audience
    check (
      (
        audience = 'family'
        and school_name is null
        and contact_name is null
        and student_range is null
      )
      or
      (
        audience = 'school'
        and char_length(trim(school_name)) between 2 and 160
        and char_length(trim(contact_name)) between 2 and 100
        and student_range in ('Under 150', '150-300', '300-600', '600+')
      )
    );

create index if not exists early_access_signups_created_at_idx
  on public.early_access_signups (created_at desc);

create index if not exists early_access_signups_updated_at_idx
  on public.early_access_signups (updated_at desc);

create index if not exists early_access_signups_clerk_user_idx
  on public.early_access_signups (clerk_user_id)
  where clerk_user_id is not null;

comment on table public.early_access_signups is
  'Private Plancify early-access and school-pilot enquiries. Server API access only.';

comment on column public.early_access_signups.clerk_user_id is
  'Optional Clerk user ID when the submitted email matches the signed-in Clerk account.';

-- ---------------------------------------------------------------------------
-- 2. Signed-in student discovery, roadmap, task, portfolio and mentor state
-- ---------------------------------------------------------------------------

create table if not exists public.student_workspaces (
  clerk_user_id text primary key,
  contact_email text,
  student_name text not null,
  class_level smallint not null,
  selected_career_id text not null,
  answers jsonb not null default '{}'::jsonb,
  completed_task_ids jsonb not null default '[]'::jsonb,
  portfolio_items jsonb not null default '[]'::jsonb,
  connected_mentor_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint student_workspaces_clerk_id_length
    check (char_length(clerk_user_id) between 8 and 160),
  constraint student_workspaces_email_is_normalized
    check (
      contact_email is null
      or (
        contact_email = lower(trim(contact_email))
        and char_length(contact_email) between 3 and 254
      )
    ),
  constraint student_workspaces_name_length
    check (char_length(trim(student_name)) between 1 and 60),
  constraint student_workspaces_class_level
    check (class_level between 6 and 12),
  constraint student_workspaces_career_length
    check (char_length(selected_career_id) between 2 and 80),
  constraint student_workspaces_answers_object
    check (jsonb_typeof(answers) = 'object'),
  constraint student_workspaces_tasks_array
    check (jsonb_typeof(completed_task_ids) = 'array'),
  constraint student_workspaces_portfolio_array
    check (jsonb_typeof(portfolio_items) = 'array'),
  constraint student_workspaces_mentors_array
    check (jsonb_typeof(connected_mentor_ids) = 'array')
);

-- Upgrade the email check when this script follows the earlier workspace
-- migration, while keeping repeated runs safe.
alter table public.student_workspaces
  drop constraint if exists student_workspaces_email_length,
  drop constraint if exists student_workspaces_email_is_normalized;

alter table public.student_workspaces
  add constraint student_workspaces_email_is_normalized
    check (
      contact_email is null
      or (
        contact_email = lower(trim(contact_email))
        and char_length(contact_email) between 3 and 254
      )
    );

create index if not exists student_workspaces_updated_at_idx
  on public.student_workspaces (updated_at desc);

create index if not exists student_workspaces_contact_email_idx
  on public.student_workspaces (contact_email)
  where contact_email is not null;

comment on table public.student_workspaces is
  'Private Plancify MVP student state, keyed by the verified Clerk user ID.';

-- ---------------------------------------------------------------------------
-- 3. Durable API rate limiting
-- ---------------------------------------------------------------------------

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists private.api_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null,
  request_count integer not null,
  updated_at timestamptz not null default now(),
  constraint api_rate_limits_bucket_length
    check (char_length(bucket) between 16 and 200),
  constraint api_rate_limits_request_count_positive
    check (request_count >= 1)
);

create index if not exists api_rate_limits_updated_at_idx
  on private.api_rate_limits (updated_at);

alter table private.api_rate_limits enable row level security;
revoke all on table private.api_rate_limits from public, anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window interval;
  v_started_at timestamptz;
  v_count integer;
begin
  if p_bucket is null or char_length(p_bucket) not between 16 and 200 then
    raise exception 'Invalid rate-limit bucket' using errcode = '22023';
  end if;
  if p_limit not between 1 and 10000 then
    raise exception 'Invalid rate-limit maximum' using errcode = '22023';
  end if;
  if p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid rate-limit window' using errcode = '22023';
  end if;

  v_window := make_interval(secs => p_window_seconds);

  insert into private.api_rate_limits as limits (
    bucket,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_bucket, v_now, 1, v_now)
  on conflict (bucket) do update
  set
    window_started_at = case
      when limits.window_started_at <= v_now - v_window then v_now
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at <= v_now - v_window then 1
      else limits.request_count + 1
    end,
    updated_at = v_now
  returning window_started_at, request_count
    into v_started_at, v_count;

  return query
  select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    case
      when v_count <= p_limit then 0
      else greatest(1, ceil(extract(epoch from (v_started_at + v_window - v_now)))::integer)
    end;
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.consume_api_rate_limit(text, integer, integer)
  to service_role;

comment on function public.consume_api_rate_limit(text, integer, integer) is
  'Atomically consumes one request from a server-only fixed-window rate limit.';

-- ---------------------------------------------------------------------------
-- 4. Data API and RLS security
-- ---------------------------------------------------------------------------

alter table public.early_access_signups enable row level security;
alter table public.student_workspaces enable row level security;

-- No browser-facing policies are created. Both Clerk users and administrators
-- go through application server routes that verify identity and authorization.
revoke all on table public.early_access_signups from anon, authenticated;
revoke all on table public.student_workspaces from anon, authenticated;

-- Explicit grants are required by newer Supabase projects before supabase-js
-- can reach a new table through the Data API. The secret key maps to this role
-- and bypasses RLS, so this key must remain server-only.
grant select, insert, update, delete
  on table public.early_access_signups
  to service_role;

grant select, insert, update, delete
  on table public.student_workspaces
  to service_role;

commit;
