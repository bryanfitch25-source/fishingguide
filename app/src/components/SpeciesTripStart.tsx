"use client";

import { useState } from "react";
import { SEASONALITY } from "@/lib/seasonality";
import { allNamedWaters } from "@/lib/matcher";
import type { Species } from "@/types/content";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// The other way into planning a trip: start from what you want to catch instead of
// where you're going. allNamedWaters() only has place *names* ("Northumberland Strait",
// "the Miramichi estuary"), not coordinates — it's editorial content built for the
// Matcher, not a gazetteer — so this can only point at a region and hand off to the same
// search-based TripLocationPicker for an actual pin, rather than placing one itself.
export function SpeciesTripStart({
  species,
  onContinue,
  onCancel,
}: {
  species: Species[];
  onContinue: (slug: string) => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState("");
  const chosen = species.find((s) => s.slug === slug) ?? null;
  const seasonality = slug ? SEASONALITY[slug] : undefined;
  const waters = slug ? allNamedWaters().filter((w) => w.species.includes(slug)) : [];

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div>
        <label className="block text-sm font-medium mb-1">Which species?</label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">— Pick a species —</option>
          {[...species]
            .sort((a, b) => a.common_name.localeCompare(b.common_name))
            .map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.common_name}
              </option>
            ))}
        </select>
      </div>

      {chosen && (
        <div className="space-y-3">
          {seasonality && seasonality.months.length > 0 ? (
            <p className="text-sm">
              <span className="font-semibold">Best months:</span>{" "}
              {seasonality.months.map((m) => MONTH_NAMES[m - 1]).join(", ")}
              {seasonality.note && <span className="text-muted"> — {seasonality.note}</span>}
            </p>
          ) : (
            <p className="text-sm text-muted">No seasonal timing on file for this one yet.</p>
          )}

          {waters.length > 0 ? (
            <div>
              <p className="mb-1 text-sm font-semibold">Known waters</p>
              <ul className="space-y-1 text-sm">
                {waters.map((w) => (
                  <li key={w.water}>
                    <span className="font-medium">{w.water}</span>{" "}
                    <span className="text-muted">({w.regions.join(", ")})</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-muted">
                Named from what&apos;s known to work there, not an exact spot — search for
                somewhere specific in that area on the next step.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No named waters on file for this species yet — you&apos;ll pick a location directly.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onContinue(slug)}
              className="rounded-lg bg-brand text-on-brand font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!chosen && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-muted hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
