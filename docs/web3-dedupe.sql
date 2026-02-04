-- Preview: find Web3 duplicates by normalized apply_url + role + company
with normalized as (
  select
    id,
    source,
    lower(role) as role_key,
    lower(company) as company_key,
    lower(split_part(split_part(source_url, '#', 1), '?', 1)) as url_key
  from jobs
  where source = 'Web3'
    and source_url is not null
),
dupes as (
  select source, role_key, company_key, url_key, count(*) as cnt
  from normalized
  group by 1,2,3,4
  having count(*) > 1
)
select * from dupes order by cnt desc;

-- Delete: keep newest by published_at (fallback updated_at)
with normalized as (
  select
    id,
    source,
    lower(role) as role_key,
    lower(company) as company_key,
    lower(split_part(split_part(source_url, '#', 1), '?', 1)) as url_key,
    published_at,
    updated_at
  from jobs
  where source = 'Web3'
    and source_url is not null
),
ranked as (
  select
    id,
    row_number() over (
      partition by source, role_key, company_key, url_key
      order by published_at desc nulls last, updated_at desc
    ) as rn
  from normalized
)
delete from jobs
using ranked
where jobs.id = ranked.id
  and ranked.rn > 1;
