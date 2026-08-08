import Link from "next/link";
import { getOwnedGear } from "@/lib/owned";
import {
  MATCHER_CAVEAT,
  METHOD_LABEL,
  NOT_LURE_FISHERIES,
  forSpecies,
  matchOwned,
  type Recommendation,
} from "@/lib/matcher";
import type { OwnedGearItem } from "@/lib/owned";

// The matcher's answer for one fish, on that fish's own guide page.
//
// Sits above the regulations because it's what you came for. Kept to the shortlist rather
// than the whole set — the full thing with filters lives at /matcher, and repeating it here
// would push the regulations off the bottom of the page.
export async function WhatToThrow({ speciesSlug, speciesName }: { speciesSlug: string; speciesName: string }) {
  const recs = forSpecies(speciesSlug);
  if (recs.length === 0) return null;

  const owned = await getOwnedGear();
  const isOwned = (r: Recommendation) => matchOwned(owned, r).length > 0;

  // Owned first, then the rest in editorial order. Capped at six so the section stays a
  // shortlist; the count line says how many were left out.
  const ordered = [...recs].sort((a, b) => Number(isOwned(b)) - Number(isOwned(a)));
  const shown = ordered.slice(0, 6);
  const ownedCount = recs.filter(isOwned).length;

  return (
    <section className="mb-8">
      <h2 className="mb-3 border-b border-border pb-2 text-xl font-bold text-brand-dark">
        What to Throw
      </h2>

      {NOT_LURE_FISHERIES[speciesSlug] && (
        <div className="mb-3 rounded-xl border border-accent bg-accent-light p-3">
          <p className="text-sm">{NOT_LURE_FISHERIES[speciesSlug]}</p>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((r) => {
          const mine = matchOwned(owned, r);
          return (
            <div
              key={`${r.name}-${r.method}`}
              className={`rounded-xl border bg-surface p-3 ${mine.length > 0 ? "border-brand" : "border-border"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-brand-dark">{r.name}</h3>
                <span className="text-xs text-muted">
                  {METHOD_LABEL[r.method]}
                  {r.sizes ? ` · ${r.sizes}` : ""}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-accent-dark">{r.when}</p>
              <p className="mt-1 text-sm">{r.note}</p>
              {r.namedWaters && r.namedWaters.length > 0 && (
                <p className="mt-1.5 text-xs text-muted">
                  <span className="font-semibold uppercase tracking-wide">Reported on</span>{" "}
                  {r.namedWaters.join(" · ")}
                </p>
              )}
              {mine.length > 0 && (
                <p className="mt-1.5 text-xs font-semibold text-brand">
                  ✓ You own {mine.map((i: OwnedGearItem) => i.name).join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-muted">
        {owned.length > 0 && (
          <>
            You own {ownedCount} of the {recs.length}.{" "}
          </>
        )}
        {recs.length > shown.length && <>{recs.length - shown.length} more, plus filters by water and province, </>}
        <Link href="/matcher" className="text-accent-dark underline">
          in What to Throw
        </Link>
        .
      </p>
      <p className="mt-1 text-xs text-muted">{MATCHER_CAVEAT}</p>
      <span className="sr-only">Recommendations for {speciesName}.</span>
    </section>
  );
}
