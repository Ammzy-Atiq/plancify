alter table public.early_access_signups
  add column if not exists contact_name text,
  add column if not exists student_range text;

alter table public.early_access_signups
  drop constraint if exists early_access_contact_name_length,
  add constraint early_access_contact_name_length
    check (contact_name is null or char_length(trim(contact_name)) between 2 and 100),
  drop constraint if exists early_access_student_range_value,
  add constraint early_access_student_range_value
    check (student_range is null or student_range in ('Under 150', '150-300', '300-600', '600+'));
