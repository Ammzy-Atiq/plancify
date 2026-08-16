create table if not exists public.early_access_signups (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  email text not null,
  audience text not null check (audience in ('family', 'school')),
  school_name text,
  source text not null default 'planify-local-site',
  created_at timestamptz not null default now(),
  constraint early_access_email_is_normalized
    check (email = lower(trim(email)) and char_length(email) between 3 and 254),
  constraint early_access_clerk_user_id_length
    check (clerk_user_id is null or char_length(clerk_user_id) between 6 and 128),
  constraint early_access_school_name_matches_audience
    check (
      (audience = 'family' and school_name is null)
      or
      (audience = 'school' and char_length(trim(school_name)) between 2 and 160)
    ),
  constraint early_access_email_audience_unique unique (email, audience)
);

create index if not exists early_access_signups_created_at_idx
  on public.early_access_signups (created_at desc);

create index if not exists early_access_signups_clerk_user_idx
  on public.early_access_signups (clerk_user_id)
  where clerk_user_id is not null;

alter table public.early_access_signups enable row level security;

revoke all on table public.early_access_signups from anon, authenticated;

comment on table public.early_access_signups is
  'Private Planify early-access and school-pilot enquiries. Writes go through the server-only API route.';
