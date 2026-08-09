"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ACCESS_NOTES,
  BEACH_FEATURES,
  READING_STEPS,
  SURF_CAVEAT,
  SURF_CONDITIONS,
  SURF_DIFFERENCES,
  SURF_GEAR,
  SURF_HAZARDS,
  SURF_LIKELIHOOD_ORDER,
  SURF_RIGS,
  SURF_SECTIONS,
  SURF_TARGETS,
  SURF_TIDE_NOTES,
  SURF_TIDE_WINDOWS,
  type SurfTopic,
} from "@/lib/surf";
import { FilterSelect } from "@/components/FilterDisclosure";
import type { Province } from "@/types/content";

const PROVINCES: Province[] = ["NB", "NS", "PEI"];

const LIKELIHOOD_STYLE: Record<string, string> = {
  "The reason you're here": "bg-brand-light text-brand",
  Common: "bg-success-light text-success",
  Seasonal: "bg-accent-light text-accent-dark",
  Bycatch: "bg-guide-light text-guide",
};

const VERDICT_STYLE: Record<string, string> = {
  Good: "bg-success-light text-success",
  Workable: "bg-brand-light text-brand",
  Hard: "bg-accent-light text-accent-dark",
  "Stay off": "bg-danger-light text-danger",
};

export function SurfClient({ species }: { species: { slug: string; common_name: string }[] }) {
  const [tab, setTab] = useState<SurfTopic>("different");
  const [province, setProvince] = useState<Province | "all">("all");

  const known = useMemo(() => new Set(species.map((s) => s.slug)), [species]);

  const targets = useMemo(
    () =>
      SURF_TARGETS.filter((t) => province === "all" || t.regions.includes(province)).sort(
        (a, b) =>
          SURF_LIKELIHOOD_ORDER.indexOf(a.likelihood) - SURF_LIKELIHOOD_ORDER.indexOf(b.likelihood)
      ),
    [province]
  );

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Surf topics" className="scroll-tabs gap-2">
        {SURF_SECTIONS.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={tab === s.id}
            onClick={() => setTab(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === s.id
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-muted hover:border-brand"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">{SURF_SECTIONS.find((s) => s.id === tab)?.blurb}</p>

      {tab === "different" && (
        <div className="space-y-2">
          {SURF_DIFFERENCES.map((d) => (
            <div key={d.heading} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-bold text-brand-dark">{d.heading}</p>
              <p className="mt-1 text-sm">{d.body}</p>
            </div>
          ))}
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Fishing from a wharf instead?{" "}
            <Link href="/saltwater" className="text-accent-dark underline">
              Saltwater
            </Link>{" "}
            covers that, and most of it still applies here.
          </p>
        </div>
      )}

      {tab === "reading" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {BEACH_FEATURES.map((f) => (
              <div key={f.name} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-brand-dark">{f.name}</p>
                <p className="mt-1 text-sm">
                  <span className="text-muted">Looks like:</span> {f.looks}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-muted">What it is:</span> {f.why}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-muted">Fishing it:</span> {f.fish}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-brand bg-brand-light p-4">
            <p className="mb-2 font-bold text-brand">How to actually do it</p>
            <ol className="ml-4 list-decimal space-y-1.5 text-sm">
              {READING_STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {tab === "tide" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {SURF_TIDE_WINDOWS.map((w) => (
              <div key={w.window} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-brand-dark">{w.window}</p>
                <p className="mt-1 text-sm">{w.what}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <ul className="ml-4 list-disc space-y-1.5 text-sm">
              {SURF_TIDE_NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              <Link href="/tides" className="text-accent-dark underline">
                Tides
              </Link>{" "}
              has live predictions and the 24-hour curve for any Canadian station.
            </p>
          </div>
        </div>
      )}

      {tab === "conditions" && (
        <div className="space-y-2">
          {SURF_CONDITIONS.map((c) => (
            <div key={c.condition} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-bold text-brand-dark">{c.condition}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    VERDICT_STYLE[c.verdict] ?? "bg-border text-muted"
                  }`}
                >
                  {c.verdict}
                </span>
              </div>
              <p className="mt-1 text-sm">{c.detail}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "gear" && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-brand-light text-brand">
              <tr>
                <th className="px-3 py-2 text-left"></th>
                <th className="px-3 py-2 text-left">Spinning</th>
                <th className="px-3 py-2 text-left">Fly</th>
              </tr>
            </thead>
            <tbody>
              {SURF_GEAR.map((g) => (
                <tr key={g.item} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-semibold text-brand-dark">{g.item}</td>
                  <td className="px-3 py-2">{g.spin}</td>
                  <td className="px-3 py-2">{g.fly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "rigs" && (
        <div className="space-y-2">
          {SURF_RIGS.map((r) => (
            <div key={r.name} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-bold text-brand-dark">{r.name}</p>
              <p className="mt-1 text-sm">{r.what}</p>
              <p className="mt-1 text-sm">
                <span className="text-muted">When:</span> {r.when}
              </p>
            </div>
          ))}
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            <Link href="/matcher?water=salt" className="text-accent-dark underline">
              What to Throw
            </Link>{" "}
            will tell you which of these you already own, and{" "}
            <Link href="/lures" className="text-accent-dark underline">
              Making Lures
            </Link>{" "}
            covers pouring your own jig heads.
          </p>
        </div>
      )}

      {tab === "targets" && (
        <div className="space-y-3">
          <div className="max-w-xs">
            <FilterSelect
              label="Province"
              value={province}
              onChange={setProvince}
              options={[
                { value: "all" as const, label: "All provinces" },
                ...PROVINCES.map((p) => ({ value: p, label: p })),
              ]}
            />
          </div>

          <div className="space-y-2">
            {targets.map((t) => (
              <div key={t.slug} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  {known.has(t.slug) ? (
                    <Link
                      href={`/species/${t.slug}`}
                      className="font-bold text-accent-dark underline"
                    >
                      {t.name}
                    </Link>
                  ) : (
                    <span className="font-bold text-brand-dark">{t.name}</span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      LIKELIHOOD_STYLE[t.likelihood] ?? "bg-border text-muted"
                    }`}
                  >
                    {t.likelihood}
                  </span>
                  <span className="text-xs text-muted">{t.regions.join(" · ")}</span>
                </div>
                <p className="mt-1 text-sm">
                  <span className="text-muted">When:</span> {t.season}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-muted">Where:</span> {t.where}
                </p>
                <p className="mt-1 text-sm">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "safety" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-danger bg-danger-light p-4">
            <p className="font-bold text-danger">This one isn&apos;t a formality</p>
            <p className="mt-1 text-sm">
              The reading section spends a page telling you to find cuts, because that&apos;s
              where the fish are. A cut is a rip current. Both things are true at once, and
              anyone teaching the first owes you the second.
            </p>
          </div>
          {SURF_HAZARDS.map((h) => (
            <div key={h.hazard} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-bold text-brand-dark">{h.hazard}</p>
              <p className="mt-1 text-sm">{h.detail}</p>
              <p className="mt-1.5 rounded-lg border border-accent bg-accent-light p-2.5 text-sm">
                <span className="font-semibold text-accent-dark">What to do: </span>
                {h.what}
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">Access and etiquette</p>
            <ul className="ml-4 list-disc space-y-1.5 text-sm">
              {ACCESS_NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            The full cold-water sequence, the equipment the law requires and the float plan are
            in{" "}
            <Link href="/safety" className="text-accent-dark underline">
              Safety
            </Link>
            .
          </p>
        </div>
      )}

      <p className="rounded-xl border border-border bg-surface p-4 text-xs text-muted">
        {SURF_CAVEAT}
      </p>
    </div>
  );
}
