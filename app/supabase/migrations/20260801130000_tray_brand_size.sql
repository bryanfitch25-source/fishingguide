-- Standard brand/size fields for tackle trays, matching real-world tackle tray
-- sizing conventions (Plano's 3500/3600/3700 series, Flambeau's equivalent numbering)
-- instead of a free-text name only.

alter table tackle_trays add column if not exists brand text;
alter table tackle_trays add column if not exists size_class text
  check (size_class in ('micro', 'small', 'medium', 'large', 'custom'));
