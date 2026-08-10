-- Links a catch to the trip it happened on.
--
-- Nullable and on delete set null, not cascade: a catch is a record of a fish caught,
-- and deleting the trip it was planned under shouldn't delete or orphan-error the catch
-- itself — it should just unlink it, the same way tackle_item_id already does when a
-- tackle item is deleted.
alter table catches add column if not exists trip_id uuid references trips(id) on delete set null;

create index if not exists catches_trip_idx on catches (trip_id);
