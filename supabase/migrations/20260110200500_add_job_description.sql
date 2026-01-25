alter table public.jobs
  add column if not exists description text null;
