-- ============================================================
-- Multi-tenant school scoping
-- ============================================================

-- 1. Central school registry
create table if not exists schools (
  id bigint generated always as identity primary key,
  name text not null,
  short_name text not null,
  domain text unique not null,
  status text not null default 'coming_soon'
    check (status in ('active', 'coming_soon')),
  logo_url text,
  created_at timestamptz not null default now()
);

-- 2. Seed UAPB as the first active school
insert into schools (name, short_name, domain, status)
values ('University of Arkansas at Pine Bluff', 'UAPB', 'uapb.edu', 'active')
on conflict (domain) do nothing;

-- 3. Add school_id FK to existing tables

-- departments: add school_id, backfill from UAPB, drop legacy "school" column
alter table departments
  add column if not exists school_id bigint references schools(id) on delete cascade;

update departments
set school_id = (select id from schools where domain = 'uapb.edu')
where school_id is null;

alter table departments
  alter column school_id set not null;

alter table departments
  drop column if exists school;

-- buildings: add school_id, backfill from UAPB, drop legacy "campus" column
alter table buildings
  add column if not exists school_id bigint references schools(id) on delete cascade;

update buildings
set school_id = (select id from schools where domain = 'uapb.edu')
where school_id is null;

alter table buildings
  alter column school_id set not null;

alter table buildings
  drop column if exists campus;

-- professors: add school_id, backfill from UAPB
alter table professors
  add column if not exists school_id bigint references schools(id) on delete cascade;

update professors
set school_id = (select id from schools where domain = 'uapb.edu')
where school_id is null;

alter table professors
  alter column school_id set not null;

-- profiles: add school_id, backfill from UAPB, drop legacy "school_domain" column
alter table profiles
  add column if not exists school_id bigint references schools(id) on delete set null;

update profiles
set school_id = (select id from schools where domain = 'uapb.edu')
where school_id is null and school_domain = 'uapb.edu';

alter table profiles
  drop column if exists school_domain;

-- 4. Indexes for school-scoped queries
create index if not exists departments_school_idx on departments(school_id);
create index if not exists buildings_school_idx on buildings(school_id);
create index if not exists professors_school_idx on professors(school_id);
create index if not exists profiles_school_idx on profiles(school_id);
create index if not exists schools_domain_idx on schools(domain);
