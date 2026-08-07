-- Warranty cover on tackle items.
--
-- Real columns rather than keys inside the `specs` jsonb added last week, for two
-- reasons. Warranty applies to anything you own, not to one category — a reel, a
-- fishfinder and a pair of waders all have one, and specs is keyed per category. And the
-- nightly reminder cron has to select every item whose warranty expires soon across all
-- users, which is a plain indexed date comparison here and a jsonb extraction there.
--
-- warranty_expires_on is stored rather than derived from purchase_date + a term. That
-- would be tidier and wrong: warranties run from the shipping date sometimes and the
-- purchase date others, get extended when a unit is replaced, and often gain a year on
-- registration. The app suggests a date from the term; what lands here is what the owner
-- accepted.

alter table tackle_items add column if not exists purchase_date date;
alter table tackle_items add column if not exists warranty_expires_on date;
alter table tackle_items add column if not exists warranty_lifetime boolean not null default false;
alter table tackle_items add column if not exists warranty_provider text;
alter table tackle_items add column if not exists warranty_reference text;
alter table tackle_items add column if not exists warranty_notes text;

-- Dedupe for the daily push, mirroring last_maintenance_reminder_sent.
alter table tackle_items add column if not exists last_warranty_reminder_sent date;

-- A lifetime warranty and an expiry date are contradictory claims about the same cover.
-- Allowing both would leave the reminder job with no defensible answer about which wins.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tackle_items_warranty_exclusive_check') then
    alter table tackle_items add constraint tackle_items_warranty_exclusive_check
      check (not (warranty_lifetime and warranty_expires_on is not null));
  end if;
end $$;

-- The cron's query is "every item expiring within the next 30 days, across every user",
-- which without this is a sequential scan of the whole table every morning. Partial, so
-- the index only carries the rows that have a warranty at all.
create index if not exists tackle_items_warranty_expiry_idx
  on tackle_items (warranty_expires_on)
  where warranty_expires_on is not null;
