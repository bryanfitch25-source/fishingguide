-- Repairs catch measurements written as fractions.
--
-- The backfill in 20260804120000 used a number-then-unit regex, which for "3/4 lb"
-- matched "4 lb" — a 433% overstatement. Fishing sizes are written in fractions
-- constantly ("1/2 oz", "1 1/2 in", "3/4 lb"), so any historical row whose free text
-- contains a fraction very likely holds a wrong number today.
--
-- This is the one migration in the project that OVERWRITES data rather than filling
-- nulls, so it is deliberately narrow: it touches only rows whose free-text field
-- actually contains a "digit/digit" fraction, and it recomputes from that text rather
-- than adjusting the existing number. Rows without a fraction are untouched, including
-- any value corrected by hand.
--
-- To see what will change before running it, run the SELECT at the bottom first.

-- Mixed numbers ("1 1/2 in") are matched before bare fractions ("1/2 in"), or the
-- bare-fraction pattern would consume the "1/2" and drop the leading whole number.

-- ---------------------------------------------------------------------------
-- Length
-- ---------------------------------------------------------------------------
with parsed as (
  select
    id,
    length_desc,
    -- whole, numerator, denominator, unit
    substring(length_desc from '(\d+)\s+\d+\s*/\s*\d+\s*(?:cm|centimet|mm|millimet|m\M|met|in|inch|"|ft|feet|foot|'''')') as whole,
    substring(length_desc from '(?:\d+\s+)?(\d+)\s*/\s*\d+\s*(?:cm|centimet|mm|millimet|m\M|met|in|inch|"|ft|feet|foot|'''')') as num,
    substring(length_desc from '(?:\d+\s+)?\d+\s*/\s*(\d+)\s*(?:cm|centimet|mm|millimet|m\M|met|in|inch|"|ft|feet|foot|'''')') as den,
    lower(substring(length_desc from '\d+\s*/\s*\d+\s*(cm|centimet|mm|millimet|m\M|met|in|inch|"|ft|feet|foot|'''')')) as unit
  from catches
  where length_desc ~ '\d+\s*/\s*\d+'
),
computed as (
  select id, length_desc, unit,
    (coalesce(whole::numeric, 0) + num::numeric / nullif(den::numeric, 0)) as qty
  from parsed
  where num is not null and den is not null and den <> '0'
)
update catches c
set length_cm = round(
  case
    when computed.unit like 'cm%' or computed.unit like 'centimet%' then computed.qty
    when computed.unit like 'mm%' or computed.unit like 'millimet%' then computed.qty / 10
    when computed.unit = 'm' or computed.unit like 'met%'           then computed.qty * 100
    when computed.unit in ('ft','feet','foot','''')                 then computed.qty * 30.48
    else computed.qty * 2.54  -- in / inch / "
  end, 2)
from computed
where c.id = computed.id and computed.qty is not null;

-- ---------------------------------------------------------------------------
-- Weight
-- ---------------------------------------------------------------------------
with parsed as (
  select
    id,
    weight_desc,
    substring(weight_desc from '(\d+)\s+\d+\s*/\s*\d+\s*(?:kg|kilogram|g\M|gram|lbs?|pound|#|oz|ounce)') as whole,
    substring(weight_desc from '(?:\d+\s+)?(\d+)\s*/\s*\d+\s*(?:kg|kilogram|g\M|gram|lbs?|pound|#|oz|ounce)') as num,
    substring(weight_desc from '(?:\d+\s+)?\d+\s*/\s*(\d+)\s*(?:kg|kilogram|g\M|gram|lbs?|pound|#|oz|ounce)') as den,
    lower(substring(weight_desc from '\d+\s*/\s*\d+\s*(kg|kilogram|g\M|gram|lbs?|pound|#|oz|ounce)')) as unit
  from catches
  where weight_desc ~ '\d+\s*/\s*\d+'
),
computed as (
  select id, weight_desc, unit,
    (coalesce(whole::numeric, 0) + num::numeric / nullif(den::numeric, 0)) as qty
  from parsed
  where num is not null and den is not null and den <> '0'
)
update catches c
set weight_kg = round(
  case
    when computed.unit like 'kg%' or computed.unit like 'kilogram%' then computed.qty
    when computed.unit = 'g' or computed.unit like 'gram%'          then computed.qty / 1000
    when computed.unit like 'oz%' or computed.unit like 'ounce%'    then computed.qty * 0.028349523
    else computed.qty * 0.45359237  -- lb / lbs / pound / #
  end, 3)
from computed
where c.id = computed.id and computed.qty is not null;

-- ---------------------------------------------------------------------------
-- Malformed values the original backfill turned into a plausible-looking number.
-- ---------------------------------------------------------------------------
-- "12.5.5 cm" became 5.5 and "1e3 cm" became 3, by matching a fragment of the string.
-- There is no correct value to recover, so these go back to null and fall through to
-- displaying their original free text — which is what the app does for anything it
-- cannot parse.
update catches
set length_cm = null
where length_desc ~ '\d+\.\d+\.\d+' or length_desc ~ '\d+[eE]\d+';

update catches
set weight_kg = null
where weight_desc ~ '\d+\.\d+\.\d+' or weight_desc ~ '\d+[eE]\d+';

-- Negatives: the old regex dropped the sign, so "-5 cm" stored 5.
update catches set length_cm = null where length_desc ~ '-\s*\d';
update catches set weight_kg = null where weight_desc ~ '-\s*\d';

-- ---------------------------------------------------------------------------
-- Review query — run this BEFORE the migration to see what it will change:
--
--   select id, catch_date, length_desc, length_cm, weight_desc, weight_kg
--   from catches
--   where length_desc ~ '\d+\s*/\s*\d+' or weight_desc ~ '\d+\s*/\s*\d+'
--      or length_desc ~ '\d+\.\d+\.\d+'  or weight_desc ~ '\d+\.\d+\.\d+'
--      or length_desc ~ '-\s*\d'         or weight_desc ~ '-\s*\d';
--
-- If it returns no rows, nothing here changes anything and the migration is a no-op.
-- ---------------------------------------------------------------------------
