import type { Province, SpeciesCategory } from "@/types/content";

const PROVINCE_LABEL: Record<Province, string> = {
  NB: "New Brunswick",
  NS: "Nova Scotia",
  PEI: "Prince Edward Island",
};

const CATEGORY_STYLE: Record<SpeciesCategory, string> = {
  freshwater: "bg-brand-light text-brand-dark",
  saltwater: "bg-teal-100 text-teal-900",
  anadromous: "bg-catches-light text-catches",
};

export function ProvinceBadge({ province }: { province: Province }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark">
      {province}
      <span className="sr-only"> ({PROVINCE_LABEL[province]})</span>
    </span>
  );
}

export function CategoryBadge({ category }: { category: SpeciesCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLE[category]}`}
    >
      {category}
    </span>
  );
}

export function provinceLabel(p: Province) {
  return PROVINCE_LABEL[p];
}
