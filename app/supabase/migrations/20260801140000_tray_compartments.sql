-- Real tackle trays use adjustable dividers, so the diagram view lets the owner
-- record how many compartments their physical tray actually has (defaulting to a
-- typical stock configuration for its brand/size, editable per-tray).

alter table tackle_trays add column if not exists compartments int;
