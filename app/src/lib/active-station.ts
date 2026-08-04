// Resolves which tide station the current request is about.
//
// Signed in, the answer is whatever station is saved on angler_settings. Signed out —
// or signed in but having never picked one — it falls back to the nearest operating
// station to Shediac Bay, which is where the app's own trip guides are centred.
//
// The default is resolved by *position* rather than by a hardcoded IWLS station id.
// Station ids are opaque UUIDs that would have to be looked up by hand and would
// silently break if CHS ever re-issued one; a nearest-to-coordinates lookup against the
// live station list always resolves to something real.

import { createClient } from "./supabase-server";
import { fetchStations, getTideEvents, looksInactive, type TideEvent } from "./tides";
import { haversineKm } from "./geo";
import { isUnitSystem, type UnitSystem } from "./units";

/** Shediac Bay — the Shediac & Cocagne trip guide's area. */
const DEFAULT_ANCHOR = { lat: 46.2283, lng: -64.5397, label: "Shediac Bay" };

export interface ActiveStation {
  id: string;
  code: string;
  name: string;
  lat: number;
  lng: number;
  /** True when this is the fallback rather than a station the person chose. */
  isDefault: boolean;
}

export interface ActiveStationContext {
  station: ActiveStation | null;
  units: UnitSystem;
  events: TideEvent[] | null;
  /**
   * Set when the saved station returned no predictions for a whole week and we fell
   * back. The UI surfaces this so the switch is never silent.
   */
  revertedFrom: string | null;
  /** Null station means the IWLS station list itself couldn't be reached. */
  stationListFailed: boolean;
}

async function nearestOperatingStation(lat: number, lng: number): Promise<ActiveStation | null> {
  try {
    const stations = await fetchStations();
    const operating = stations.filter((s) => s.operating);
    if (!operating.length) return null;

    let best = operating[0];
    let bestDistance = Infinity;
    for (const s of operating) {
      const d = haversineKm(lat, lng, s.latitude, s.longitude);
      if (d < bestDistance) {
        bestDistance = d;
        best = s;
      }
    }
    return {
      id: best.id,
      code: best.code,
      name: best.officialName,
      lat: best.latitude,
      lng: best.longitude,
      isDefault: true,
    };
  } catch {
    return null;
  }
}

/**
 * The station, units and tide events for this request.
 *
 * A station returning zero predictions across seven days is treated as discontinued
 * rather than as a transient gap, and we fall back to the default — reporting which
 * station we came from so the page can explain the switch instead of appearing to
 * ignore the person's choice.
 */
export async function getActiveStationContext(): Promise<ActiveStationContext> {
  let station: ActiveStation | null = null;
  let units: UnitSystem = "metric";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("angler_settings")
      .select(
        "tide_station_id, tide_station_code, tide_station_name, tide_station_lat, tide_station_lng, units"
      )
      .maybeSingle();

    if (data?.units && isUnitSystem(data.units)) units = data.units;

    if (data?.tide_station_id && data.tide_station_name) {
      station = {
        id: data.tide_station_id,
        code: data.tide_station_code ?? "",
        name: data.tide_station_name,
        lat: data.tide_station_lat ?? DEFAULT_ANCHOR.lat,
        lng: data.tide_station_lng ?? DEFAULT_ANCHOR.lng,
        isDefault: false,
      };
    }
  }

  if (!station) {
    station = await nearestOperatingStation(DEFAULT_ANCHOR.lat, DEFAULT_ANCHOR.lng);
    if (!station) {
      return { station: null, units, events: null, revertedFrom: null, stationListFailed: true };
    }
  }

  let events = await getTideEvents(station.id, 7);
  let revertedFrom: string | null = null;

  if (looksInactive(events) && !station.isDefault) {
    const fallback = await nearestOperatingStation(DEFAULT_ANCHOR.lat, DEFAULT_ANCHOR.lng);
    if (fallback && fallback.id !== station.id) {
      revertedFrom = station.name;
      station = fallback;
      events = await getTideEvents(station.id, 7);
    }
  }

  return { station, units, events, revertedFrom, stationListFailed: false };
}
