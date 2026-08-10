-- Saved trip plans.
--
-- The trip planner used to be a stateless page keyed entirely off a URL param pointing
-- at one of the six curated location guides — no location outside those six was
-- plannable, and nothing was ever saved. This is the first-class entity that fixes
-- both: a trip has its own point (lat/lng + a human label), independent of whether
-- that point happens to match a guide. location_guide_slug is kept only as an optional
-- shortcut for "this trip started from picking a guide" — it's never required, and a
-- trip whose guide is later removed just loses the shortcut, not the trip (on delete
-- set null).
--
-- target_species is a plain text[] rather than a join table, matching the precedent of
-- `provinces` on species and `extra_photo_urls` on catches: nothing elsewhere needs to
-- query "all trips targeting species X" at any scale that would justify a join.
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  -- Nullable: a trip can exist before its date is decided ("someday, Miramichi for
  -- salmon") as well as pointing at a specific day.
  trip_date date,
  lat double precision,
  lng double precision,
  place_name text,
  province text check (province in ('NB', 'NS', 'PEI')),
  location_guide_slug text references location_guides(slug) on delete set null,
  target_species text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_idx on trips (user_id, trip_date);

alter table trips enable row level security;

create policy "Owner full access to own trips" on trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on trips to authenticated;

create trigger trips_set_updated_at
  before update on trips
  for each row execute function set_updated_at();
