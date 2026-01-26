alter table public.jobs
  add column if not exists triage_status text null,
  add column if not exists triage_reasons text[] null,
  add column if not exists triaged_at timestamptz null,
  add column if not exists triage_provider text null;
