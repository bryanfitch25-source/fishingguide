import { AccentCard } from "./AccentCard";
import type { MarineConditions } from "@/lib/marine";
import { formatHeight, formatTemperature, type UnitSystem } from "@/lib/units";

// Wave, swell and sea-surface temperature.
//
// Open-Meteo's wave model only covers open water, so an inland lake or a spot well up
// an estuary legitimately has no marine data. That's a normal outcome, not a failure,
// and it says so plainly instead of rendering a row of zeroes — a 0.00 m wave height
// reads as "dead flat calm", which is a materially different claim from "we don't know".
export function MarineCard({
  marine,
  units,
}: {
  marine: MarineConditions | null;
  units: UnitSystem;
}) {
  if (!marine) {
    return (
      <AccentCard tone="neutral" title="🌊 Marine conditions">
        <p className="text-sm text-muted">
          No marine data for this location — wave and swell forecasts only cover open
          coastal water, not inland lakes or upper estuaries.
        </p>
      </AccentCard>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Wave height", value: formatHeight(marine.waveHeightM, units) },
    { label: "Swell", value: formatHeight(marine.swellHeightM, units) },
    { label: "Sea temp", value: formatTemperature(marine.seaTemperatureC, units) },
  ];

  return (
    <AccentCard tone="rising" title="🌊 Marine conditions">
      <dl className="grid grid-cols-3 gap-3 text-sm">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs text-muted">{r.label}</dt>
            <dd className="font-semibold text-brand-dark">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-muted">
        Open-Meteo marine forecast · not for navigation
      </p>
    </AccentCard>
  );
}
