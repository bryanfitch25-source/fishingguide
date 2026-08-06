-- Index the foreign key the Tackle Box joins on.
--
-- The catch count per tackle item was computed by pulling every catch row with a
-- tackle_item_id to the browser and counting in JavaScript; deleting a tackle item also
-- cascades a SET NULL across the same column. Both were sequential scans.
create index if not exists catches_tackle_item_idx on catches (tackle_item_id);

-- Counts, computed in the database instead.
--
-- Security invoker so the caller's RLS applies: the view returns only rows the signed-in
-- angler could have selected directly, exactly as the underlying table would.
create or replace view tackle_item_catch_counts
with (security_invoker = true) as
  select tackle_item_id, count(*)::int as catch_count
  from catches
  where tackle_item_id is not null
  group by tackle_item_id;

grant select on tackle_item_catch_counts to authenticated;
