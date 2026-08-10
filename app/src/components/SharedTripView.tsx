import Link from "next/link";
import { isInSeason, SEASONALITY } from "@/lib/seasonality";
import { parseLocalDate } from "@/lib/dates";
import { formatTripDates } from "@/lib/trip-dates";
import { TripConditionsPanel } from "@/components/TripConditionsPanel";
import { TripChecklist } from "@/components/TripChecklist";
import type { UnitSystem } from "@/lib/units";
import type { Trip } from "@/types/trips";
import type { Species } from "@/types/content";

/**
 * The read-only body of a trip — no edit/delete, no Tackle Box (see TripChecklist's
 * suggestFor: every relevant species goes through it rather than being split into
 * owned/unowned, so this only ever shows Matcher's generic suggestions, never what gear
 * the trip's owner actually has), and deliberately no catches from it either — those
 * carry the same kind of personal detail (photos, notes, GPS) that Tackle Box does.
 *
 * Shared by both ways of viewing someone else's trip: the public share-token page
 * (trip-planner/shared/[token]) and an invited account's view of a trip that isn't
 * theirs (trip-planner/[id], when the signed-in viewer isn't the owner). Each caller
 * supplies its own banner above this and its own units — the token page has no session
 * to read a preference from, so it falls back to metric.
 */
export async function SharedTripView({
  trip,
  species,
  units = "metric",
}: {
  trip: Trip;
  species: Species[];
  units?: UnitSystem;
}) {
  const month = trip.trip_date ? parseLocalDate(trip.trip_date).getMonth() + 1 : new Date().getMonth() + 1;

  const targetSpeciesObjs = trip.target_species
    .map((slug) => species.find((s) => s.slug === slug))
    .filter((s): s is Species => !!s);

  const otherInSeason = trip.province
    ? species.filter(
        (s) =>
          s.provinces.includes(trip.province!) &&
          isInSeason(s.slug, month) &&
          !trip.target_species.includes(s.slug)
      )
    : [];

  const relevantSpecies = targetSpeciesObjs.length > 0 ? targetSpeciesObjs : otherInSeason;
  const suggestFor = relevantSpecies.map((s) => ({ slug: s.slug, name: s.common_name }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{trip.name}</h1>
        <p className="text-muted">
          {formatTripDates(trip)}
          {trip.place_name && ` · ${trip.place_name}`}
          {trip.province && ` (${trip.province})`}
        </p>
      </div>

      {trip.notes && (
        <p className="rounded-lg border border-border bg-surface p-3 text-sm whitespace-pre-wrap">{trip.notes}</p>
      )}

      <section>
        <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Conditions</h2>
        {trip.lat !== null && trip.lng !== null ? (
          <TripConditionsPanel
            lat={trip.lat}
            lng={trip.lng}
            tripDate={trip.trip_date}
            tripEndDate={trip.trip_end_date}
            units={units}
          />
        ) : (
          <p className="text-sm text-muted">No location set for this trip.</p>
        )}
      </section>

      {targetSpeciesObjs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Target Species</h2>
          <ul className="space-y-2">
            {targetSpeciesObjs.map((s) => {
              const inSeason = isInSeason(s.slug, month);
              return (
                <li key={s.slug} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-2">
                  <span>
                    <Link href={`/species/${s.slug}`} className="font-semibold text-brand-dark hover:underline">
                      {s.common_name}
                    </Link>{" "}
                    <span className={inSeason ? "text-success" : "text-muted"}>
                      {inSeason ? "in season" : "out of season"}
                    </span>
                    {SEASONALITY[s.slug]?.note && <span className="text-muted"> — {SEASONALITY[s.slug].note}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {otherInSeason.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">
            Also In Season Nearby ({otherInSeason.length})
          </h2>
          <ul className="space-y-2">
            {otherInSeason.map((s) => (
              <li key={s.slug} className="text-sm border-b border-border pb-2">
                <Link href={`/species/${s.slug}`} className="font-semibold text-brand-dark hover:underline">
                  {s.common_name}
                </Link>
                {SEASONALITY[s.slug]?.note && <span className="text-muted"> — {SEASONALITY[s.slug].note}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Always confirm current bag limits, seasons and size limits on each species&apos;
            page before keeping anything — DFO variation orders can change these with
            little notice.
          </p>
        </section>
      )}

      {suggestFor.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Suggested Gear</h2>
          <TripChecklist items={[]} suggestFor={suggestFor} />
        </section>
      )}
    </div>
  );
}
