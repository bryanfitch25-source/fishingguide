-- Manual tray-slot placement: instead of auto-filling compartments round-robin, an
-- item can be pinned to a specific starting slot and span multiple consecutive slots
-- (e.g. a large lure box that eats 2-3 compartments). slot_index is 0-based within its
-- tray; null means "not manually placed yet" and falls back to auto-fill.
alter table tackle_items add column if not exists slot_index int;
alter table tackle_items add column if not exists slot_span int not null default 1 check (slot_span >= 1);
