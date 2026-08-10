-- Phase 2 of the trip planner: a morning-of push reminder, and a read-only share link.
--
-- reminder_enabled / last_trip_reminder_sent follow the exact shape of the license,
-- warranty and tide-digest reminder columns already on angler_settings / tackle_items —
-- a plain date rather than a boolean "already sent" flag, checked against today so the
-- cron route (api/cron/send-reminders) can use the identical "if already sent today,
-- skip" guard it already uses everywhere else.
alter table trips add column if not exists reminder_enabled boolean not null default true;
alter table trips add column if not exists last_trip_reminder_sent date;

-- share_token is null for a trip that isn't shared. Unique (nulls excepted, which is
-- Postgres's default for unique constraints) so a token can be trusted as a lookup key.
-- Generated client-side with crypto.randomUUID() when a trip's owner taps Share, cleared
-- back to null to revoke — no separate "is this shared" flag needed.
alter table trips add column if not exists share_token uuid unique;

-- The public-read side of sharing. The trips RLS policy is owner-only by design — a
-- second policy opening `select` to anyone with *a* token would have to filter on the
-- token in its USING clause, which RLS can't do against a value supplied by the query
-- rather than by the session, so it would really open every shared trip to anyone who
-- thought to query the table at all. A SECURITY DEFINER function sidesteps that
-- entirely: it runs as the function's owner (so it isn't subject to trips' RLS itself),
-- takes the token as a real argument, and returns at most the one row whose token
-- matches — there's no path from calling this to listing anyone else's trips.
create or replace function get_shared_trip(p_token uuid)
returns setof trips
language sql
stable
security definer
set search_path = public
as $$
  select * from trips where share_token = p_token;
$$;

grant execute on function get_shared_trip(uuid) to anon, authenticated;
