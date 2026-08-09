import Link from "next/link";
import { getAllLocationGuides, getAllSpecies } from "@/lib/data";
import { getCurrentUser, createClient } from "@/lib/supabase-server";
import { isInSeason, SEASONALITY } from "@/lib/seasonality";
import { EnvironmentPanel } from "@/components/EnvironmentPanel";
import { TripPlannerControls } from "@/components/TripPlannerControls";
import { TripChecklist } from "@/components/TripChecklist";
import { PrintButton } from "@/components/PrintButton";
import type { TackleItem } from "@/types/tackle";

export const metadata = {
  title: "Trip Planner — Maritime Angler",
  description: "One page for a specific outing: conditions, in-season species, regulations, and your gear checklist.",
};

// Tide/weather/regulations context is worth refreshing more often than the hour-long
// site-wide default.
export const revalidate = 1800;

export default async function TripPlannerPage(props: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await props.searchParams;
  const [locations, species, user] = await Promise.all([
    getAllLocationGuides(),
    getAllSpecies(),
    getCurrentUser(),
  ]);

  const guide = location ? locations.find((l) => l.slug === location) : null;
  const month = new Date().getMonth() + 1;

  const relevantSpecies = guide
    ? species.filter((s) => s.provinces.includes(guide.province))
    : [];
  const inSeason = relevantSpecies.filter((s) => isInSeason(s.slug, month));

  let tackleItems: TackleItem[] = [];
  if (guide && user && inSeason.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tackle_items")
      .select("*, tackle_item_species!inner(species_slug)")
      .in(
        "tackle_item_species.species_slug",
        inSeason.map((s) => s.slug)
      );
    tackleItems = (data as unknown as TackleItem[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 print-clean">
      <div className="mb-8 scene-panel rounded-2xl p-5 sm:p-6 no-print">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Trip Planner</h1>
        <p className="text-muted max-w-2xl">
          Pick a trip guide and get conditions, what&apos;s in season, and your gear checklist
          on one page you can print and take with you.
        </p>
      </div>

      <TripPlannerControls locations={locations} selectedSlug={guide?.slug ?? null} />

      {!guide && (
        <p className="text-sm text-muted">Choose a location above to build your trip sheet.</p>
      )}

      {guide && (
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* No province badge — the title already ends in the province. */}
              <h2 className="text-2xl font-bold text-brand-dark">{guide.title}</h2>
              {guide.region_name && <p className="text-muted">{guide.region_name}</p>}
            </div>
            <PrintButton />
          </div>

          {guide.lat !== null && guide.lng !== null && <EnvironmentPanel lat={guide.lat} lng={guide.lng} />}

          <section>
            <h3 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">
              In Season Now ({inSeason.length})
            </h3>
            {inSeason.length === 0 ? (
              <p className="text-sm text-muted">Nothing flagged as prime this month for this province.</p>
            ) : (
              <ul className="space-y-2">
                {inSeason.map((s) => (
                  <li key={s.slug} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-2">
                    <span>
                      <Link href={`/species/${s.slug}`} className="font-semibold text-brand-dark hover:underline">
                        {s.common_name}
                      </Link>
                      {SEASONALITY[s.slug]?.note && (
                        <span className="text-muted"> — {SEASONALITY[s.slug].note}</span>
                      )}
                    </span>
                    <Link href={`/species/${s.slug}#regulations`} className="no-print text-xs text-accent hover:underline whitespace-nowrap">
                      Check regs →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-muted">
              Always confirm current bag limits, seasons, and size limits on each species&apos; page
              before keeping anything — DFO variation orders can change these with little notice.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">
              Trip Gear Checklist
            </h3>
            {!user ? (
              <p className="text-sm text-muted">
                <Link href="/login" className="text-accent hover:underline">
                  Sign in
                </Link>{" "}
                to see your tagged gear for these species as a checklist.
              </p>
            ) : (
              <TripChecklist items={tackleItems} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
