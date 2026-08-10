"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { forSpecies } from "@/lib/matcher";
import type { TackleItem } from "@/types/tackle";

interface SuggestFor {
  slug: string;
  name: string;
}

// Reuses the same `packed` flag from the Tackle Box's pack list — checking something
// off here checks it off there too, and vice versa, since it's the same trip.
//
// `suggestFor` is species with no tagged gear at all: rather than a dead-end telling you
// to go tag something, it shows the Matcher's own curated recommendations for that
// species — clearly labelled as suggestions, not inventory, and not checkable, since
// they aren't things you've confirmed you own.
export function TripChecklist({ items: initialItems, suggestFor = [] }: { items: TackleItem[]; suggestFor?: SuggestFor[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(initialItems);

  async function toggle(item: TackleItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    const { error } = await supabase.from("tackle_items").update({ packed: !item.packed }).eq("id", item.id);
    if (error) {
      // Roll back the optimistic update so the checkbox doesn't silently drift from the DB.
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: item.packed } : i)));
    }
  }

  const suggestions = suggestFor
    .map((s) => ({ species: s, recs: forSpecies(s.slug).slice(0, 4) }))
    .filter((s) => s.recs.length > 0);

  if (items.length === 0 && suggestions.length === 0) {
    return <p className="text-sm text-muted">No gear tagged for these species yet — tag some in your Tackle Box.</p>;
  }

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.packed} onChange={() => toggle(item)} className="no-print" />
              <span data-print-only>{item.packed ? "☑" : "☐"}</span>
              <span className={item.packed ? "line-through text-muted" : ""}>
                {item.name}
                {item.quantity !== 1 ? ` ×${item.quantity}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      {suggestions.map(({ species, recs }) => (
        <div key={species.slug} className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Suggested for {species.name} — nothing tagged yet
          </p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {recs.map((r) => (
              <li key={r.name}>
                <span className="font-medium">{r.name}</span>
                {r.sizes && <span className="text-muted"> ({r.sizes})</span>}
                <span className="text-muted"> — {r.when}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
