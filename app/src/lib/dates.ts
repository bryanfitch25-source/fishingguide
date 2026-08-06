// Calendar dates, in the timezone the fishing actually happens in.
//
// `new Date().toISOString().slice(0, 10)` is the obvious way to get a YYYY-MM-DD and it
// is wrong here. It yields the *UTC* date, and Atlantic Canada is UTC-3 in summer — so
// from 9pm local onward it returns tomorrow. A catch logged at 9:30pm on the 6th was
// being filed under the 7th while its own timestamp said the 6th: the same row
// disagreeing with itself, for three hours of every evening, which is prime fishing.
//
// Every calendar date in the app goes through here instead. en-CA formats as YYYY-MM-DD,
// which is both what Postgres wants and what sorts correctly as a string.

export const APP_TIME_ZONE = "America/Moncton";

/** Today's date where the angler is, as YYYY-MM-DD. */
export function localDate(date: Date = new Date(), timeZone: string = APP_TIME_ZONE): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

/** Local clock time, e.g. "4:02 p.m." */
export function localTime(date: Date, timeZone: string = APP_TIME_ZONE): string {
  return date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone });
}

/** Local date and time together, for timestamps shown next to a catch. */
export function localDateTime(date: Date, timeZone: string = APP_TIME_ZONE): string {
  return `${date.toLocaleDateString("en-CA", { day: "numeric", month: "short", timeZone })} · ${localTime(date, timeZone)}`;
}

/**
 * Parses a YYYY-MM-DD as a *local* calendar date rather than as UTC midnight.
 *
 * `new Date("2026-08-06")` is UTC midnight, which is 9pm on the 5th in Atlantic time —
 * so formatting it back out shifts the day. Anchoring at noon avoids the boundary
 * entirely regardless of which side of UTC the timezone sits on.
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

/** Month key (YYYY-MM) for grouping, in local time. */
export function localMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}
