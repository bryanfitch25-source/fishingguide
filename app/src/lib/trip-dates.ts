// Pure date logic for trips — no Supabase import, so client components can use these
// directly without pulling next/headers into a client bundle (see lib/trips.ts, which
// keeps the DB-fetching functions and is server-only).

import { localDate, parseLocalDate } from "./dates";
import type { Trip } from "@/types/trips";

/**
 * Undated trips count as upcoming — they're still ahead of you, just not scheduled yet —
 * and today's own date counts as upcoming rather than past, since the trip hasn't
 * happened yet when you're looking at the list that morning. A multi-day trip stays
 * upcoming through its *last* day, not its first — you're still on a 3-day trip on day 2.
 */
export function splitTrips(trips: Trip[]): { upcoming: Trip[]; past: Trip[] } {
  const today = localDate();
  const upcoming: Trip[] = [];
  const past: Trip[] = [];
  for (const t of trips) {
    const lastDay = t.trip_end_date ?? t.trip_date;
    (!lastDay || lastDay >= today ? upcoming : past).push(t);
  }
  upcoming.sort((a, b) => (a.trip_date ?? "9999-99-99").localeCompare(b.trip_date ?? "9999-99-99"));
  past.sort((a, b) => (b.trip_date ?? "").localeCompare(a.trip_date ?? ""));
  return { upcoming, past };
}

/** Every calendar date in a trip's span, start through end inclusive — just the start if trip_end_date isn't set. */
export function tripDateRange(trip: Pick<Trip, "trip_date" | "trip_end_date">): string[] {
  if (!trip.trip_date) return [];
  if (!trip.trip_end_date || trip.trip_end_date === trip.trip_date) return [trip.trip_date];

  const dates: string[] = [];
  const cursor = parseLocalDate(trip.trip_date);
  const end = parseLocalDate(trip.trip_end_date);
  while (cursor <= end) {
    dates.push(localDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * "Sep 5, 2026" for a single day, "Sep 5–7, 2026" for a span within one month,
 * "Aug 30–Sep 2, 2026" when it crosses a month boundary, "Not scheduled" for neither.
 */
export function formatTripDates(trip: Pick<Trip, "trip_date" | "trip_end_date">): string {
  if (!trip.trip_date) return "Not scheduled";
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  const start = parseLocalDate(trip.trip_date);
  const year = start.getFullYear();
  if (!trip.trip_end_date || trip.trip_end_date === trip.trip_date) return `${fmt(start)}, ${year}`;

  const end = parseLocalDate(trip.trip_end_date);
  const endLabel = start.getMonth() === end.getMonth() ? String(end.getDate()) : fmt(end);
  return `${fmt(start)}–${endLabel}, ${year}`;
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
