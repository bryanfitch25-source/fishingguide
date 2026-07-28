"use client";

import { useMemo, useState } from "react";
import type { Province, Species, SpeciesCategory } from "@/types/content";
import { SpeciesCard } from "./SpeciesCard";

const PROVINCES: Province[] = ["NB", "NS", "PEI"];
const CATEGORIES: { value: SpeciesCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "freshwater", label: "Freshwater" },
  { value: "saltwater", label: "Saltwater" },
  { value: "anadromous", label: "Anadromous" },
];

export function SpeciesFilterGrid({ species }: { species: Species[] }) {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<Province | "all">("all");
  const [category, setCategory] = useState<SpeciesCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return species.filter((s) => {
      if (province !== "all" && !s.provinces.includes(province)) return false;
      if (category !== "all" && s.category !== category) return false;
      if (q && !`${s.common_name} ${s.scientific_name ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [species, query, province, category]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search species (e.g. mackerel, trout, bass)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value as Province | "all")}
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
        >
          <option value="all">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
              category === c.value
                ? "bg-brand text-white border-brand"
                : "border-border hover:border-brand hover:text-brand"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted mb-4">
        {filtered.length} species{filtered.length !== species.length ? ` of ${species.length}` : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted text-sm mt-8 text-center">No species match those filters.</p>
      )}
    </div>
  );
}
