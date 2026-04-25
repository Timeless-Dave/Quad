create table if not exists profiles (
  id uuid primary key,
  email text unique not null,
  full_name text,
  school_domain text not null default 'uapb.edu',
  created_at timestamptz not null default now()
);

create table if not exists departments (
  id bigint generated always as identity primary key,
  name text not null,
  school text not null default 'UAPB'
);

create table if not exists buildings (
  id bigint generated always as identity primary key,
  name text not null,
  campus text not null default 'UAPB Main',
  map_image_url text not null
);

create table if not exists professors (
  id bigint generated always as identity primary key,
  full_name text not null,
  title text not null,
  email text unique not null,
  office_room text not null,
  department_id bigint references departments(id) on delete set null,
  building_id bigint references buildings(id) on delete set null,
  booking_url text
);

create index if not exists professors_search_idx
on professors using gin (to_tsvector('simple', full_name || ' ' || title || ' ' || office_room || ' ' || email));
