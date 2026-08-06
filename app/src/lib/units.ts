// The single place measurements get converted for display.
//
// Everything the app stores is metric — tide heights in metres, wind in km/h,
// temperature in °C, pressure in kPa, catch length in cm, catch weight in kg.
// Imperial is a display-time conversion only, applied here and nowhere else.
//
// The point of that split: flipping the units preference never touches stored
// data, so a catch logged years ago in metric renders correctly in imperial the
// instant the toggle moves, with no migration and no per-screen special-casing.
// Every screen, the CSV export and the push digest all format through these
// helpers, which is what keeps them from disagreeing with each other.

export type UnitSystem = "metric" | "imperial";

export const UNIT_SYSTEMS: { value: UnitSystem; label: string }[] = [
  { value: "metric", label: "Metric" },
  { value: "imperial", label: "Imperial" },
];

export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "metric" || value === "imperial";
}

// --- Raw conversions -------------------------------------------------------
// Exact factors where one exists; inHg uses the conventional 3.386389 kPa/inHg.

export const metresToFeet = (m: number) => m * 3.280839895;
export const kmhToMph = (kmh: number) => kmh * 0.621371192;
export const celsiusToFahrenheit = (c: number) => c * 1.8 + 32;
export const kpaToInHg = (kpa: number) => kpa / 3.386389;
export const cmToInches = (cm: number) => cm / 2.54;
export const kgToPounds = (kg: number) => kg * 2.20462262;

export const feetToMetres = (ft: number) => ft / 3.280839895;
export const inchesToCm = (inches: number) => inches * 2.54;
export const poundsToKg = (lb: number) => lb / 2.20462262;

// --- Display formatting ----------------------------------------------------
// Each returns a complete display string including the unit, or an em dash for
// null/undefined so callers never have to special-case missing data. `decimals`
// is chosen per measurement to match the precision the source data actually has
// — tide predictions are published to 2dp, wind and temperature to whole units.

// Infinity is guarded alongside NaN in every formatter below: a non-finite value
// used to render as the literal string "Infinity m".
function fmt(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function formatHeight(metres: number | null | undefined, units: UnitSystem): string {
  if (metres === null || metres === undefined || !Number.isFinite(metres)) return "—";
  return units === "imperial" ? `${fmt(metresToFeet(metres), 1)} ft` : `${fmt(metres, 2)} m`;
}

export function formatSpeed(kmh: number | null | undefined, units: UnitSystem): string {
  if (kmh === null || kmh === undefined || !Number.isFinite(kmh)) return "—";
  return units === "imperial" ? `${Math.round(kmhToMph(kmh))} mph` : `${Math.round(kmh)} km/h`;
}

export function formatTemperature(celsius: number | null | undefined, units: UnitSystem): string {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) return "—";
  return units === "imperial"
    ? `${Math.round(celsiusToFahrenheit(celsius))}°F`
    : `${Math.round(celsius)}°C`;
}

export function formatPressure(kpa: number | null | undefined, units: UnitSystem): string {
  if (kpa === null || kpa === undefined || !Number.isFinite(kpa)) return "—";
  // inHg needs 2dp to be meaningful at all (typical range 29.5–30.5), kPa 1dp.
  return units === "imperial" ? `${fmt(kpaToInHg(kpa), 2)} inHg` : `${fmt(kpa, 1)} kPa`;
}

export function formatLength(cm: number | null | undefined, units: UnitSystem): string {
  if (cm === null || cm === undefined || !Number.isFinite(cm)) return "—";
  return units === "imperial" ? `${fmt(cmToInches(cm), 1)} in` : `${fmt(cm, 1)} cm`;
}

export function formatWeight(kg: number | null | undefined, units: UnitSystem): string {
  if (kg === null || kg === undefined || !Number.isFinite(kg)) return "—";
  return units === "imperial" ? `${fmt(kgToPounds(kg), 2)} lb` : `${fmt(kg, 2)} kg`;
}

// Labels for the unit a numeric input is being entered in, so the catch form can
// say "Length (in)" vs "Length (cm)" without hardcoding either.
export const lengthUnitLabel = (units: UnitSystem) => (units === "imperial" ? "in" : "cm");
export const weightUnitLabel = (units: UnitSystem) => (units === "imperial" ? "lb" : "kg");

// Input helpers: the form shows and accepts numbers in the display system, but
// only ever hands metric to the database.
export function lengthInputToCm(value: number, units: UnitSystem): number {
  return units === "imperial" ? inchesToCm(value) : value;
}
export function cmToLengthInput(cm: number, units: UnitSystem): number {
  return units === "imperial" ? cmToInches(cm) : cm;
}
export function weightInputToKg(value: number, units: UnitSystem): number {
  return units === "imperial" ? poundsToKg(value) : value;
}
export function kgToWeightInput(kg: number, units: UnitSystem): number {
  return units === "imperial" ? kgToPounds(kg) : kg;
}

// --- Free-text parsing -----------------------------------------------------
// Historical catches recorded length/weight as free text ("18 in", "45cm",
// "2.5 lb"). These parse that into metric so old entries can take part in
// personal bests and unit switching. Anything unparseable returns null and the
// original string is displayed untouched — see the migration backfill, which
// uses the same rules, and CatchLogClient's display fallback.

/**
 * Reads the numeric part of a measurement, handling the forms anglers actually write.
 *
 * Fractions are the reason this is more than a `parseFloat`. Tackle and fish sizes are
 * written "1/2 oz", "1 1/2 in", "3/4 lb" constantly, and a naive number-then-unit match
 * picks up the denominator: "3/4 lb" became 4 lb, a 433% overstatement. Mixed numbers
 * and bare fractions are therefore tried first, before the plain decimal form.
 *
 * Returns null rather than guessing when the number is malformed. "12.5.5" used to yield
 * 5.5 by matching the trailing fragment, and "1e3" yielded 3 — both plausible-looking
 * values written silently into a record. A negative is rejected outright: no fish is
 * -5 cm long, so the honest answer is that the input could not be read.
 */
function parseQuantity(desc: string, unitPattern: string): { value: number; unit: string } | null {
  const flags = "i";
  // Mixed number: "1 1/2 in"
  const mixed = desc.match(new RegExp(String.raw`(\d+)\s+(\d+)\s*/\s*(\d+)\s*(${unitPattern})`, flags));
  if (mixed) {
    const denom = parseInt(mixed[3], 10);
    if (denom === 0) return null;
    return { value: parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / denom, unit: mixed[4] };
  }
  // Bare fraction: "1/2 oz"
  const frac = desc.match(new RegExp(String.raw`(\d+)\s*/\s*(\d+)\s*(${unitPattern})`, flags));
  if (frac) {
    const denom = parseInt(frac[2], 10);
    if (denom === 0) return null;
    return { value: parseInt(frac[1], 10) / denom, unit: frac[3] };
  }
  // Plain decimal. The lookbehind rejects a number glued to other digits, dots or a
  // minus sign, so "12.5.5", "1e3" and "-5" all fail rather than matching a fragment of
  // themselves — the minus matters because otherwise "-5 cm" reads as 5 cm.
  const plain = desc.match(new RegExp(String.raw`(?<![\d.eE-])(\d+(?:\.\d+)?)(?![\d.eE])\s*(${unitPattern})`, flags));
  if (!plain) return null;
  const value = parseFloat(plain[1]);
  if (!Number.isFinite(value) || value < 0) return null;
  return { value, unit: plain[2] };
}

// Order matters inside the alternation: cm and mm are tried before the bare "m", or
// "45cm" would match as 45 metres.
const LENGTH_UNITS =
  String.raw`cm|centimet(?:er|re)s?|mm|millimet(?:er|re)s?|m\b|met(?:er|re)s?|in\b|inch(?:es)?|"|ft\b|feet|foot|'`;

export function parseLengthToCm(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const parsed = parseQuantity(desc, LENGTH_UNITS);
  if (!parsed) return null;
  const { value: n, unit } = parsed;
  const u = unit.toLowerCase();
  if (/^(cm|centimet)/.test(u)) return n;
  if (/^(mm|millimet)/.test(u)) return n / 10;
  // Metres are worth supporting because the app covers bluefin tuna, which anglers
  // routinely record in metres rather than centimetres.
  if (/^(m\b|met)/.test(u)) return n * 100;
  if (/^(ft|feet|foot|')/.test(u)) return inchesToCm(n * 12);
  return inchesToCm(n); // in / inch / inches / "
}

const WEIGHT_UNITS = String.raw`kg|kilogram(?:me)?s?|g\b|gram(?:me)?s?|lbs?\b|pound(?:s)?|#|oz\b|ounce(?:s)?`;

export function parseWeightToKg(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const parsed = parseQuantity(desc, WEIGHT_UNITS);
  if (!parsed) return null;
  const { value: n, unit } = parsed;
  const u = unit.toLowerCase();
  if (/^(kg|kilogram)/.test(u)) return n;
  if (/^(g|gram)/.test(u)) return n / 1000;
  if (/^(oz|ounce)/.test(u)) return poundsToKg(n / 16);
  return poundsToKg(n); // lb / lbs / pound / pounds / #
}
