-- Appearance preferences: which colour ground and which type pairing the app uses.
--
-- Both are pure display settings with no bearing on stored data, so they sit alongside
-- `units` rather than anywhere near the angling records.
--
-- Deliberately not constrained to an enum. The set of themes is defined in
-- app/src/lib/appearance.ts and validated on read (isThemeId / isFontId falls back to
-- the default for anything unrecognised); a CHECK here would mean a migration every
-- time a theme is added or renamed, and the failure mode it guards against — an unknown
-- string — already degrades to the default rather than breaking a page.

alter table angler_settings add column if not exists theme text not null default 'paper';
alter table angler_settings add column if not exists font_pairing text not null default 'system';
