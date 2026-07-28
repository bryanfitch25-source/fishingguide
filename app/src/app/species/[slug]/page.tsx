import { notFound } from "next/navigation";
import { getSpeciesBySlug, getAllSpecies } from "@/lib/data";
import { ProvinceBadge, CategoryBadge } from "@/components/Badges";
import { GuideMarkdown } from "@/components/GuideMarkdown";
import { RegulationsTable } from "@/components/RegulationsTable";

export async function generateStaticParams() {
  const species = await getAllSpecies();
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const species = await getSpeciesBySlug(slug);
  if (!species) return { title: "Species not found — Maritime Angler" };
  return {
    title: `${species.common_name} — Maritime Angler`,
    description: species.summary ?? undefined,
  };
}

export default async function SpeciesDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const species = await getSpeciesBySlug(slug);
  if (!species) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <CategoryBadge category={species.category} />
          {species.provinces.map((p) => (
            <ProvinceBadge key={p} province={p} />
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
          {species.common_name}
        </h1>
        {species.scientific_name && (
          <p className="italic text-muted mt-1">{species.scientific_name}</p>
        )}
        {species.summary && <p className="mt-3 max-w-3xl text-lg">{species.summary}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          {species.guide_sections.map((section) => (
            <section key={section.id} className="mb-8">
              <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
                {section.heading}
              </h2>
              <GuideMarkdown>{section.body_md}</GuideMarkdown>
              {section.sources.length > 0 && (
                <ul className="mt-3 text-xs text-muted space-y-1">
                  {section.sources.map((src, i) => (
                    <li key={i}>
                      Source:{" "}
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-accent underline">
                        {src.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mb-8">
            <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
              Regulations by Province
            </h2>
            <RegulationsTable regulations={species.regulations} />
          </section>

          {species.species_sources.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
                Sources
              </h2>
              <ul className="text-sm space-y-1.5">
                {species.species_sources.map((src, i) => (
                  <li key={i}>
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-accent underline">
                      {src.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          {species.quick_reference.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-bold text-brand-dark mb-3">Quick Reference</h3>
              <dl className="space-y-3 text-sm">
                {species.quick_reference.map((qr) => (
                  <div key={qr.id}>
                    <dt className="font-semibold text-muted">{qr.label}</dt>
                    <dd>{qr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
