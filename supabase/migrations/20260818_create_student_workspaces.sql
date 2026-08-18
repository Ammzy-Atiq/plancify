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
  constraint student_workspaces_clerk_id_length check (char_length(clerk_user_id) between 8 and 160),
  constraint student_workspaces_email_length check (contact_email is null or char_length(contact_email) <= 254),
  constraint student_workspaces_name_length check (char_length(student_name) between 1 and 60),
  constraint student_workspaces_class_level check (class_level between 6 and 12),
  constraint student_workspaces_career_length check (char_length(selected_career_id) between 2 and 80),
  constraint student_workspaces_answers_object check (jsonb_typeof(answers) = 'object'),
  constraint student_workspaces_tasks_array check (jsonb_typeof(completed_task_ids) = 'array'),
  constraint student_workspaces_portfolio_array check (jsonb_typeof(portfolio_items) = 'array'),
  constraint student_workspaces_mentors_array check (jsonb_typeof(connected_mentor_ids) = 'array')
);

create index if not exists student_workspaces_updated_at_idx
  on public.student_workspaces (updated_at desc);

alter table public.student_workspaces enable row level security;
revoke all on table public.student_workspaces from anon, authenticated;

comment on table public.student_workspaces is
  'Private Plancify MVP state. Only verified server routes and administrators use the secret-backed client.';
