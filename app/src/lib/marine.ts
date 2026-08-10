// Marine and hourly conditions from Open-Meteo — free, keyless, no account.
//
// Environment Canada stays the source for current conditions (see lib/environment.ts):
// it's the official Canadian source, and it publishes a pressure *tendency* and a plain
// text forecast that Open-Meteo doesn't. What EC's city-page product doesn't give is
// wave/swell/sea-surface temperature, or a clean per-hour series to hang against tide
// rows — so Open-Meteo fills exactly those two gaps and nothing else.
//
// Both endpoints are cached for 30 minutes. Wave and swell don't move meaningfully
// faster than that, and it keeps a free public service from being hit on every render.

const MARINE_URL = (lat: number, lng: number) =>
  `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
  `&current=wave_height,swell_wave_height,sea_surface_temperature&timezone=UTC`;

const HOURLY_URL = (lat: number, lng: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
  `&hourly=temperature_2m,weather_code,wind_speed_10m&forecast_days=7&timezone=UTC`;

export interface MarineConditions {
  waveHeightM: number | null;
  swellHeightM: number | null;
  seaTemperatureC: number | null;
}

/**
 * Marine conditions, or null where there's no coverage.
 *
 * Open-Meteo's marine model is a wave model — it only has cells over open water. Ask it
 * about an inland lake or a spot well up an estuary and it answers with nulls or a 400
 * rather than an error worth surfacing. That's an expected outcome here, not a failure:
 * callers show "no marine data for this location" instead of an error, and the rest of
 * the page is unaffected.
 */
export async function getMarineConditions(
  lat: number,
  lng: number
): Promise<MarineConditions | null> {
  try {
    const res = await fetch(MARINE_URL(lat, lng), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const json: {
      current?: {
        wave_height?: number | null;
        swell_wave_height?: number | null;
        sea_surface_temperature?: number | null;
      };
    } = await res.json();

    const c = json.current;
    if (!c) return null;

    const marine: MarineConditions = {
      waveHeightM: c.wave_height ?? null,
      swellHeightM: c.swell_wave_height ?? null,
      seaTemperatureC: c.sea_surface_temperature ?? null,
    };

    // All three null means the point isn't in the wave model's domain at all — report
    // "no coverage" rather than a card of em dashes that looks like a loading failure.
    if (
      marine.waveHeightM === null &&
      marine.swellHeightM === null &&
      marine.seaTemperatureC === null
    ) {
      return null;
    }
    return marine;
  } catch {
    return null;
  }
}

export interface HourlyPoint {
  /** Hour bucket as an ISO string, truncated to the hour in UTC. */
  hourKey: string;
  temperatureC: number | null;
  emoji: string;
  windKmh: number | null;
}

// WMO weather interpretation codes, collapsed to a glyph. Open-Meteo returns the raw
// code; the full table is finer-grained than a one-character pill can usefully show, so
// neighbouring codes that look the same to a person share an emoji.
function weatherEmoji(code: number | null | undefined): string {
  if (code === null || code === undefined) return "";
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️"; // fog / depositing rime fog
  if (code <= 57) return "🌦️"; // drizzle
  if (code <= 67) return "🌧️"; // rain
  if (code <= 77) return "🌨️"; // snow
  if (code <= 82) return "🌧️"; // rain showers
  if (code <= 86) return "🌨️"; // snow showers
  return "⛈️"; // thunderstorm
}

/**
 * Per-hour temperature and condition for the next week, keyed by hour so a tide event
 * can look up the weather at its own time without scanning an array.
 */
export async function getHourlyForecast(
  lat: number,
  lng: number
): Promise<Map<string, HourlyPoint> | null> {
  try {
    const res = await fetch(HOURLY_URL(lat, lng), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const json: {
      hourly?: {
        time?: string[];
        temperature_2m?: (number | null)[];
        weather_code?: (number | null)[];
        wind_speed_10m?: (number | null)[];
      };
    } = await res.json();

    const times = json.hourly?.time;
    if (!Array.isArray(times)) return null;
    const temps = json.hourly?.temperature_2m ?? [];
    const codes = json.hourly?.weather_code ?? [];
    const winds = json.hourly?.wind_speed_10m ?? [];

    const map = new Map<string, HourlyPoint>();
    times.forEach((t, i) => {
      // Open-Meteo returns "2026-08-04T13:00" with timezone=UTC.
      const hourKey = t.slice(0, 13);
      map.set(hourKey, {
        hourKey,
        temperatureC: temps[i] ?? null,
        emoji: weatherEmoji(codes[i]),
        windKmh: winds[i] ?? null,
      });
    });
    return map;
  } catch {
    return null;
  }
}

/** Looks up the forecast for the hour containing `isoTime`. */
export function hourlyAt(
  hourly: Map<string, HourlyPoint> | null,
  isoTime: string
): HourlyPoint | null {
  if (!hourly) return null;
  return hourly.get(new Date(isoTime).toISOString().slice(0, 13)) ?? null;
}

export interface DailyForecast {
  minTempC: number | null;
  maxTempC: number | null;
  maxWindKmh: number | null;
  /** The icon closest to local midday — the single most representative hour for a
      day-at-a-glance summary, same reasoning a weather app uses for its daily icon. */
  emoji: string;
}

/**
 * Rolls the hourly map up into one day, in a given timezone — the hourly forecast is
 * keyed by UTC hour, which doesn't line up with a "day" for anyone west of Greenwich.
 */
export function dailyForecastSummary(
  hourly: Map<string, HourlyPoint> | null,
  dateStr: string,
  timeZone = "America/Moncton"
): DailyForecast | null {
  if (!hourly) return null;

  const localHour = (hourKey: string) =>
    parseInt(new Date(`${hourKey}:00:00Z`).toLocaleString("en-CA", { timeZone, hour: "2-digit", hour12: false }), 10);
  const localDay = (hourKey: string) =>
    new Date(`${hourKey}:00:00Z`).toLocaleDateString("en-CA", { timeZone });

  const points = [...hourly.values()].filter((p) => localDay(p.hourKey) === dateStr);
  if (points.length === 0) return null;

  const temps = points.map((p) => p.temperatureC).filter((t): t is number => t !== null);
  const winds = points.map((p) => p.windKmh).filter((w): w is number => w !== null);
  const midday = points.reduce((best, p) =>
    Math.abs(localHour(p.hourKey) - 13) < Math.abs(localHour(best.hourKey) - 13) ? p : best
  );

  return {
    minTempC: temps.length ? Math.min(...temps) : null,
    maxTempC: temps.length ? Math.max(...temps) : null,
    maxWindKmh: winds.length ? Math.max(...winds) : null,
    emoji: midday.emoji,
  };
}
