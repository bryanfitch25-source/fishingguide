"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ACCESS_RULES,
  CARE_STEPS,
  DIFFERENCES,
  DIFFICULTY_ORDER,
  GEAR_COMPARISON,
  SALTWATER_CAVEAT,
  SALT_SECTIONS,
  SALT_TARGETS,
  SPOT_TYPES,
  TIDE_NOTES,
  TIDE_WINDOWS,
  type SaltTopic,
} from "@/lib/saltwater";
import { SALT_CARE_NOTE } from "@/lib/water-type";
import { FilterSelect } from "@/components/FilterDisclosure";
import type { Province } from "@/types/content";

const PROVINCES: Province[] = ["NB", "NS", "PEI"];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-success-light text-success",
  Reliable: "bg-brand-light text-brand",
  "Work for it": "bg-accent-light text-accent-dark",
  Charter: "bg-guide-light text-guide",
};

export function SaltwaterClient({
  species,
}: {
  species: { slug: string; common_name: string }[];
}) {
  const [tab, setTab] = useState<SaltTopic>("different");
  const [province, setProvince] = useState<Province | "all">("all");

  const known = useMemo(() => new Set(species.map((s) => s.slug)), [species]);

  const targets = useMemo(
    () =>
      SALT_TARGETS.filter((t) => province === "all" || t.regions.includes(province)).sort(
        (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty)
      ),
    [province]
  );

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Saltwater topics" className="scroll-tabs gap-2">
        {SALT_SECTIONS.map((s) => (
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

      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-sm text-muted">{SALT_SECTIONS.find((s) => s.id === tab)?.blurb}</p>
      </div>

      {tab === "different" && (
        <div className="space-y-2">
          {DIFFERENCES.map((d) => (
            <div key={d.heading} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-bold text-brand-dark">{d.heading}</h3>
              <p className="mt-1 text-sm">{d.body}</p>
            </div>
          ))}
          <div className="rounded-xl border border-danger bg-danger-light p-4 text-danger">
            <p className="font-bold">Cold water is the real hazard</p>
            <p className="mt-1 text-sm">
              Everything above assumes you get home. The{" "}
              <Link href="/safety" className="underline">
                Safety section
              </Link>{" "}
              covers what the water is doing today, what you are legally required to carry, and
              what to say on channel 16.
            </p>
          </div>
        </div>
      )}

      {tab === "tide" && (
        <div className="space-y-2">
          {TIDE_WINDOWS.map((w) => (
            <div key={w.window} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold text-brand-dark">{w.window}</h3>
                <span className="text-xs font-medium text-accent-dark">{w.what}</span>
              </div>
              <p className="mt-1 text-sm">{w.why}</p>
            </div>
          ))}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 text-sm font-semibold text-brand-dark">Worth knowing</p>
            <ul className="space-y-1.5 text-sm">
              {TIDE_NOTES.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    ▸
                  </span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted">
            Today&apos;s heights and the 7-day forecast for your station are on{" "}
            <Link href="/tides" className="text-accent-dark underline">
              Tides
            </Link>
            .
          </p>
        </div>
      )}

      {tab === "where" && (
        <div className="space-y-2">
          {SPOT_TYPES.map((s) => (
            <div key={s.kind} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-bold text-brand-dark">{s.kind}</h3>
              <p className="mt-1 text-sm">{s.read}</p>
              <p className="mt-1.5 text-xs text-muted">{s.fish}</p>
            </div>
          ))}
          <p className="text-sm text-muted">
            Named spots for each species live on their guide pages and in{" "}
            <Link href="/matcher" className="text-accent-dark underline">
              What to Throw
            </Link>
            , marked as local reports rather than guarantees.
          </p>
        </div>
      )}

      {tab === "gear" && (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-brand-light text-brand">
                <tr>
                  <th className="px-3 py-2 text-left"> </th>
                  <th className="px-3 py-2 text-left">Spinning</th>
                  <th className="px-3 py-2 text-left">Fly</th>
                </tr>
              </thead>
              <tbody>
                {GEAR_COMPARISON.map((g) => (
                  <tr key={g.item} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-semibold text-brand-dark whitespace-nowrap">{g.item}</td>
                    <td className="px-3 py-2">{g.spin}</td>
                    <td className="px-3 py-2">{g.fly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Tag what you own as salt, fresh or both in your{" "}
            <Link href="/tackle" className="text-accent-dark underline">
              Tackle Box
            </Link>{" "}
            and{" "}
            <Link href="/fly" className="text-accent-dark underline">
              Fly Box
            </Link>{" "}
            and each box gains a water filter — useful when you&apos;re packing at 5am.
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
          <p className="text-xs text-muted">
            Ordered by how likely you are to actually catch one, not by prestige. A saltwater
            guide that leads with bluefin is written for the author.
          </p>
          <div className="space-y-2">
            {targets.map((t) => (
              <div key={t.slug} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-brand-dark">
                    {known.has(t.slug) ? (
                      <Link href={`/species/${t.slug}`} className="hover:underline">
                        {t.name}
                      </Link>
                    ) : (
                      t.name
                    )}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      DIFFICULTY_STYLE[t.difficulty] ?? "bg-brand-light text-brand"
                    }`}
                  >
                    {t.difficulty}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-accent-dark">{t.season}</p>
                <p className="mt-1 text-sm">{t.note}</p>
                <p className="mt-1.5 text-xs text-muted">{t.where}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "access" && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <ul className="space-y-2 text-sm">
            {ACCESS_RULES.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="text-brand">
                  ▸
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "care" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-accent bg-accent-light p-4">
            <p className="text-sm">{SALT_CARE_NOTE}</p>
          </div>
          {CARE_STEPS.map((c, i) => (
            <div key={c.step} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-bold text-brand-dark">
                <span className="text-muted">{i + 1}.</span> {c.step}
              </h3>
              <p className="mt-1 text-sm">{c.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted">{SALTWATER_CAVEAT}</p>
      </div>
    </div>
  );
}
