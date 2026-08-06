import Image from "next/image";
import type { SpeciesVariant, VariantKind } from "@/types/content";

const KIND_LABEL: Record<VariantKind, string> = {
  form: "Form",
  stock: "Stock",
  "life-stage": "Life Stage",
  lookalike: "Lookalike",
  "related-species": "Related Species",
};

const KIND_STYLE: Record<VariantKind, string> = {
  form: "bg-brand-light text-brand-dark",
  stock: "bg-catches-light text-catches",
  "life-stage": "bg-emerald-100 text-emerald-900",
  lookalike: "bg-accent-light text-accent-dark",
  "related-species": "bg-teal-100 text-teal-900",
};

export function VariantsSection({ variants }: { variants: SpeciesVariant[] }) {
  if (!variants.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-1">
        Forms &amp; Lookalikes
      </h2>
      <p className="text-sm text-muted mb-4">
        Other forms of this fish, and species anglers commonly confuse it with.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {variants.map((v) => (
          <div key={v.id} className="rounded-lg border border-border bg-surface overflow-hidden">
            {v.image.path && (
              <div className="relative h-36 w-full bg-brand-light">
                <Image
                  src={v.image.path}
                  alt={v.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-brand-dark">{v.name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${KIND_STYLE[v.kind]}`}
                >
                  {KIND_LABEL[v.kind]}
                </span>
              </div>
              {v.scientific_name && (
                <p className="text-xs italic text-muted mb-2">{v.scientific_name}</p>
              )}
              <p className="text-sm">
                <span className="font-semibold text-muted">How to tell: </span>
                {v.how_to_tell}
              </p>
              {v.where_found && (
                <p className="text-sm mt-1.5">
                  <span className="font-semibold text-muted">Where: </span>
                  {v.where_found}
                </p>
              )}
              {v.notes && (
                <p className="text-sm mt-1.5 rounded bg-accent-light text-accent-dark px-2 py-1.5">
                  {v.notes}
                </p>
              )}
              {v.image.path && v.image.credit && (
                <p className="mt-2 text-[11px] text-muted">
                  Photo: {v.image.credit}
                  {v.image.license ? ` (${v.image.license})` : ""}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
