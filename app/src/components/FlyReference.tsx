"use client";

import { useState } from "react";
import {
  FLY_KNOTS,
  LINE_WEIGHT_GUIDE,
  PATTERN_GROUPS,
  SALMON_RULES,
  SALMON_RULES_CAVEAT,
  TIPPET_CHART,
  TIPPET_RULES,
} from "@/lib/fly";

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
export function FlyReference() {
  const [tab, setTab] = useState<RefTab>("patterns");
  const [quarry, setQuarry] = useState(PATTERN_GROUPS[0].quarry);
  const group = PATTERN_GROUPS.find((g) => g.quarry === quarry) ?? PATTERN_GROUPS[0];

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
          <div className="flex flex-wrap gap-2">
            {PATTERN_GROUPS.map((g) => (
              <button
                key={g.quarry}
                onClick={() => setQuarry(g.quarry)}
                aria-pressed={quarry === g.quarry}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  quarry === g.quarry
                    ? "bg-guide-light font-semibold text-guide"
                    : "border border-border text-muted hover:border-guide"
                }`}
              >
                {g.quarry}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">{group.blurb}</p>
          <div className="space-y-2">
            {group.patterns.map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-brand-dark">{p.name}</h3>
                  <span className="text-xs text-muted">
                    {p.type} · sizes {p.sizes}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-accent-dark">{p.when}</p>
                <p className="mt-1 text-sm">{p.note}</p>
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
