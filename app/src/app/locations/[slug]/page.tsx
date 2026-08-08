import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocationGuideBySlug, getAllLocationGuides } from "@/lib/data";
import { ProvinceBadge } from "@/components/Badges";
import { GuideMarkdown } from "@/components/GuideMarkdown";
import { EnvironmentPanel } from "@/components/EnvironmentPanel";

// Tide/weather data is worth refreshing more often than the hour-long default set
// in the root layout.
export const revalidate = 1800;

export async function generateStaticParams() {
  const guides = await getAllLocationGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const guide = await getLocationGuideBySlug(slug);
  if (!guide) return { title: "Trip guide not found — Maritime Angler" };
  return { title: `${guide.title} — Maritime Angler` };
}

export default async function LocationGuideDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const guide = await getLocationGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="mb-2">
          <ProvinceBadge province={guide.province} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">{guide.title}</h1>
        {guide.region_name && <p className="text-muted mt-1">{guide.region_name}</p>}
        {guide.intro_md && (
          <div className="mt-4 max-w-3xl">
            <GuideMarkdown>{guide.intro_md}</GuideMarkdown>
          </div>
        )}
      </div>

      {guide.lat !== null && guide.lng !== null && (
        <div className="mb-10 max-w-xl">
          <EnvironmentPanel lat={guide.lat} lng={guide.lng} />
        </div>
      )}

      {guide.location_guide_spots.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
            Best Spots
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guide.location_guide_spots.map((spot) => (
              <div key={spot.id} className="rounded-lg border border-border bg-surface p-4">
                <h3 className="font-semibold text-brand-dark">{spot.name}</h3>
                {spot.description && <p className="text-sm mt-1">{spot.description}</p>}
                {spot.map_url && (
                  <a
                    href={spot.map_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent-dark underline mt-2 inline-block"
                  >
                    View map ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {guide.location_guide_sections.map((section) => (
        <section key={section.id} className="mb-8">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2 mb-3">
            <h2 className="text-xl font-bold text-brand-dark">{section.heading}</h2>
            {section.species_slug && (
              <Link
                href={`/species/${section.species_slug}`}
                className="text-xs font-medium text-accent hover:underline whitespace-nowrap"
              >
                Full species guide →
              </Link>
            )}
          </div>
          <GuideMarkdown>{section.body_md}</GuideMarkdown>
          {section.sources.length > 0 && (
            <ul className="mt-3 text-xs text-muted space-y-1">
              {section.sources.map((src, i) => (
                <li key={i}>
                  Source:{" "}
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-accent-dark underline">
                    {src.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {guide.location_guide_sources.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
            Sources
          </h2>
          <ul className="text-sm space-y-1.5">
            {guide.location_guide_sources.map((src, i) => (
              <li key={i}>
                <a href={src.url} target="_blank" rel="noreferrer" className="text-accent-dark underline">
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
