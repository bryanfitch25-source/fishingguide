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

/**
 * The calendar date a Date object *reads as* on the machine, with no zone conversion.
 *
 * For EXIF timestamps specifically, and deliberately not `localDate`. An EXIF
 * DateTimeOriginal is a bare wall-clock string — "2024:07:14 06:30:00", no offset — and
 * exifr turns it into a Date whose local getters hand those exact numbers back. So the
 * getters are the answer, and both obvious alternatives are wrong:
 *
 *   toISOString().slice(0,10)  shifts for anyone east of UTC. Checked against a real
 *                              file: a photo stamped 14 July 06:30, read on a device set
 *                              to Sydney, comes back as the 13th.
 *   localDate(d)               converts the instant into Atlantic time, re-dating a photo
 *                              taken elsewhere to whenever that instant was here — which
 *                              is not what the camera wrote.
 *
 * The photo says which day it was taken. That day is the answer wherever you open it.
 */
export function calendarDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
