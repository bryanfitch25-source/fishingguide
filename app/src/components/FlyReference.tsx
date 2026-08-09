"use client";

import { useMemo, useState } from "react";
import {
  FLY_KNOTS,
  LINE_WEIGHT_GUIDE,
  PATTERN_GROUPS,
  SALMON_RULES,
  SALMON_RULES_CAVEAT,
  TIPPET_CHART,
  TIPPET_RULES,
} from "@/lib/fly";
import { PATTERN_TYPES, TOTAL_PATTERNS, TOTAL_STYLES, type FlyPattern } from "@/lib/fly-patterns";
import { FilterDisclosure, FilterSelect } from "@/components/FilterDisclosure";

type RefTab = "patterns" | "weights" | "tippet" | "knots" | "rules";

const TABS: { id: RefTab; label: string }[] = [
  { id: "patterns", label: "Patterns" },
  { id: "weights", label: "Line weight" },
  { id: "tippet", label: "Tippet" },
  { id: "knots", label: "Knots" },
  { id: "rules", label: "Salmon rules" },
];

// The reference half of the fly section — the things that only matter once you're holding
// a fly rod, and that the conventional guide has no place for. Kept beside the gear rather
// than in the Fishing Guide because the two get used together: you look up a tippet size
// while standing over the box you're picking a fly out of.
export function FlyReference({ initialPattern = "" }: { initialPattern?: string } = {}) {
  const [tab, setTab] = useState<RefTab>("patterns");
  const [quarry, setQuarry] = useState(PATTERN_GROUPS[0].quarry);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  // Seeded from ?pattern= so a link from the matcher lands on the fly it named rather than
  // on the top of a list of 99. Plain initial state rather than an effect: it only needs to
  // be right on arrival, and the search box stays fully editable afterwards.
  const [search, setSearch] = useState(initialPattern);
  const group = PATTERN_GROUPS.find((g) => g.quarry === quarry) ?? PATTERN_GROUPS[0];

  // Search runs across every group rather than within the selected one — with this many
  // patterns, someone typing "smelt" or "Clouser" wants the answer wherever it lives, and
  // several flies genuinely belong to more than one quarry.
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows: { pattern: FlyPattern; quarry: string }[] = [];
    for (const g of PATTERN_GROUPS) {
      if (!q && g.quarry !== quarry) continue;
      for (const p of g.patterns) {
        if (typeFilter !== "all" && p.type !== typeFilter) continue;
        if (q) {
          const hay = [p.name, p.type, p.when, p.note, p.origin ?? "", p.imitates ?? ""]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) continue;
        }
        rows.push({ pattern: p, quarry: g.quarry });
      }
    }
    return rows;
  }, [search, quarry, typeFilter]);

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Fly reference" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-guide text-on-brand"
                : "border border-border bg-surface text-muted hover:border-guide"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "patterns" && (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search all ${TOTAL_PATTERNS} flies — name, origin, what it imitates…`}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          {/* Quarry and type used to be two more rows of pill buttons sitting permanently
              under the search box. One disclosure, closed by default, with a badge for
              "a type filter is narrowing this" — quarry itself always has a value so it
              doesn't count toward the badge. */}
          <FilterDisclosure activeCount={typeFilter !== "all" ? 1 : 0}>
            <FilterSelect
              label="Quarry"
              value={quarry}
              onChange={setQuarry}
              options={PATTERN_GROUPS.map((g) => ({ value: g.quarry, label: g.quarry }))}
            />
            <FilterSelect
              label="Fly type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All types" },
                ...PATTERN_TYPES.map((t) => ({ value: t, label: t })),
              ]}
            />
          </FilterDisclosure>

          {/* On a surface rather than loose on the page — the app's backgrounds are
              photographs, and small muted type directly on one is barely readable. */}
          <div className="rounded-xl border border-border bg-surface p-3">
            {!search && <p className="text-sm text-muted">{group.blurb}</p>}
            <p className={`text-xs text-muted ${search ? "" : "mt-2"}`}>
              {results.length} {results.length === 1 ? "fly" : "flies"}
              {search ? " across every group" : ` for ${group.quarry.toLowerCase()}`}
              {typeFilter !== "all" && ` · ${typeFilter.toLowerCase()} only`}
            </p>
            {/* The honest framing of what the library is, rather than a count that implies
                every row is a documented dressing with a named tyer. */}
            <p className="mt-1.5 text-xs text-muted">
              {TOTAL_PATTERNS} distinct flies in all — {TOTAL_PATTERNS - TOTAL_STYLES} named
              patterns, credited to a tyer where that&apos;s documented, and {TOTAL_STYLES}{" "}
              marked as a style rather than a specific dressing. Ten are listed under more than
              one quarry because they genuinely belong to both.
            </p>
          </div>

          <div className="space-y-2">
            {results.length === 0 && (
              <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
                Nothing matches. Everything here is either a real named pattern or a style of
                fly labelled as one — if what you expect is missing it hasn&apos;t been added
                yet rather than been renamed.
              </p>
            )}
            {results.map(({ pattern: p, quarry: q }) => (
              <div key={`${q}-${p.name}`} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-brand-dark">
                    {p.name}
                    {/* Says plainly when an entry is a kind of fly rather than a specific
                        dressing, so nobody hunts for a canonical recipe that doesn't
                        exist. */}
                    {p.style && (
                      <span className="ml-2 rounded-full border border-border px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-muted">
                        a style, not a named pattern
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-muted">
                    {p.type} · sizes {p.sizes}
                    {search && ` · ${q}`}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-accent-dark">{p.when}</p>
                <p className="mt-1 text-sm">{p.note}</p>
                {(p.origin || p.imitates) && (
                  <p className="mt-1.5 text-xs text-muted">
                    {p.imitates && <>Imitates {p.imitates.toLowerCase()}</>}
                    {p.imitates && p.origin && " · "}
                    {p.origin && <>{p.origin}</>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "weights" && (
        <div className="space-y-2">
          {LINE_WEIGHT_GUIDE.map((g) => (
            <div key={g.weights} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="rounded-full bg-guide-light px-2.5 py-0.5 text-sm font-bold text-guide">
                  {g.weights}
                </span>
                <span className="font-semibold text-brand-dark">{g.what}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{g.detail}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "tippet" && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-guide-light text-guide">
                <tr>
                  <th className="px-3 py-2 text-left">X</th>
                  <th className="px-3 py-2 text-left">Diameter</th>
                  <th className="px-3 py-2 text-left">Approx. test</th>
                  <th className="px-3 py-2 text-left">Hook sizes</th>
                  <th className="px-3 py-2 text-left">Typical use</th>
                </tr>
              </thead>
              <tbody>
                {TIPPET_CHART.map((r) => (
                  <tr key={r.x} className="border-t border-border">
                    <td className="px-3 py-2 font-bold tabular-nums">{r.x}</td>
                    <td className="px-3 py-2 tabular-nums">{r.diameterIn}&quot;</td>
                    <td className="px-3 py-2 tabular-nums">{r.approxLb}</td>
                    <td className="px-3 py-2 tabular-nums">{r.hookSizes}</td>
                    <td className="px-3 py-2 text-muted">{r.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-semibold text-brand-dark">Worth memorising</p>
            <ul className="space-y-1.5 text-sm">
              {TIPPET_RULES.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden className="text-guide">
                    ▸
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "knots" && (
        <div className="space-y-2">
          {FLY_KNOTS.map((k) => (
            <details key={k.name} className="rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer">
                <span className="font-bold text-brand-dark">{k.name}</span>
                <span className="ml-2 text-sm text-muted">{k.joins}</span>
              </summary>
              <p className="mt-2 text-sm text-muted">{k.why}</p>
              <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm">
                {k.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      )}

      {tab === "rules" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-danger bg-danger-light p-4 text-danger">
            <p className="font-bold">Atlantic salmon is fly-only, by law</p>
            <p className="mt-1 text-sm">
              This is the reason the fly box is its own box. On sea-run salmon water a spinning
              rod isn&apos;t merely the wrong tool — it&apos;s an offence.
            </p>
          </div>
          {SALMON_RULES.map((r) => (
            <div key={r.rule} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-bold text-brand-dark">{r.rule}</p>
              <p className="mt-1 text-sm">{r.detail}</p>
            </div>
          ))}
          <p className="text-xs text-muted">{SALMON_RULES_CAVEAT}</p>
        </div>
      )}
    </div>
  );
}
