import Link from "next/link";
import { getRegulationsOverview } from "@/lib/data";
import { ProvinceBadge } from "@/components/Badges";
import { SeasonStatus } from "@/components/SeasonStatus";
import type { Province } from "@/types/content";

export const metadata = {
  title: "Regulations Overview — Maritime Angler",
  description: "Season, bag limit, and size limit summary by province for every species.",
};

const PROVINCES: Province[] = ["NB", "NS", "PEI"];

export default async function RegulationsOverviewPage() {
  const rows = await getRegulationsOverview();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Regulations Overview</h1>
      <p className="text-muted mb-4 max-w-2xl">
        A quick-scan summary pulled from each species guide. Regulators issue variation orders
        that change dates and limits with little notice — always confirm on the official DFO
        or provincial site linked from each species page before you fish.
      </p>
      <div className="rounded-lg border border-amber-300 bg-accent-light text-accent-dark px-4 py-3 text-sm mb-8">
        This page is a convenience index, not a legal reference. Tap through to a species for
        full regulation details and official source links.
      </div>

      {PROVINCES.map((province) => {
        const provinceRows = rows.filter((r) => r.province === province);
        if (provinceRows.length === 0) return null;
        return (
          <section key={province} className="mb-10">
            <div className="mb-3">
              <ProvinceBadge province={province} />
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-brand-light">
                  <tr>
                    <th className="text-left px-3 py-2">Species</th>
                    <th className="text-left px-3 py-2">Water</th>
                    <th className="text-left px-3 py-2">Season</th>
                    <th className="text-left px-3 py-2">Bag Limit</th>
                    <th className="text-left px-3 py-2">Size Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {provinceRows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">
                        <Link href={`/species/${row.species_slug}`} className="text-accent hover:underline">
                          {row.species_name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{row.water_type ?? "—"}</td>
                      <td className="px-3 py-2">
                        {row.season ?? "—"}
                        <SeasonStatus season={row.season} />
                      </td>
                      <td className="px-3 py-2">{row.bag_limit ?? "—"}</td>
                      <td className="px-3 py-2">{row.size_limit ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {rows.length === 0 && <p className="text-muted text-sm">No regulation data loaded yet.</p>}
    </div>
  );
}
