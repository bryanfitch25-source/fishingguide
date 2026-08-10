import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllLocationGuides, getAllSpecies } from "@/lib/data";
import { getCurrentUser, createClient } from "@/lib/supabase-server";
import { getTrip } from "@/lib/trips";
import { isInSeason } from "@/lib/seasonality";
import { isUnitSystem } from "@/lib/units";
import { parseLocalDate } from "@/lib/dates";
import { TripConditionsPanel } from "@/components/TripConditionsPanel";
import { TripDetailClient } from "@/components/TripDetailClient";
import type { FavouriteStation, TackleItem } from "@/types/tackle";
import type { Species } from "@/types/content";

export default async function TripDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trip = await getTrip(id);
  if (!trip) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
        <p className="text-sm text-muted">
          That trip doesn&apos;t exist, or isn&apos;t yours.{" "}
          <Link href="/trip-planner" className="text-accent hover:underline">
            Back to Trip Planner
          </Link>
        </p>
      </div>
    );
  }

  const [guides, species, supabase] = await Promise.all([getAllLocationGuides(), getAllSpecies(), createClient()]);
  const [{ data: settingsData }, { data: favouritesData }] = await Promise.all([
    supabase.from("angler_settings").select("units").maybeSingle(),
    supabase.from("favourite_stations").select("*").order("position"),
  ]);
  const units = isUnitSystem(settingsData?.units) ? settingsData.units : "metric";
  const favourites = (favouritesData as FavouriteStation[]) ?? [];

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

  // Gear checklist covers the trip's target species if any were picked, falling back
  // to whatever's in season nearby so the checklist isn't empty for a trip with no
  // species chosen yet.
  const relevantSlugs =
    trip.target_species.length > 0 ? trip.target_species : otherInSeason.map((s) => s.slug);

  const items: TackleItem[] = [];
  let coveredSlugs = new Set<string>();
  if (relevantSlugs.length > 0) {
    // Queried from the join table directly rather than embedding tackle_item_species
    // under tackle_items with a filtered !inner join — that embedding's exact shape
    // (one parent row vs. one per matching child) isn't something to rely on without
    // testing against the live API, and this direction is unambiguous either way.
    const { data } = await supabase
      .from("tackle_item_species")
      .select("species_slug, tackle_items(*)")
      .in("species_slug", relevantSlugs);
    const rows = (data as unknown as { species_slug: string; tackle_items: TackleItem }[]) ?? [];
    coveredSlugs = new Set(rows.map((r) => r.species_slug));
    const seen = new Set<string>();
    for (const r of rows) {
      if (r.tackle_items && !seen.has(r.tackle_items.id)) {
        seen.add(r.tackle_items.id);
        items.push(r.tackle_items);
      }
    }
  }
  const suggestFor = relevantSlugs
    .filter((slug) => !coveredSlugs.has(slug))
    .map((slug) => ({ slug, name: species.find((s) => s.slug === slug)?.common_name ?? slug }));

  const conditions =
    trip.lat !== null && trip.lng !== null ? (
      <TripConditionsPanel
        lat={trip.lat}
        lng={trip.lng}
        tripDate={trip.trip_date}
        tripEndDate={trip.trip_end_date}
        units={units}
      />
    ) : (
      <p className="text-sm text-muted">No location set for this trip yet — edit it to add one.</p>
    );

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10 print-clean">
      <TripDetailClient
        trip={trip}
        guides={guides}
        species={species}
        favourites={favourites}
        items={items}
        suggestFor={suggestFor}
        targetSpeciesObjs={targetSpeciesObjs}
        otherInSeason={otherInSeason}
      >
        {conditions}
      </TripDetailClient>
    </div>
  );
}
