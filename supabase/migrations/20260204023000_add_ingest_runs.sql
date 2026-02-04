create table if not exists public.ingest_runs (
  id uuid primary key default gen_random_uuid(),
  source text,
  status text not null,
  created integer not null default 0,
  updated integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists ingest_runs_created_at_idx
  on public.ingest_runs (created_at desc);
