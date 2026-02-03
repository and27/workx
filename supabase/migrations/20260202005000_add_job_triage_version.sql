alter table public.jobs
  add column if not exists triage_version integer null;
