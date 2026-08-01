// Free, keyless environmental data: tide predictions from the Canadian Hydrographic
// Service's Integrated Water Level System, and current conditions from Environment
// Canada's MSC GeoMet API. Both are server-only (no browser CORS guarantees, and it
// keeps the fetch caching in one place). Callers: EnvironmentPanel (server component)
// and the /api/environment route (for client components like NearMe).

import { haversineKm } from "./geo";

const TIDE_STATIONS_URL = "https://api-iwls.dfo-mpo.gc.ca/api/v1/stations";
const TIDE_DATA_URL = (stationId: string, from: string, to: string) =>
  `https://api-iwls.dfo-mpo.gc.ca/api/v1/stations/${stationId}/data?time-series-code=wlp-hilo&from=${from}&to=${to}`;
const WEATHER_URL = (lat: number, lng: number) => {
  // A small bbox around the point — the collection returns city-page stations
  // inside it, we then pick the closest one ourselves.
  const d = 0.6;
  return `https://api.weather.gc.ca/collections/citypageweather-realtime/items?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&f=json&limit=10`;
};

interface TideStation {
  id: string;
  code: string;
  officialName: string;
  latitude: number;
  longitude: number;
  operating: boolean;
}

export interface TideEvent {
  time: string; // ISO
  heightM: number;
  type: "high" | "low";
}

export interface NearestTideStation {
  name: string;
  distanceKm: number;
  events: TideEvent[];
}

// Station list changes essentially never — cache for a day.
async function fetchTideStations(): Promise<TideStation[]> {
  const res = await fetch(TIDE_STATIONS_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`tide stations ${res.status}`);
  return res.json();
}

export async function getTideForecast(lat: number, lng: number): Promise<NearestTideStation | null> {
  try {
    const stations = await fetchTideStations();
    const operating = stations.filter((s) => s.operating);
    if (!operating.length) return null;

    let nearest = operating[0];
    let best = Infinity;
    for (const s of operating) {
      const d = haversineKm(lat, lng, s.latitude, s.longitude);
      if (d < best) {
        best = d;
        nearest = s;
      }
    }
    // Beyond ~150km the nearest station isn't representative of local tides anymore.
    if (best > 150) return null;

    const from = new Date().toISOString();
    const to = new Date(Date.now() + 3 * 86400000).toISOString();
    const res = await fetch(TIDE_DATA_URL(nearest.id, from, to), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data: { eventDate: string; value: number }[] = await res.json();

    const events: TideEvent[] = data.map((e, i, arr) => {
      const prev = arr[i - 1]?.value ?? -Infinity;
      const next = arr[i + 1]?.value ?? -Infinity;
      return {
        time: e.eventDate,
        heightM: e.value,
        type: e.value >= prev && e.value >= next ? "high" : "low",
      };
    });

    return { name: nearest.officialName, distanceKm: Math.round(best), events };
  } catch {
    return null;
  }
}

export interface WeatherConditions {
  stationName: string;
  distanceKm: number;
  temperatureC: number | null;
  condition: string | null;
  windKmh: number | null;
  windDirection: string | null;
  pressureKPa: number | null;
  pressureTendency: "rising" | "falling" | "steady" | null;
  iconUrl: string | null;
  forecastSummary: string | null;
}

export async function getWeather(lat: number, lng: number): Promise<WeatherConditions | null> {
  try {
    const res = await fetch(WEATHER_URL(lat, lng), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const json = await res.json();
    const features: Array<{
      geometry?: { coordinates: [number, number] };
      properties: Record<string, unknown>;
    }> = json.features ?? [];
    if (!features.length) return null;

    let nearest = features[0];
    let best = Infinity;
    for (const f of features) {
      const coords = f.geometry?.coordinates;
      if (!coords) continue;
      const d = haversineKm(lat, lng, coords[1], coords[0]);
      if (d < best) {
        best = d;
        nearest = f;
      }
    }

    const p = nearest.properties as {
      name?: { en?: string };
      currentConditions?: {
        temperature?: { value?: { en?: number } };
        condition?: { en?: string };
        wind?: { speed?: { value?: { en?: number } }; direction?: { value?: { en?: string } } };
        pressure?: { value?: { en?: number }; tendency?: { en?: string } };
        iconCode?: { url?: string };
      };
      forecastGroup?: {
        forecasts?: Array<{ textSummary?: { en?: string } }>;
      };
    };

    const cc = p.currentConditions;
    const tendencyRaw = cc?.pressure?.tendency?.en?.toLowerCase();
    const tendency: WeatherConditions["pressureTendency"] =
      tendencyRaw === "rising" ? "rising" : tendencyRaw === "falling" ? "falling" : tendencyRaw ? "steady" : null;

    return {
      stationName: p.name?.en ?? "Nearby station",
      distanceKm: Math.round(best),
      temperatureC: cc?.temperature?.value?.en ?? null,
      condition: cc?.condition?.en ?? null,
      windKmh: cc?.wind?.speed?.value?.en ?? null,
      windDirection: cc?.wind?.direction?.value?.en ?? null,
      pressureKPa: cc?.pressure?.value?.en ?? null,
      pressureTendency: tendency,
      iconUrl: cc?.iconCode?.url ?? null,
      forecastSummary: p.forecastGroup?.forecasts?.[0]?.textSummary?.en ?? null,
    };
  } catch {
    return null;
  }
}
