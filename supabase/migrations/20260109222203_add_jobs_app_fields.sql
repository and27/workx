-- 1) JOBS: nuevas columnas
alter table public.jobs
  add column if not exists source_url text null,
  add column if not exists external_id text null,
  add column if not exists published_at timestamptz null;

-- 2) APPLICATIONS: nuevas columnas
alter table public.applications
  add column if not exists source text not null default 'unknown',
  add column if not exists notes text not null default '',
  add column if not exists next_action_at date null,
  add column if not exists job_id text null;

-- 3) FK a jobs (solo si no existe)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_job_id_fkey'
  ) then
    alter table public.applications
      add constraint applications_job_id_fkey
      foreign key (job_id) references public.jobs(id);
  end if;
end $$;

-- 4) CHECK constraints (solo si no existen)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'applications_status_chk') then
    alter table public.applications
      add constraint applications_status_chk
      check (status in ('saved','applied','screen','tech','offer','rejected','ghosted'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'applications_priority_chk') then
    alter table public.applications
      add constraint applications_priority_chk
      check (priority in ('low','medium','high'));
  end if;
end $$;

-- 5) APPLICATION_LOGS table (si no existe)
create table if not exists public.application_logs (
  id text primary key,
  application_id text not null references public.applications(id) on delete cascade,
  type text not null,
  message text not null,
  created_at timestamptz not null
);

-- 6) Índices
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_priority_idx on public.applications(priority);
create index if not exists applications_next_action_idx on public.applications(next_action_at);
create index if not exists application_logs_app_id_idx on public.application_logs(application_id);

-- 7) Unique index jobs(source, external_id)
-- OJO: external_id null permite duplicados; eso suele ser OK.
create unique index if not exists jobs_source_external_id_uniq
  on public.jobs(source, external_id);

create index if not exists jobs_published_at_idx
  on public.jobs(published_at desc);
