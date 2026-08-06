import Link from "next/link";
import { getAllLocationGuides } from "@/lib/data";
import { ProvinceBadge } from "@/components/Badges";
import { LocationsMapLoader } from "@/components/LocationsMapLoader";

export const metadata = {
  title: "Trip Guides — Maritime Angler",
  description: "Spot-by-spot shore fishing trip guides across New Brunswick, Nova Scotia, and PEI.",
};

export default async function LocationsIndexPage() {
  const locations = await getAllLocationGuides();
  const pins = locations
    .filter((l) => l.lat !== null && l.lng !== null)
    .map((l) => ({
      id: l.id,
      lat: l.lat as number,
      lng: l.lng as number,
      title: l.title,
      subtitle: l.region_name ?? undefined,
      href: `/locations/${l.slug}`,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Trip Guides</h1>
      <p className="text-muted mb-8 max-w-2xl">
        Regional, spot-by-spot guides — best access points, which species you&apos;ll encounter,
        tides, and gear for a specific stretch of coast or river.
      </p>

      {pins.length > 0 && (
        <div className="mb-8">
          <LocationsMapLoader locationPins={pins} center={[46.2, -63.8]} zoom={7} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/locations/${loc.slug}`}
            className="group block rounded-xl border border-border bg-surface card-lift p-5 shadow-sm transition hover:shadow-md hover:border-brand"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-lg font-bold text-brand-dark group-hover:text-brand">
                {loc.title}
              </h2>
              <ProvinceBadge province={loc.province} />
            </div>
            {loc.region_name && <p className="text-sm text-muted">{loc.region_name}</p>}
          </Link>
        ))}
        {locations.length === 0 && (
          <p className="text-muted text-sm">No trip guides loaded yet.</p>
        )}
      </div>
    </div>
  );
}
