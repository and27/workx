alter table public.applications
  drop constraint if exists applications_status_chk;

alter table public.applications
  add constraint applications_status_chk
  check (status in ('saved','applied','screen','tech','offer','rejected','ghosted','archived'));
