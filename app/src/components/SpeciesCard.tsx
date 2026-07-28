import Link from "next/link";
import type { Species } from "@/types/content";
import { ProvinceBadge, CategoryBadge } from "./Badges";

export function SpeciesCard({ species }: { species: Species }) {
  return (
    <Link
      href={`/species/${species.slug}`}
      className="group block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md hover:border-brand"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand">
          {species.common_name}
        </h3>
        <CategoryBadge category={species.category} />
      </div>
      {species.scientific_name && (
        <p className="mt-0.5 text-sm italic text-muted">{species.scientific_name}</p>
      )}
      {species.summary && <p className="mt-2 text-sm leading-relaxed">{species.summary}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {species.provinces.map((p) => (
          <ProvinceBadge key={p} province={p} />
        ))}
      </div>
    </Link>
  );
}
