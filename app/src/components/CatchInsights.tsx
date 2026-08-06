"use client";

import { useMemo } from "react";
import type { Catch } from "@/types/tackle";
import { formatPressure, formatSpeed, formatTemperature, type UnitSystem } from "@/lib/units";

// Patterns across everything logged, computed entirely from data already captured at
// logging time — no network, so it's instant and works offline in the Home Screen app.
//
// Slack Water's four breakdowns (tide state, time of day, by month, typical conditions)
// join this app's existing year-in-review and life list rather than replacing them.
// Each one explains itself when the underlying field was never captured, because most
// of these only exist for catches logged after the conditions snapshot shipped — a
// silently empty chart would read as a bug rather than as missing history.

const MIN_CATCHES = 3;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Bucket {
  label: string;
  count: number;
}

function BarChart({ buckets, total, emptyMessage }: { buckets: Bucket[]; total: number; emptyMessage: string }) {
  if (total === 0) return <p className="text-sm text-muted">{emptyMessage}</p>;
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <ul className="space-y-1.5">
      {buckets.map((b) => (
        <li key={b.label} className="flex items-center gap-2 text-sm">
          <span className="w-28 shrink-0 text-muted">{b.label}</span>
          <span className="h-4 flex-1 overflow-hidden rounded-full bg-background">
            <span
              className="block h-full rounded-full bg-catches"
              style={{ width: `${(b.count / max) * 100}%` }}
            />
          </span>
          <span className="w-16 shrink-0 text-right tabular-nums text-muted">
            {b.count} · {Math.round((b.count / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-brand-dark">{title}</h4>
      {children}
    </div>
  );
}

// Species that differ from your overall tide split are the interesting ones — striped
// bass and mackerel do not behave the same way, and this app is unusually placed to say
// so because it already ties every catch to a species guide.
//
// What this is NOT: a claim about catch *rate*. "70% of your catches come on the rising"
// only means something next to how much of your fishing time was on the rising, and the
// app records catches, not hours. The suggested proxy — the two hours either side of each
// catch — reuses the same catches to stand in for the effort, so it would dress the same
// number up as a comparison. Without effort data the honest statement is the one below:
// this is where your catches fell, per species, and it is worth a look when a species
// leans much harder than your average.
const MIN_SPECIES_CATCHES = 4;

interface SpeciesTide {
  slug: string;
  name: string;
  rising: number;
  falling: number;
  total: number;
}

export function CatchInsights({
  catches,
  units,
  species,
}: {
  catches: Catch[];
  units: UnitSystem;
  // The list itself rather than a slug→name map, because the list arrives from the server
  // and keeps its identity between renders; a map built in the parent's render body would
  // be a new object every time and would defeat the memo below.
  species?: { slug: string; common_name: string }[];
}) {
  const insights = useMemo(() => {
    const speciesNames = new Map((species ?? []).map((s) => [s.slug, s.common_name]));
    const tideBuckets: Bucket[] = [
      { label: "Rising", count: catches.filter((c) => c.tide_state === "rising").length },
      { label: "Falling", count: catches.filter((c) => c.tide_state === "falling").length },
      { label: "Unknown", count: catches.filter((c) => c.tide_state === "unknown").length },
    ];
    const tideTotal = tideBuckets.reduce((sum, b) => sum + b.count, 0);

    // Only catches with a real timestamp can be bucketed — catch_date is a bare date,
    // and back-dating an entry shouldn't invent a time of day it never had.
    const timed = catches.filter((c) => c.caught_at);
    const hourOf = (c: Catch) => new Date(c.caught_at as string).getHours();
    const timeBuckets: Bucket[] = [
      { label: "Early morning", count: timed.filter((c) => hourOf(c) < 6).length },
      { label: "Morning", count: timed.filter((c) => hourOf(c) >= 6 && hourOf(c) < 12).length },
      { label: "Afternoon", count: timed.filter((c) => hourOf(c) >= 12 && hourOf(c) < 18).length },
      { label: "Evening", count: timed.filter((c) => hourOf(c) >= 18).length },
    ];

    // Most recent 12 months that actually have catches, so a long gap doesn't render
    // as a column of empty rows.
    const monthCounts = new Map<string, number>();
    for (const c of catches) {
      if (!c.catch_date) continue;
      const d = new Date(c.catch_date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
    const monthBuckets: Bucket[] = [...monthCounts.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .reverse()
      .map(([key, count]) => {
        const [year, month] = key.split("-");
        return { label: `${MONTH_NAMES[Number(month)]} ${year}`, count };
      });
    const monthTotal = monthBuckets.reduce((sum, b) => sum + b.count, 0);

    const average = (values: (number | null)[]): number | null => {
      const present = values.filter((v): v is number => v !== null && v !== undefined);
      return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
    };

    // Per-species tide split, over catches that actually recorded a tide state. Species
    // below the threshold are pooled out rather than shown at 100% off two catches.
    const bySpecies = new Map<string, SpeciesTide>();
    for (const c of catches) {
      if (!c.species_slug) continue;
      if (c.tide_state !== "rising" && c.tide_state !== "falling") continue;
      const row = bySpecies.get(c.species_slug) ?? {
        slug: c.species_slug,
        name: speciesNames.get(c.species_slug) ?? c.species_slug,
        rising: 0,
        falling: 0,
        total: 0,
      };
      if (c.tide_state === "rising") row.rising += 1;
      else row.falling += 1;
      row.total += 1;
      bySpecies.set(c.species_slug, row);
    }
    const speciesTides = [...bySpecies.values()]
      .filter((s) => s.total >= MIN_SPECIES_CATCHES)
      .sort((a, b) => b.total - a.total);

    // The overall rising share, so each species can be read against it rather than in
    // isolation — 60% rising means nothing until you know your own baseline.
    const directional = tideBuckets[0].count + tideBuckets[1].count;
    const overallRisingShare = directional > 0 ? tideBuckets[0].count / directional : null;

    const conditionCounts = new Map<string, number>();
    for (const c of catches) {
      if (!c.weather_condition) continue;
      conditionCounts.set(c.weather_condition, (conditionCounts.get(c.weather_condition) ?? 0) + 1);
    }
    const commonestCondition = [...conditionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      tideBuckets,
      tideTotal,
      timeBuckets,
      timeTotal: timed.length,
      monthBuckets,
      monthTotal,
      avgWind: average(catches.map((c) => c.wind_kmh)),
      avgPressure: average(catches.map((c) => c.pressure_kpa)),
      avgTemp: average(catches.map((c) => c.temperature_c)),
      commonestCondition,
      speciesTides,
      overallRisingShare,
      firstDate: catches.map((c) => c.catch_date).filter(Boolean).sort()[0] ?? null,
    };
  }, [catches, species]);

  if (catches.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nothing logged yet — log a catch and patterns start showing up here.
      </p>
    );
  }

  if (catches.length < MIN_CATCHES) {
    const remaining = MIN_CATCHES - catches.length;
    return (
      <p className="text-sm text-muted">
        Log {remaining} more catch{remaining === 1 ? "" : "es"} to start seeing patterns —
        there isn&apos;t enough here yet for the breakdowns to mean anything.
      </p>
    );
  }

  const typicalRows = [
    { label: "Average wind", value: insights.avgWind === null ? null : formatSpeed(insights.avgWind, units) },
    { label: "Average pressure", value: insights.avgPressure === null ? null : formatPressure(insights.avgPressure, units) },
    { label: "Average temperature", value: insights.avgTemp === null ? null : formatTemperature(insights.avgTemp, units) },
    { label: "Most common weather", value: insights.commonestCondition },
  ].filter((r) => r.value !== null);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {catches.length} catch{catches.length === 1 ? "" : "es"} logged
        {insights.firstDate && ` since ${new Date(insights.firstDate).toLocaleDateString("en-CA", { month: "long", year: "numeric" })}`}
        .
      </p>

      <Section title="Tide state">
        <BarChart
          buckets={insights.tideBuckets}
          total={insights.tideTotal}
          emptyMessage="No catches have a recorded tide state yet — use the quick-log button and the tide at that moment gets saved with the catch."
        />
      </Section>

      {insights.speciesTides.length > 0 && insights.overallRisingShare !== null && (
        <Section title="Tide state by species">
          <p className="mb-2 text-xs text-muted">
            Where your catches fell, per species, next to your own overall split of{" "}
            <span className="font-semibold">
              {Math.round(insights.overallRisingShare * 100)}% rising
            </span>
            . Species with fewer than {MIN_SPECIES_CATCHES} tide-stamped catches are left out.
          </p>
          <ul className="space-y-1.5">
            {insights.speciesTides.map((s) => {
              const risingShare = s.rising / s.total;
              // Ten points clear of your baseline is the point at which a split is worth
              // a second look rather than noise on a small sample.
              const leans = Math.abs(risingShare - (insights.overallRisingShare ?? 0)) >= 0.1;
              return (
                <li key={s.slug} className="flex items-center gap-2 text-sm">
                  <span className="w-28 shrink-0 truncate text-muted" title={s.name}>
                    {s.name}
                  </span>
                  <span className="flex h-4 flex-1 overflow-hidden rounded-full bg-background">
                    <span
                      className="block h-full bg-catches"
                      style={{ width: `${risingShare * 100}%` }}
                      title={`${s.rising} on the rising`}
                    />
                    <span
                      className="block h-full bg-brand-light"
                      style={{ width: `${(1 - risingShare) * 100}%` }}
                      title={`${s.falling} on the falling`}
                    />
                  </span>
                  {/* Emphasis rather than a marker glyph. A dot explained only by a
                      title attribute is invisible on a touch screen, which is where
                      this app spends its life. */}
                  <span
                    className={`w-24 shrink-0 text-right tabular-nums ${
                      leans ? "font-bold text-catches" : "text-muted"
                    }`}
                  >
                    {Math.round(risingShare * 100)}% ↑ · {s.total}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">
            ↑ is the rising tide, and a <strong className="text-catches">bold figure</strong>{" "}
            leans at least ten points away from your own average — those are the ones worth a
            look. This is where your catches landed, not a catch rate: the app records
            catches, not the hours you fished, so it can&apos;t say whether the rising is
            better or just when you happen to be on the water.
          </p>
        </Section>
      )}

      <Section title="Time of day">
        <BarChart
          buckets={insights.timeBuckets}
          total={insights.timeTotal}
          emptyMessage="No catches have a recorded time yet — catches entered by hand only carry a date."
        />
      </Section>

      <Section title="By month">
        <BarChart
          buckets={insights.monthBuckets}
          total={insights.monthTotal}
          emptyMessage="No catches have a recorded date."
        />
      </Section>

      <Section title="Typical conditions">
        {typicalRows.length === 0 ? (
          <p className="text-sm text-muted">
            No weather was recorded with any catch yet — the quick-log button captures it
            automatically.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {typicalRows.map((r) => (
              <div key={r.label}>
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="font-semibold text-brand-dark">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Section>
    </div>
  );
}
