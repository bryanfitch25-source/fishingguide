-- Marks each item as salt water, fresh water, or fine in both.
--
-- Separate from `discipline` and doing a different job. Discipline says which *box* a
-- thing lives in — fly gear never shows on the conventional screen and vice versa. Water
-- type is a property of the item within its box, and cuts across the split: a 9 wt fly rod
-- and a 7' medium-heavy spinning rod are both salt-water tools in different boxes, and an
-- angler packing for a wharf wants to see both halves of that.
--
-- Which is why this goes on tackle_items rather than on tackle_trays. A tray is often
-- mixed, and a tray-level tag would force a false choice on the boxes people actually own.
--
-- Nullable on purpose. `null` means "not said yet", which is honest for the several
-- hundred items entered before this column existed and is displayed as unset rather than
-- being guessed at. A backfill by category was considered and rejected: a spoon is a
-- spoon, and inferring that a 1/2 oz spoon is a salt lure because most saltwater lures
-- are heavy would put wrong data in front of someone who then trusts it. The angler can
-- say, or leave it blank.

alter table tackle_items
  add column if not exists water_type text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tackle_items_water_type_check') then
    alter table tackle_items add constraint tackle_items_water_type_check
      check (water_type is null or water_type in ('salt', 'fresh', 'both'));
  end if;
end $$;

-- Partial, because the filter that uses it is always "my items, in this box, tagged for
-- this water" and the untagged rows are never the thing being looked for. Keeps the index
-- to the tagged subset rather than carrying a null for every legacy row.
create index if not exists tackle_items_user_water_type_idx
  on tackle_items (user_id, water_type)
  where water_type is not null;
