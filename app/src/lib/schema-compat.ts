// Lets the app run correctly both before and after a migration has been applied.
//
// Vercel deploys the moment `main` moves, but a Supabase migration is a separate manual
// step. That leaves a window — minutes or days — where new code is live against the old
// schema. Without something like this, a write naming a column that doesn't exist yet
// fails outright, which would take an *existing* feature (logging a catch) down until
// someone remembered to run `supabase db push`.
//
// So writes that touch newly-added columns go through here: try the full payload, and if
// PostgREST rejects it because a column isn't there yet, drop the new fields and write
// the rest. You lose the new data for those rows — nothing silently corrupts, and the
// feature that already worked keeps working.

import type { PostgrestError } from "@supabase/supabase-js";

/**
 * PostgREST reports an unknown column as PGRST204 ("Could not find the 'x' column of 'y'
 * in the schema cache"), and an unknown table as 42P01. Matching on the message as well
 * as the code because the code isn't set on every client version.
 */
export function isMissingSchemaError(error: PostgrestError | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST204" || error.code === "42P01" || error.code === "42703") return true;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("could not find the") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

/** Returns a copy of `payload` without the keys in `fields`. */
export function omit<T extends Record<string, unknown>>(payload: T, fields: readonly string[]): Partial<T> {
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!fields.includes(k)) copy[k] = v;
  }
  return copy as Partial<T>;
}

export interface CompatWriteResult {
  error: PostgrestError | null;
  /** True when the write only succeeded after dropping the post-migration fields. */
  degraded: boolean;
}

/**
 * Runs `write(payload)`; if it fails only because the schema is older than the code,
 * retries once without `newFields`.
 *
 * `degraded: true` tells the caller the row was saved without its new columns, so the UI
 * can say so plainly rather than pretending everything was recorded.
 */
export async function writeWithSchemaFallback<T extends Record<string, unknown>>(
  payload: T,
  newFields: readonly string[],
  // PromiseLike rather than Promise: Supabase's query builders are thenables that only
  // execute when awaited, so they don't satisfy the full Promise interface.
  write: (p: Partial<T>) => PromiseLike<{ error: PostgrestError | null }>
): Promise<CompatWriteResult> {
  const first = await write(payload);
  if (!first.error) return { error: null, degraded: false };
  if (!isMissingSchemaError(first.error)) return { error: first.error, degraded: false };

  const second = await write(omit(payload, newFields));
  return { error: second.error, degraded: second.error === null };
}

/** Shown wherever a write had to fall back, so the cause isn't a mystery. */
export const MIGRATION_PENDING_NOTICE =
  "Saved — but the tide and conditions fields aren't in the database yet. Run the pending migration (supabase db push) to start recording them.";

/** Columns added by 20260804120000_slack_water_tides_units_profile.sql. */
export const CATCH_MIGRATION_FIELDS = [
  "length_cm",
  "weight_kg",
  "caught_at",
  "tide_state",
  "tide_height_m",
  "tide_station_name",
  "weather_condition",
  "temperature_c",
  "pressure_kpa",
  "wind_kmh",
] as const;

export const SETTINGS_MIGRATION_FIELDS = [
  "tide_station_id",
  "tide_station_code",
  "tide_station_name",
  "tide_station_lat",
  "tide_station_lng",
  "units",
  "tide_digest_enabled",
  "last_tide_digest_sent",
  "angler_name",
  "favourite_species_slug",
  "favourite_lure",
  "water_preference",
  "profile_notes",
] as const;
