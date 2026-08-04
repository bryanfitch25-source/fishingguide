import { NextResponse } from "next/server";
import { getActiveStationContext } from "@/lib/active-station";
import { currentTide } from "@/lib/tides";
import { getWeather } from "@/lib/environment";

// The conditions to stamp onto a catch: where the tide is, and what the weather is
// doing, at your selected station.
//
// The catch log fetches this once when the page opens and holds it, so tapping
// "quick log" writes the snapshot instantly from memory rather than waiting on a
// network round-trip. That ordering is the whole point of one-touch logging — the
// conditions recorded should be the ones at the moment of the catch, not whatever
// they've drifted to by the time a photo has been picked and a form filled in.
export async function GET() {
  const { station, events } = await getActiveStationContext();
  if (!station) {
    return NextResponse.json({ error: "No tide station available." }, { status: 502 });
  }

  const weather = await getWeather(station.lat, station.lng);
  const current = events ? currentTide(events) : null;

  return NextResponse.json({
    stationName: station.name,
    tideState: current?.state ?? null,
    tideHeightM: current?.heightM ?? null,
    weatherCondition: weather?.condition ?? null,
    temperatureC: weather?.temperatureC ?? null,
    pressureKPa: weather?.pressureKPa ?? null,
    windKmh: weather?.windKmh ?? null,
  });
}
