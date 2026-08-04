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

function fmt(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function formatHeight(metres: number | null | undefined, units: UnitSystem): string {
  if (metres === null || metres === undefined || Number.isNaN(metres)) return "—";
  return units === "imperial" ? `${fmt(metresToFeet(metres), 1)} ft` : `${fmt(metres, 2)} m`;
}

export function formatSpeed(kmh: number | null | undefined, units: UnitSystem): string {
  if (kmh === null || kmh === undefined || Number.isNaN(kmh)) return "—";
  return units === "imperial" ? `${Math.round(kmhToMph(kmh))} mph` : `${Math.round(kmh)} km/h`;
}

export function formatTemperature(celsius: number | null | undefined, units: UnitSystem): string {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return "—";
  return units === "imperial"
    ? `${Math.round(celsiusToFahrenheit(celsius))}°F`
    : `${Math.round(celsius)}°C`;
}

export function formatPressure(kpa: number | null | undefined, units: UnitSystem): string {
  if (kpa === null || kpa === undefined || Number.isNaN(kpa)) return "—";
  // inHg needs 2dp to be meaningful at all (typical range 29.5–30.5), kPa 1dp.
  return units === "imperial" ? `${fmt(kpaToInHg(kpa), 2)} inHg` : `${fmt(kpa, 1)} kPa`;
}

export function formatLength(cm: number | null | undefined, units: UnitSystem): string {
  if (cm === null || cm === undefined || Number.isNaN(cm)) return "—";
  return units === "imperial" ? `${fmt(cmToInches(cm), 1)} in` : `${fmt(cm, 1)} cm`;
}

export function formatWeight(kg: number | null | undefined, units: UnitSystem): string {
  if (kg === null || kg === undefined || Number.isNaN(kg)) return "—";
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

export function parseLengthToCm(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const m = desc.match(/(\d+(?:\.\d+)?)\s*(cm|centimet(?:er|re)s?|mm|millimet(?:er|re)s?|in\b|inch(?:es)?|"|ft\b|feet|foot|')/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const unit = m[2].toLowerCase();
  if (/^(cm|centimet)/.test(unit)) return n;
  if (/^(mm|millimet)/.test(unit)) return n / 10;
  if (/^(ft|feet|foot|')/.test(unit)) return inchesToCm(n * 12);
  return inchesToCm(n); // in / inch / inches / "
}

export function parseWeightToKg(desc: string | null | undefined): number | null {
  if (!desc) return null;
  const m = desc.match(/(\d+(?:\.\d+)?)\s*(kg|kilogram(?:me)?s?|g\b|gram(?:me)?s?|lbs?\b|pound(?:s)?|#|oz\b|ounce(?:s)?)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const unit = m[2].toLowerCase();
  if (/^(kg|kilogram)/.test(unit)) return n;
  if (/^(g|gram)/.test(unit)) return n / 1000;
  if (/^(oz|ounce)/.test(unit)) return poundsToKg(n / 16);
  return poundsToKg(n); // lb / lbs / pound / pounds / #
}
