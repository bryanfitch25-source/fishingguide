"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  KIND_LABEL,
  MATCHER_CAVEAT,
  METHOD_LABEL,
  NOT_LURE_FISHERIES,
  OWNED_CAVEAT,
  RECOMMENDATIONS,
  WATER_LABEL,
  allGear,
  allNamedWaters,
  forSpecies,
  matchOwned,
  type Method,
  type Recommendation,
  type WaterType,
} from "@/lib/matcher";
import type { OwnedGearItem } from "@/lib/owned";
import type { Province } from "@/types/content";

type Tab = "species" | "gear" | "waters";

const TABS: { id: Tab; label: string }[] = [
  { id: "species", label: "By fish" },
  { id: "gear", label: "By lure & fly" },
  { id: "waters", label: "By water" },
];

const METHODS: Method[] = ["spin", "fly", "bait"];
const WATERS: WaterType[] = ["salt", "estuary", "river", "lake"];
const PROVINCES: Province[] = ["NB", "NS", "PEI"];

interface Props {
  species: { slug: string; common_name: string }[];
  owned: OwnedGearItem[];
  /** Seeded from ?method= / ?water= so the home screen's lenses survive the tap through. */
  initialMethod?: Method;
  initialWater?: WaterType;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "bg-guide text-on-brand"
          : "border border-border bg-surface text-muted hover:border-guide"
      }`}
    >
      {children}
    </button>
  );
}

export function MatcherClient({ species, owned, initialMethod, initialWater }: Props) {
  const [tab, setTab] = useState<Tab>("species");
  // Striped bass by default rather than whatever sorts first: it's the fish most people
  // opening this app are going out for, and it has the fullest set of entries.
  const [slug, setSlug] = useState("striped-bass");
  const [method, setMethod] = useState<Method | "all">(initialMethod ?? "all");
  const [water, setWater] = useState<WaterType | "all">(initialWater ?? "all");
  const [province, setProvince] = useState<Province | "all">("all");
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [gearSearch, setGearSearch] = useState("");

  const nameOf = useMemo(() => {
    const m = new Map(species.map((s) => [s.slug, s.common_name]));
    // Falls back to the slug read as words. The recommendations are compiled into the
    // bundle while the species names come from the database, so the two can be out of
    // step — a slug rendered as "Striped bass" beats rendering "striped-bass".
    return (s: string) =>
      m.get(s) ?? s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
  }, [species]);

  const passesFilters = useMemo(() => {
    return (r: Recommendation) => {
      if (method !== "all" && r.method !== method) return false;
      if (water !== "all" && !r.waters.includes(water)) return false;
      if (province !== "all" && !r.regions.includes(province)) return false;
      if (ownedOnly && matchOwned(owned, r).length === 0) return false;
      return true;
    };
  }, [method, water, province, ownedOnly, owned]);

  const anyFilter = method !== "all" || water !== "all" || province !== "all" || ownedOnly;

  // Recommendations for the selected fish: owned things first, because the question this
  // screen exists to answer is "what have I got that will work", not "what could I buy".
  const speciesRecs = useMemo(() => {
    const all = forSpecies(slug);
    const shown = all.filter(passesFilters);
    return {
      all,
      shown: [...shown].sort((a, b) => {
        const aOwned = matchOwned(owned, a).length > 0 ? 0 : 1;
        const bOwned = matchOwned(owned, b).length > 0 ? 0 : 1;
        return aOwned - bOwned;
      }),
      ownedCount: all.filter((r) => matchOwned(owned, r).length > 0).length,
    };
  }, [slug, passesFilters, owned]);

  const gearRows = useMemo(() => {
    const q = gearSearch.trim().toLowerCase();
    return allGear()
      .map((g) => ({ ...g, recommendations: g.recommendations.filter(passesFilters) }))
      .filter((g) => g.recommendations.length > 0)
      .filter((g) => !q || g.name.toLowerCase().includes(q) || g.species.some((s) => nameOf(s).toLowerCase().includes(q)));
  }, [gearSearch, passesFilters, nameOf]);

  const waterRows = useMemo(() => {
    if (province === "all") return allNamedWaters();
    return allNamedWaters().filter((w) => w.regions.includes(province));
  }, [province]);

  // Driven by the recommendations rather than by the species list, so the picker is never
  // empty even if the species query came back short, and never offers a fish the matcher
  // has nothing to say about.
  const speciesWithRecs = useMemo(() => {
    const slugs = [...new Set(RECOMMENDATIONS.map((r) => r.speciesSlug))];
    return slugs
      .map((s) => ({ slug: s, common_name: nameOf(s) }))
      .sort((a, b) => a.common_name.localeCompare(b.common_name));
  }, [nameOf]);

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Matcher views" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-guide text-on-brand"
                : "border border-border bg-surface text-muted hover:border-guide"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters. Hidden on the waters tab, where only the province one applies. */}
      <div className="rounded-xl border border-border bg-surface p-3 space-y-2.5">
        {tab !== "waters" && (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted">Method</span>
              <Chip active={method === "all"} onClick={() => setMethod("all")}>
                Any
              </Chip>
              {METHODS.map((m) => (
                <Chip key={m} active={method === m} onClick={() => setMethod(method === m ? "all" : m)}>
                  {METHOD_LABEL[m]}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted">Water</span>
              <Chip active={water === "all"} onClick={() => setWater("all")}>
                Any
              </Chip>
              {WATERS.map((w) => (
                <Chip key={w} active={water === w} onClick={() => setWater(water === w ? "all" : w)}>
                  {WATER_LABEL[w]}
                </Chip>
              ))}
            </div>
          </>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted">Province</span>
          <Chip active={province === "all"} onClick={() => setProvince("all")}>
            All
          </Chip>
          {PROVINCES.map((p) => (
            <Chip key={p} active={province === p} onClick={() => setProvince(province === p ? "all" : p)}>
              {p}
            </Chip>
          ))}
        </div>
        {tab !== "waters" && owned.length > 0 && (
          <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-xs font-medium text-muted">
            <input
              type="checkbox"
              checked={ownedOnly}
              onChange={(e) => setOwnedOnly(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-guide)]"
            />
            Only show what I already own
          </label>
        )}
      </div>

      {tab === "species" && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Fish</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
            >
              {speciesWithRecs.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.common_name}
                </option>
              ))}
            </select>
          </label>

          {NOT_LURE_FISHERIES[slug] && (
            <div className="rounded-xl border border-accent bg-accent-light p-4">
              <p className="text-sm font-bold text-accent-dark">Not really a lure fishery</p>
              <p className="mt-1 text-sm">{NOT_LURE_FISHERIES[slug]}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-sm">
              <span className="font-bold text-brand-dark">
                {speciesRecs.all.length} {speciesRecs.all.length === 1 ? "thing" : "things"}
              </span>{" "}
              that work for {nameOf(slug).toLowerCase()}
              {owned.length > 0 && (
                <>
                  {" — you own "}
                  <span className="font-bold text-brand-dark">
                    {speciesRecs.ownedCount} of {speciesRecs.all.length}
                  </span>
                </>
              )}
              .
            </p>
            {anyFilter && speciesRecs.shown.length !== speciesRecs.all.length && (
              <p className="mt-1 text-xs text-muted">
                Showing {speciesRecs.shown.length} with the current filters.
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              <Link href={`/species/${slug}`} className="text-accent-dark underline">
                Full {nameOf(slug).toLowerCase()} guide
              </Link>
            </p>
          </div>

          {speciesRecs.shown.length === 0 && (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
              Nothing matches those filters for this fish.
            </p>
          )}

          <div className="space-y-2">
            {speciesRecs.shown.map((r) => (
              <RecCard key={`${r.speciesSlug}-${r.name}-${r.method}`} rec={r} owned={owned} />
            ))}
          </div>
        </div>
      )}

      {tab === "gear" && (
        <div className="space-y-3">
          <input
            value={gearSearch}
            onChange={(e) => setGearSearch(e.target.value)}
            placeholder="Search a lure, a fly, or a fish…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs text-muted">
              {gearRows.length} {gearRows.length === 1 ? "entry" : "entries"}, most versatile first.
              The ones near the top catch the most different fish here — a useful way to decide
              what to buy next.
            </p>
          </div>
          <div className="space-y-2">
            {gearRows.map((g) => {
              const mine = matchOwned(owned, g.recommendations[0]);
              return (
                <div key={g.name} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-brand-dark">{g.name}</h3>
                    {/* "Fly · Fly" and "Lure · Spinning" both say the same thing twice —
                        the kind alone carries it. */}
                    <span className="text-xs text-muted">{KIND_LABEL[g.kind]}</span>
                  </div>
                  {mine.length > 0 && (
                    <p className="mt-1 text-xs font-semibold text-brand">
                      ✓ In your boxes: {mine.map((i) => i.name).join(", ")}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.recommendations.map((r) => (
                      <Link
                        key={r.speciesSlug}
                        href={`/species/${r.speciesSlug}`}
                        className="rounded-full bg-guide-light px-2.5 py-1 text-xs font-medium text-guide hover:underline"
                      >
                        {nameOf(r.speciesSlug)}
                      </Link>
                    ))}
                  </div>
                  {g.patternRef && (
                    <p className="mt-2 text-xs text-muted">
                      <Link
                        href={`/fly?pattern=${encodeURIComponent(g.patternRef)}`}
                        className="text-accent-dark underline"
                      >
                        Full entry for the {g.patternRef} in the Fly Box
                      </Link>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "waters" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-accent bg-accent-light p-4">
            <p className="text-sm font-bold text-accent-dark">Reports, not guarantees</p>
            <p className="mt-1 text-sm">
              Every water here is named in the species guides, and every one of them came from a
              forum post, a tourism page or a local report rather than from a survey. Fish move,
              access changes, and a spot that produced for someone in 2019 owes you nothing. Treat
              this as a list of places worth asking about.
            </p>
          </div>
          <p className="text-xs text-muted">
            {waterRows.length} named {waterRows.length === 1 ? "water" : "waters"}
            {province !== "all" && ` with ${province} fish`}.
          </p>
          <div className="space-y-2">
            {waterRows.map((w) => (
              <div key={w.water} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-brand-dark">{w.water}</h3>
                  <span className="text-xs text-muted">{w.regions.join(" · ")}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {w.species.map((s) => (
                    <Link
                      key={s}
                      href={`/species/${s}`}
                      className="rounded-full bg-guide-light px-2.5 py-1 text-xs font-medium text-guide hover:underline"
                    >
                      {nameOf(s)}
                    </Link>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted">{w.gear.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted">{MATCHER_CAVEAT}</p>
        {owned.length > 0 && <p className="mt-1.5 text-xs text-muted">{OWNED_CAVEAT}</p>}
      </div>
    </div>
  );
}

export function RecCard({ rec, owned }: { rec: Recommendation; owned: OwnedGearItem[] }) {
  const mine = matchOwned(owned, rec);
  return (
    <div
      className={`rounded-xl border bg-surface p-4 ${
        mine.length > 0 ? "border-brand" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold text-brand-dark">{rec.name}</h3>
        <span className="text-xs text-muted">
          {KIND_LABEL[rec.kind]}
          {rec.sizes ? ` · ${rec.sizes}` : ""}
        </span>
      </div>
      <p className="mt-0.5 text-sm font-medium text-accent-dark">{rec.when}</p>
      <p className="mt-1 text-sm">{rec.note}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {rec.waters.map((w) => (
          <span key={w} className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand">
            {WATER_LABEL[w]}
          </span>
        ))}
        {rec.regions.map((p) => (
          <span key={p} className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted">
            {p}
          </span>
        ))}
      </div>

      {rec.namedWaters && rec.namedWaters.length > 0 && (
        // Deliberately styled as the softer claim — dashed, muted, and labelled — so the
        // difference between "this works in estuaries" and "someone caught one here" is
        // visible without reading the caveat at the bottom of the page.
        <div className="mt-2 rounded-lg border border-dashed border-border p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Reported on
          </p>
          <p className="mt-0.5 text-xs text-muted">{rec.namedWaters.join(" · ")}</p>
        </div>
      )}

      {mine.length > 0 ? (
        <p className="mt-2 text-xs font-semibold text-brand">
          ✓ You own {mine.map((i) => i.name).join(", ")}
          <span className="font-normal text-muted">
            {" "}
            ({mine[0].discipline === "fly" ? "Fly Box" : "Tackle Box"})
          </span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">Not matched to anything in your boxes.</p>
      )}

      {rec.patternRef && (
        <p className="mt-1.5 text-xs">
          <Link
            href={`/fly?pattern=${encodeURIComponent(rec.patternRef)}`}
            className="text-accent-dark underline"
          >
            How it&apos;s dressed, and who tied it first
          </Link>
        </p>
      )}
    </div>
  );
}
