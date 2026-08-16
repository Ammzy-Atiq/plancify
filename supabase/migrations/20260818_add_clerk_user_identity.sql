alter table if exists public.early_access_signups
  add column if not exists clerk_user_id text;

alter table if exists public.early_access_signups
  drop constraint if exists early_access_clerk_user_id_length;

alter table if exists public.early_access_signups
  add constraint early_access_clerk_user_id_length
    check (clerk_user_id is null or char_length(clerk_user_id) between 6 and 128);

create index if not exists early_access_signups_clerk_user_idx
  on public.early_access_signups (clerk_user_id)
  where clerk_user_id is not null;
