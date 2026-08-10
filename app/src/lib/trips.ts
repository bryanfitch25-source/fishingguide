import { createClient } from "./supabase-server";
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

// Pure date helpers (splitTrips, tripDateRange, formatTripDates, daysUntil,
// hasLiveConditions) live in ./trip-dates instead of here — that module has no
// Supabase import, so client components can use them without pulling next/headers
// into a client bundle. Import from "@/lib/trip-dates" directly.
