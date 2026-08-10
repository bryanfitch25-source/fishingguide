import { createClient } from "./supabase-server";
import { localDate } from "./dates";
import type { Trip } from "@/types/trips";

/** All trips belonging to the signed-in user — RLS scopes this, no explicit filter needed. */
export async function getTrips(): Promise<Trip[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("getTrips error", error);
    return [];
  }
  return (data as Trip[]) ?? [];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getTrip error", error);
    return null;
  }
  return (data as Trip | null) ?? null;
}

/**
 * The read-only side of sharing — works with no session at all. get_shared_trip is a
 * SECURITY DEFINER function granted to `anon` (see the migration), so this bypasses the
 * owner-only RLS policy on trips deliberately, but only for the one row whose token
 * matches exactly; there's no way to reach any other trip through it.
 */
export async function getSharedTrip(token: string): Promise<Trip | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_trip", { p_token: token });
  if (error) {
    console.error("getSharedTrip error", error);
    return null;
  }
  const rows = (data as Trip[] | null) ?? [];
  return rows[0] ?? null;
}

/**
 * Undated trips count as upcoming — they're still ahead of you, just not scheduled yet —
 * and today's own date counts as upcoming rather than past, since the trip hasn't
 * happened yet when you're looking at the list that morning.
 */
export function splitTrips(trips: Trip[]): { upcoming: Trip[]; past: Trip[] } {
  const today = localDate();
  const upcoming: Trip[] = [];
  const past: Trip[] = [];
  for (const t of trips) {
    (!t.trip_date || t.trip_date >= today ? upcoming : past).push(t);
  }
  upcoming.sort((a, b) => (a.trip_date ?? "9999-99-99").localeCompare(b.trip_date ?? "9999-99-99"));
  past.sort((a, b) => (b.trip_date ?? "").localeCompare(a.trip_date ?? ""));
  return { upcoming, past };
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = localDate();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(dateStr) - Date.parse(today)) / msPerDay);
}

/**
 * Whether *live* weather/water-temperature/wave conditions can be shown for this trip.
 *
 * getWeather and getMarineConditions (lib/environment.ts, lib/marine.ts) both call
 * "current conditions" endpoints, not a forecast — there is no meaningful answer for a
 * date that isn't today. Tide predictions and solunar/sun/moon are different: they're
 * computed astronomically for any date, so those still show for a future-dated trip.
 * An undated trip is treated as today, since that's the only date it could show.
 */
export function hasLiveConditions(dateStr: string | null): boolean {
  const d = daysUntil(dateStr);
  return d === null || d === 0;
}
