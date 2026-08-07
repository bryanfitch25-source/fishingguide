-- Separates fly gear from conventional gear.
--
-- A discriminator on the existing tables rather than a parallel fly_items table. The two
-- disciplines need completely separate *screens* — nobody wants to scroll past crankbaits
-- looking for a nymph — but they are the same kind of record underneath: a thing you own,
-- with photos, a warranty, a storage box, species tags, a packed flag and a link from the
-- catches it produced. A second table would duplicate all of that, plus its RLS policies,
-- and would need the catches foreign key pointed at two places at once.
--
-- So: one table, one column, and the separation is enforced by every query filtering on it.

alter table tackle_items
  add column if not exists discipline text not null default 'conventional';
alter table tackle_trays
  add column if not exists discipline text not null default 'conventional';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tackle_items_discipline_check') then
    alter table tackle_items add constraint tackle_items_discipline_check
      check (discipline in ('conventional', 'fly'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tackle_trays_discipline_check') then
    alter table tackle_trays add constraint tackle_trays_discipline_check
      check (discipline in ('conventional', 'fly'));
  end if;
end $$;

-- Every list query is "my items in this discipline", so the index carries both. user_id
-- leads because RLS filters on it first.
create index if not exists tackle_items_user_discipline_idx
  on tackle_items (user_id, discipline);
create index if not exists tackle_trays_user_discipline_idx
  on tackle_trays (user_id, discipline);

-- Existing rows default to 'conventional', which is right: everything recorded before this
-- was entered through a form whose categories were rods, reels and lures. A fly angler can
-- move an item across by editing it.

-- The category check has to grow to admit the fly categories.
--
-- 20260730100000 declared `category text not null check (category in (...))` inline with
-- nine values, which Postgres named tackle_items_category_check. Adding a column without
-- widening this would leave every fly insert failing on a constraint the app has no way to
-- see — which is exactly what happened the first time this migration was run against a
-- real database, and the reason it is worth running them somewhere before shipping.
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'tackle_items_category_check') then
    alter table tackle_items drop constraint tackle_items_category_check;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tackle_items_category_allowed') then
    alter table tackle_items add constraint tackle_items_category_allowed check (
      category in (
        -- Conventional
        'rod', 'reel', 'lure', 'line', 'terminal_tackle', 'net', 'electronics', 'apparel', 'other',
        -- Fly
        'fly_rod', 'fly_reel', 'fly_line', 'backing', 'leader_tippet', 'fly', 'fly_accessory'
      )
    );
  end if;
end $$;
