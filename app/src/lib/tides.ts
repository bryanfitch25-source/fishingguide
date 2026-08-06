// Tide predictions from the Canadian Hydrographic Service's Integrated Water Level
// System (IWLS) — free, keyless, ~800 Canadian stations.
//
// This is the station-centric layer: the app remembers which station you've picked
// rather than re-deriving "nearest to my GPS" on every page, so you can check a spot
// you aren't standing at. Nearest-station lookup still exists, but as a way to *find*
// a station to select, not as the thing that runs on every render.
//
// Server-only: the IWLS API sends no CORS headers, and keeping fetches here means the
// Next cache configuration lives in one place.

import { haversineKm } from "./geo";

const IWLS_BASE = "https://api-iwls.dfo-mpo.gc.ca/api/v1";
const STATIONS_URL = `${IWLS_BASE}/stations`;
const stationDataUrl = (stationId: string, from: string, to: string) =>
  `${IWLS_BASE}/stations/${stationId}/data?time-series-code=wlp-hilo&from=${from}&to=${to}`;

// CHS's own predictions page for a station, used as the fallback link when we can't
// reach the API at all — better than leaving someone with nothing at the wharf.
export const chsStationUrl = (stationCode: string) =>
  `https://www.tides.gc.ca/en/stations/${stationCode}`;

export interface TideStation {
  id: string;
  code: string;
  officialName: string;
  latitude: number;
  longitude: number;
  operating: boolean;
}

export interface RankedStation {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

export interface TideEvent {
  time: string; // ISO
  heightM: number;
  type: "high" | "low";
}

export type TideState = "rising" | "falling" | "unknown";

export interface CurrentTide {
  heightM: number;
  state: TideState;
  /** The event we're heading toward — what "next high tide in 2h 15m" refers to. */
  next: TideEvent | null;
  previous: TideEvent | null;
}

/** Station list changes essentially never — cache for a day. */
export async function fetchStations(): Promise<TideStation[]> {
  const res = await fetch(STATIONS_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`IWLS stations returned ${res.status}`);
  return res.json();
}

export async function getStationById(stationId: string): Promise<TideStation | null> {
  try {
    const stations = await fetchStations();
    return stations.find((s) => s.id === stationId) ?? null;
  } catch {
    return null;
  }
}

/**
 * Stations nearest a point, closest first. Returns a ranked list rather than a single
 * winner so the picker can offer alternatives — the closest station by straight-line
 * distance is often not the right one when a headland or river mouth sits between you
 * and it, and only a person looking at the names can tell.
 */
export async function rankStationsNear(
  lat: number,
  lng: number,
  limit = 8
): Promise<RankedStation[]> {
  try {
    const stations = await fetchStations();
    return stations
      .filter((s) => s.operating)
      .map((s) => ({
        id: s.id,
        code: s.code,
        name: s.officialName,
        latitude: s.latitude,
        longitude: s.longitude,
        distanceKm: haversineKm(lat, lng, s.latitude, s.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * High/low predictions for a station over `days` from now.
 *
 * IWLS returns the hi/lo series as bare timestamped values with no high/low marker, so
 * the type is derived by comparing each value against its neighbours. Comparing against
 * both sides (rather than just the previous one) is what keeps the first and last entry
 * in the window from being mislabelled.
 */
export async function getTideEvents(stationId: string, days = 7): Promise<TideEvent[] | null> {
  try {
    // Start slightly in the past so there's always a preceding event to interpolate
    // the current height from, even right after a turn of the tide.
    const from = new Date(Date.now() - 12 * 3600000).toISOString();
    const to = new Date(Date.now() + days * 86400000).toISOString();
    const res = await fetch(stationDataUrl(stationId, from, to), { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data: { eventDate: string; value: number }[] = await res.json();
    if (!Array.isArray(data)) return null;

    return data.map((e, i, arr) => {
      const prev = arr[i - 1]?.value;
      const next = arr[i + 1]?.value;
      // With a neighbour on at least one side, a value above it is a high.
      const neighbour = prev ?? next;
      return {
        time: e.eventDate,
        heightM: e.value,
        type: neighbour === undefined || e.value >= neighbour ? "high" : "low",
      } satisfies TideEvent;
    });
  } catch {
    return null;
  }
}

/**
 * A station returning zero predictions across a full 7-day window is a strong signal
 * it's been discontinued rather than a real gap in the data — genuine outages don't
 * usually take out a whole week. Callers use this to fall back to a known-working
 * station and say so, instead of showing an empty screen that looks broken.
 */
export function looksInactive(events: TideEvent[] | null): boolean {
  return events !== null && events.length === 0;
}

/**
 * Height between two known extrema, via cosine interpolation.
 *
 * A semi-diurnal tide doesn't move linearly between high and low — it eases away from
 * one extreme, runs fastest through the middle, and eases into the next. Half a cosine
 * cycle is the standard approximation of that shape (the "rule of twelfths" is the
 * same curve, rounded for mental arithmetic), and it's what gives the graph its real
 * S-curve instead of a zigzag.
 */
export function interpolateHeight(a: TideEvent, b: TideEvent, atMs: number): number {
  const startMs = new Date(a.time).getTime();
  const endMs = new Date(b.time).getTime();
  if (endMs <= startMs) return a.heightM;
  const t = Math.min(1, Math.max(0, (atMs - startMs) / (endMs - startMs)));
  // cos goes 1 -> -1 over [0, π]; map that to a.heightM -> b.heightM.
  const eased = (1 - Math.cos(t * Math.PI)) / 2;
  return a.heightM + (b.heightM - a.heightM) * eased;
}

/** Current height and direction, derived from the surrounding predicted extrema. */
export function currentTide(events: TideEvent[], atMs = Date.now()): CurrentTide | null {
  if (events.length === 0) return null;

  let previous: TideEvent | null = null;
  let next: TideEvent | null = null;
  for (const e of events) {
    const t = new Date(e.time).getTime();
    if (t <= atMs) previous = e;
    else {
      next = e;
      break;
    }
  }

  // Outside the window we have extrema for, the best we can honestly do is report the
  // nearest known extreme's height and admit the direction is unknown.
  if (!previous || !next) {
    const edge = previous ?? next;
    if (!edge) return null;
    return { heightM: edge.heightM, state: "unknown", next, previous };
  }

  return {
    heightM: interpolateHeight(previous, next, atMs),
    state: next.type === "high" ? "rising" : "falling",
    next,
    previous,
  };
}

export interface CurvePoint {
  ms: number;
  heightM: number;
}

/**
 * Samples the interpolated curve at a fixed interval for graphing. Sampling rather than
 * drawing straight lines between extrema is the whole point — it's what makes the graph
 * show the actual shape of the tide.
 */
export function sampleCurve(
  events: TideEvent[],
  fromMs: number,
  hours = 24,
  stepMinutes = 15
): CurvePoint[] {
  if (events.length < 2) return [];
  const toMs = fromMs + hours * 3600000;
  const stepMs = stepMinutes * 60000;
  const points: CurvePoint[] = [];

  for (let ms = fromMs; ms <= toMs; ms += stepMs) {
    let a: TideEvent | null = null;
    let b: TideEvent | null = null;
    for (const e of events) {
      const t = new Date(e.time).getTime();
      if (t <= ms) a = e;
      else {
        b = e;
        break;
      }
    }
    if (a && b) points.push({ ms, heightM: interpolateHeight(a, b, ms) });
  }
  return points;
}

/** "in 2d 3h" / "in 2h 15m" / "in 45m" / "now" — the countdown beside a tide event. */
export function formatCountdown(toMs: number, fromMs = Date.now()): string {
  const diffMin = Math.round((toMs - fromMs) / 60000);
  if (diffMin <= 0) return "now";
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h === 0) return `in ${m}m`;
  // Past a day, hours stop being readable — "in 1666h 40m" is not an answer to anything.
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh === 0 ? `in ${d}d` : `in ${d}d ${rh}h`;
  }
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

/** Groups events into calendar days in the given zone, for the 7-day forecast list. */
export function groupByDay(
  events: TideEvent[],
  timeZone = "America/Moncton"
): { dayKey: string; events: TideEvent[] }[] {
  const groups = new Map<string, TideEvent[]>();
  for (const e of events) {
    // en-CA gives YYYY-MM-DD, which sorts correctly as a string.
    const dayKey = new Date(e.time).toLocaleDateString("en-CA", { timeZone });
    const list = groups.get(dayKey);
    if (list) list.push(e);
    else groups.set(dayKey, [e]);
  }
  return [...groups.entries()]
    .map(([dayKey, dayEvents]) => ({ dayKey, events: dayEvents }))
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}
