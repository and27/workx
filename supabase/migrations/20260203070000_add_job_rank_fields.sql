alter table public.jobs
  add column if not exists rank_score integer null,
  add column if not exists rank_reason text null,
  add column if not exists rank_provider text null,
  add column if not exists rank_version integer null;
