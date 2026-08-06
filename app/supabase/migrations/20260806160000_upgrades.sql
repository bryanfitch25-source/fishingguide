-- Schema for the feature upgrades.

-- ---------------------------------------------------------------------------
-- Structured regulation seasons
-- ---------------------------------------------------------------------------
-- Seasons are stored as free text ("Apr 15 – Oct 31"), which is why season-opening
-- reminders were originally scoped out. These columns hold the parsed form alongside
-- the original string, same pattern as the catch measurements: parse what you can,
-- keep the text, leave the rest null rather than guessing.
--
-- Month/day rather than full dates: an open season recurs annually, so a year would be
-- misleading and would need rewriting every January.
alter table regulations add column if not exists season_start_month smallint;
alter table regulations add column if not exists season_start_day smallint;
alter table regulations add column if not exists season_end_month smallint;
alter table regulations add column if not exists season_end_day smallint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'regulations_season_month_check') then
    alter table regulations add constraint regulations_season_month_check check (
      (season_start_month is null or season_start_month between 1 and 12) and
      (season_end_month   is null or season_end_month   between 1 and 12) and
      (season_start_day   is null or season_start_day   between 1 and 31) and
      (season_end_day     is null or season_end_day     between 1 and 31)
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Regulation verification status
-- ---------------------------------------------------------------------------
-- SETUP.md records that several regulation items need a human check against the
-- official source. That note lives in a developer file where nobody about to keep a
-- fish will ever read it. Carrying it on the row lets the species page say so.
alter table regulations add column if not exists verification_status text
  not null default 'unverified';
alter table regulations add column if not exists verified_on date;
alter table regulations add column if not exists verification_note text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'regulations_verification_check') then
    alter table regulations add constraint regulations_verification_check
      check (verification_status in ('verified', 'unverified', 'disputed'));
  end if;
end $$;

-- The items the research flagged as actively unresolved, rather than merely unchecked.
-- Matched through species.slug rather than a slug column on the row: `regulations` keys
-- on species_id. An earlier draft of this file wrote `where species_slug = ...`, which
-- does not exist on this table and would have aborted the migration on its first update
-- — taking the column additions above down with it, since a failed migration rolls back
-- whole. Caught by running the chain against a local Postgres rather than by reading it.
update regulations set verification_status = 'disputed',
  verification_note = 'New Brunswick''s April 2026 invasive-species rule requires mandatory retention in some Recreational Fishery Areas, but whether the established Saint John River catch-and-release fishery is exempt is unresolved. Confirm with NB Natural Resources before keeping or releasing.'
where province = 'NB'
  and species_id in (select id from species where slug = 'muskellunge');

update regulations set verification_status = 'disputed',
  verification_note = 'Subject to the April 2026 NB mandatory-retention rule in specific Recreational Fishery Areas. Confirm the current RFA boundaries against the live GNB Fish Regulations Summary.'
where province = 'NB'
  and species_id in (
    select id from species where slug in ('chain-pickerel', 'largemouth-bass', 'smallmouth-bass')
  );

update regulations set verification_status = 'disputed',
  verification_note = 'No DFO notice clearly states whether this counts toward the general recreational groundfish bag limit in the Gulf Region. Treat the limit as unconfirmed.'
where species_id in (select id from species where slug in ('acadian-redfish', 'spiny-dogfish'));

-- ---------------------------------------------------------------------------
-- Season reminders
-- ---------------------------------------------------------------------------
alter table angler_settings add column if not exists season_reminders_enabled boolean not null default false;
alter table angler_settings add column if not exists last_season_reminder_sent date;
