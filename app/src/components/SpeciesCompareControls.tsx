"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Species } from "@/types/content";

const MAX_COMPARE = 4;

export function SpeciesCompareControls({ species, selected }: { species: Species[]; selected: string[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(selected);
  const [query, setQuery] = useState("");

  const filtered = species.filter((s) => s.common_name.toLowerCase().includes(query.toLowerCase()));

  function toggle(slug: string) {
    setPicked((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < MAX_COMPARE ? [...prev, slug] : prev
    );
  }

  function applySelection() {
    router.push(picked.length ? `/species/compare?slugs=${picked.join(",")}` : "/species/compare");
  }

  return (
    <div className="no-print mb-6 rounded-xl border border-border bg-surface card-lift p-4">
      <p className="text-sm font-medium mb-2">Pick up to {MAX_COMPARE} species to compare</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search species…"
        className="w-full mb-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
        {filtered.map((s) => (
          <label key={s.slug} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={picked.includes(s.slug)}
              onChange={() => toggle(s.slug)}
              disabled={!picked.includes(s.slug) && picked.length >= MAX_COMPARE}
            />
            {s.common_name}
          </label>
        ))}
      </div>
      <button
        onClick={applySelection}
        className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
      >
        Compare ({picked.length})
      </button>
    </div>
  );
}
