import Link from "next/link";
import type { Species } from "@/types/content";
import { SEASONALITY } from "@/lib/seasonality";

const MONTH_ABBR = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function SeasonalityHeatmap({ species }: { species: Species[] }) {
  const rows = species
    .map((s) => ({ species: s, months: new Set(SEASONALITY[s.slug]?.months ?? []) }))
    .sort((a, b) => a.species.common_name.localeCompare(b.species.common_name));

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface card-lift">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-brand-light">
            <th className="text-left px-3 py-2 sticky left-0 bg-brand-light">Species</th>
            {MONTH_ABBR.map((m, i) => (
              <th key={i} className="px-1.5 py-2 text-center font-medium w-8">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ species: s, months }) => (
            <tr key={s.slug} className="border-t border-border">
              <td className="px-3 py-1.5 sticky left-0 bg-surface whitespace-nowrap">
                <Link href={`/species/${s.slug}`} className="hover:text-brand hover:underline">
                  {s.common_name}
                </Link>
              </td>
              {MONTH_ABBR.map((_, i) => (
                <td key={i} className="px-1.5 py-1.5 text-center">
                  <span
                    className={`inline-block h-4 w-4 rounded ${months.has(i + 1) ? "bg-guide" : "bg-border/40"}`}
                    title={months.has(i + 1) ? "In season" : "Out of season"}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
