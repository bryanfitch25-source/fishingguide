-- Per-category tackle specifications.
--
-- The tackle form was one shape for all nine categories, with a single free-text
-- "Color / Size" box carrying whatever mattered — "1/2 oz, chartreuse" on a jig, "20 lb"
-- on a line, nothing sensible on a landing net. Everything past the first attribute ended
-- up in Notes, where it can't be filtered or shown on a tile.
--
-- One jsonb column rather than forty nullable ones. The field list is defined in
-- app/src/lib/tackle-specs.ts and will keep changing as gear does; a jsonb column absorbs
-- that without a migration each time, and forty mostly-null columns on a table where a row
-- uses at most eight of them is a poor trade. Postgres can still index and query into it
-- if there's ever a reason to.
--
-- Not null with a '{}' default so reading code never has to distinguish "no specs" from
-- null, and every existing row is immediately valid.

alter table tackle_items add column if not exists specs jsonb not null default '{}'::jsonb;

-- Guards against a bare scalar or array being written where the app expects an object.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tackle_items_specs_object_check') then
    alter table tackle_items add constraint tackle_items_specs_object_check
      check (jsonb_typeof(specs) = 'object');
  end if;
end $$;

-- color_size is deliberately left in place and still populated — by the app, from these
-- specs, as a derived one-line summary. It is what the list rows, tray tiles and CSV
-- export already read, and rewriting all of them to compose the summary themselves would
-- be a lot of churn for no gain. Existing free-text values stay exactly as they are until
-- the item is edited.
