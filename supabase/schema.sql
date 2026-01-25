create table if not exists public.jobs (
  id text primary key,
  company text not null,
  role text not null,
  source text not null,
  source_url text null,
  external_id text null,
  location text not null,
  seniority text not null,
  tags text[] not null default '{}'::text[],
  published_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.applications (
  id text primary key,
  company text not null,
  role text not null,
  status text not null,
  priority text not null,
  next_action_at date null,
  source text not null,
  notes text not null default '',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  job_id text null references public.jobs(id)
);

alter table public.applications
  add constraint applications_status_chk
  check (status in ('saved','applied','screen','tech','offer','rejected','ghosted','archived'));

alter table public.applications
  add constraint applications_priority_chk
  check (priority in ('low','medium','high'));

create table if not exists public.application_logs (
  id text primary key,
  application_id text not null references public.applications(id) on delete cascade,
  type text not null,
  message text not null,
  created_at timestamptz not null
);

create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_priority_idx on public.applications(priority);
create index if not exists applications_next_action_idx on public.applications(next_action_at);
create index if not exists application_logs_app_id_idx on public.application_logs(application_id);
create unique index if not exists jobs_source_external_id_uniq
  on public.jobs(source, external_id);
create index if not exists jobs_published_at_idx
  on public.jobs(published_at desc);
