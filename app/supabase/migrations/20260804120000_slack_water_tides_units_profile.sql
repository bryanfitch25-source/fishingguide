-- Slack Water merge: tide stations + favourites, a units preference, the angler
-- profile fields, and the conditions snapshot recorded against each catch.

-- ---------------------------------------------------------------------------
-- 1. Per-user settings: selected tide station, units, digest, profile
-- ---------------------------------------------------------------------------
-- The selected station is stored rather than re-derived from GPS on every page, so
-- you can look at a spot you aren't standing at. Both the IWLS id (used for API
-- calls) and the display name (so the UI has something to show before the station
-- list loads, and still has a label if the API is down) are kept.
alter table angler_settings add column if not exists tide_station_id text;
alter table angler_settings add column if not exists tide_station_code text;
alter table angler_settings add column if not exists tide_station_name text;
alter table angler_settings add column if not exists tide_station_lat double precision;
alter table angler_settings add column if not exists tide_station_lng double precision;

-- Display preference only. Everything in this database is metric; imperial is a
-- display-time conversion (see app/src/lib/units.ts). Changing this never rewrites
-- stored data, which is what lets historical catches switch units for free.
alter table angler_settings add column if not exists units text not null default 'metric';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'angler_settings_units_check'
  ) then
    alter table angler_settings
      add constraint angler_settings_units_check check (units in ('metric', 'imperial'));
  end if;
end $$;

-- Daily tide digest (one push each morning with today's highs/lows). Separate from
-- the licence/maintenance reminders so it can be turned on independently.
alter table angler_settings add column if not exists tide_digest_enabled boolean not null default false;
alter table angler_settings add column if not exists last_tide_digest_sent date;

-- Angler profile. Slack Water had these on a standalone screen disconnected from
-- everything else; here they live with the rest of the per-user settings, and the
-- favourite species references the guide content by slug instead of being free text.
alter table angler_settings add column if not exists angler_name text;
alter table angler_settings add column if not exists favourite_species_slug text;
alter table angler_settings add column if not exists favourite_lure text;
alter table angler_settings add column if not exists water_preference text;
alter table angler_settings add column if not exists profile_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'angler_settings_water_preference_check'
  ) then
    alter table angler_settings
      add constraint angler_settings_water_preference_check
      check (water_preference is null or water_preference in ('salt', 'fresh', 'both'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Favourite stations
-- ---------------------------------------------------------------------------
create table if not exists favourite_stations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  station_id text not null,
  station_code text,
  station_name text not null,
  latitude double precision,
  longitude double precision,
  position int not null default 0,
  created_at timestamptz not null default now(),
  -- Starring the same station twice is a no-op, not a second row.
  unique (user_id, station_id)
);

create index if not exists favourite_stations_user_idx on favourite_stations (user_id, position);

-- The 8-favourite cap is enforced here rather than only in the UI: the client can be
-- raced (two tabs, a retried request), and silently ending up with nine favourites
-- would break the My Spots layout in a way that's tedious to unpick by hand.
create or replace function enforce_favourite_station_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from favourite_stations where user_id = new.user_id) >= 8 then
    raise exception 'FAVOURITE_LIMIT: at most 8 favourite stations are allowed'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists favourite_stations_limit on favourite_stations;
create trigger favourite_stations_limit
  before insert on favourite_stations
  for each row execute function enforce_favourite_station_limit();

alter table favourite_stations enable row level security;

drop policy if exists "Owner full access to own favourite_stations" on favourite_stations;
create policy "Owner full access to own favourite_stations" on favourite_stations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on favourite_stations to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Catches: numeric measurements + conditions snapshot
-- ---------------------------------------------------------------------------
-- Numeric columns sit alongside the original free-text ones rather than replacing
-- them. The backfill below can't parse every string a person might have typed, and
-- silently dropping "about a footer" would be worse than keeping it displayable.
alter table catches add column if not exists length_cm numeric(7, 2);
alter table catches add column if not exists weight_kg numeric(7, 3);

-- What the conditions actually were at the moment of the catch. Captured at logging
-- time because it can't be reconstructed afterwards: the tide and weather APIs only
-- serve forecasts and recent observations, so a catch logged without this is a catch
-- whose conditions are gone for good. This is what makes the Insights screen able to
-- correlate catches with tide state at all.
alter table catches add column if not exists tide_state text;
alter table catches add column if not exists tide_height_m numeric(6, 3);
alter table catches add column if not exists tide_station_name text;
alter table catches add column if not exists weather_condition text;
alter table catches add column if not exists temperature_c numeric(5, 2);
alter table catches add column if not exists pressure_kpa numeric(6, 2);
alter table catches add column if not exists wind_kmh numeric(5, 1);
-- Time of day, for the Insights time bucket. catch_date is a date with no clock
-- component, and back-dating a catch shouldn't invent a time it didn't have.
alter table catches add column if not exists caught_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'catches_tide_state_check'
  ) then
    alter table catches
      add constraint catches_tide_state_check
      check (tide_state is null or tide_state in ('rising', 'falling', 'unknown'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Backfill numeric length/weight from the existing free text
-- ---------------------------------------------------------------------------
-- Mirrors parseLengthToCm / parseWeightToKg in app/src/lib/units.ts. Only fills rows
-- that are still null, so re-running this migration never overwrites a value someone
-- has since corrected by hand.

-- Length: cm / mm / in / inch / " / ft / feet / '
update catches
set length_cm = case
    when length_desc ~* '(\d+(\.\d+)?)\s*(cm|centimet)' then
      (substring(length_desc from '(\d+(?:\.\d+)?)\s*(?:cm|centimet)'))::numeric
    when length_desc ~* '(\d+(\.\d+)?)\s*(mm|millimet)' then
      (substring(length_desc from '(\d+(?:\.\d+)?)\s*(?:mm|millimet)'))::numeric / 10
    when length_desc ~* '(\d+(\.\d+)?)\s*(ft|feet|foot|'')' then
      (substring(length_desc from '(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|'')'))::numeric * 30.48
    when length_desc ~* '(\d+(\.\d+)?)\s*(in|inch|")' then
      (substring(length_desc from '(\d+(?:\.\d+)?)\s*(?:in|inch|")'))::numeric * 2.54
    else null
  end
where length_cm is null and length_desc is not null and length_desc <> '';

-- Weight: kg / g / lb / pound / # / oz
update catches
set weight_kg = case
    when weight_desc ~* '(\d+(\.\d+)?)\s*(kg|kilogram)' then
      (substring(weight_desc from '(\d+(?:\.\d+)?)\s*(?:kg|kilogram)'))::numeric
    when weight_desc ~* '(\d+(\.\d+)?)\s*(g\M|gram)' then
      (substring(weight_desc from '(\d+(?:\.\d+)?)\s*(?:g\M|gram)'))::numeric / 1000
    when weight_desc ~* '(\d+(\.\d+)?)\s*(oz|ounce)' then
      (substring(weight_desc from '(\d+(?:\.\d+)?)\s*(?:oz|ounce)'))::numeric * 0.028349523
    when weight_desc ~* '(\d+(\.\d+)?)\s*(lbs?|pound|#)' then
      (substring(weight_desc from '(\d+(?:\.\d+)?)\s*(?:lbs?|pound|#)'))::numeric * 0.45359237
    else null
  end
where weight_kg is null and weight_desc is not null and weight_desc <> '';
