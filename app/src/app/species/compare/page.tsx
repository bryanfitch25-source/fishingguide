import { getAllSpecies, getSpeciesBySlug } from "@/lib/data";
import { SpeciesCompareControls } from "@/components/SpeciesCompareControls";
import { CategoryBadge, ProvinceBadge } from "@/components/Badges";
import { PrintButton } from "@/components/PrintButton";

export const metadata = {
  title: "Compare Species — Maritime Angler",
  description: "Side-by-side comparison of identification, seasons, and quick-reference facts for any species in the guide.",
};

export default async function SpeciesComparePage(props: { searchParams: Promise<{ slugs?: string }> }) {
  const { slugs } = await props.searchParams;
  const selectedSlugs = slugs ? slugs.split(",").filter(Boolean) : [];

  const [allSpecies, selected] = await Promise.all([
    getAllSpecies(),
    Promise.all(selectedSlugs.map((s) => getSpeciesBySlug(s))),
  ]);
  const compared = selected.filter((s) => s !== null);

  // Union of quick-reference labels across the compared species, in first-seen order —
  // keeps aligned rows even when species have different quick-reference fields.
  const labelOrder: string[] = [];
  for (const s of compared) {
    for (const qr of s.quick_reference) {
      if (!labelOrder.includes(qr.label)) labelOrder.push(qr.label);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8 scene-panel rounded-2xl p-5 sm:p-6 no-print">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Compare Species</h1>
        <p className="text-muted max-w-2xl">
          Put species side by side — useful when you&apos;re not sure what you caught, or deciding
          what to target next.
        </p>
      </div>

      <SpeciesCompareControls species={allSpecies} selected={selectedSlugs} />

      {compared.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-2">
            <PrintButton label="🖨️ Print comparison" />
          </div>
          <table className="w-full text-sm border-collapse rounded-xl overflow-hidden border border-border bg-surface">
            <thead>
              <tr className="bg-brand-light">
                <th className="text-left px-3 py-2 w-40">Species</th>
                {compared.map((s) => (
                  <th key={s.slug} className="text-left px-3 py-2 font-bold text-brand-dark">
                    {s.common_name}
                    {s.scientific_name && <div className="italic font-normal text-xs text-muted">{s.scientific_name}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-medium text-muted">Category</td>
                {compared.map((s) => (
                  <td key={s.slug} className="px-3 py-2">
                    <CategoryBadge category={s.category} />
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-medium text-muted">Provinces</td>
                {compared.map((s) => (
                  <td key={s.slug} className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {s.provinces.map((p) => (
                        <ProvinceBadge key={p} province={p} />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-medium text-muted align-top">Summary</td>
                {compared.map((s) => (
                  <td key={s.slug} className="px-3 py-2 align-top">
                    {s.summary ?? "—"}
                  </td>
                ))}
              </tr>
              {labelOrder.map((label) => (
                <tr key={label} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-muted align-top">{label}</td>
                  {compared.map((s) => (
                    <td key={s.slug} className="px-3 py-2 align-top">
                      {s.quick_reference.find((qr) => qr.label === label)?.value ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
