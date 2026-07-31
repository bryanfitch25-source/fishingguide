-- Trip pack list: a persistent "packed" checkbox per tackle item so the pack/unpack
-- state survives across devices and sessions, not just localStorage.
alter table tackle_items add column if not exists packed boolean not null default false;

-- Optional GPS coordinates on a catch, captured via the browser's geolocation API,
-- for a "view on map" link and a personal spot map.
alter table catches add column if not exists lat double precision;
alter table catches add column if not exists lng double precision;
