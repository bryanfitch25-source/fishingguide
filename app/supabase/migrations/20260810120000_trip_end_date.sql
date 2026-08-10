-- Multi-day trips.
--
-- trip_date stays the trip's start date — every existing single-day trip already means
-- exactly that, and nothing downstream (the reminder cron, the upcoming/past split's
-- sort order) needs to change to keep meaning it. trip_end_date is the only new thing:
-- null means a single day (the common case, and every trip saved before this migration),
-- set means the trip runs from trip_date through trip_end_date inclusive.
alter table trips add column if not exists trip_end_date date;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trips_end_date_after_start') then
    alter table trips add constraint trips_end_date_after_start
      check (trip_end_date is null or (trip_date is not null and trip_end_date >= trip_date));
  end if;
end $$;
