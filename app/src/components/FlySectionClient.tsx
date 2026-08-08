"use client";

import { useState } from "react";
import { TackleBoxClient, type BoxLabels } from "./TackleBoxClient";
import { FlyReference } from "./FlyReference";
import { FLY_CATEGORIES } from "@/lib/fly";
import type { TackleCategory } from "@/types/tackle";

// The Fly Box and its reference, behind one switch.
//
// The box itself is TackleBoxClient with a different discipline and a different category
// list — the same create/edit/photograph/warranty/storage machinery, pointed at rows the
// Tackle Box will never see. What is genuinely new is the reference beside it.

const FLY_LABELS: BoxLabels = {
  itemNoun: "Item",
  itemNounPlural: "items",
  addLabel: "+ Add Fly Gear",
  storageNoun: "Fly box",
  storageNounPlural: "Fly boxes",
  csvName: "fly-box.csv",
  namePlaceholder: "e.g. Green Machine",
};

const CATEGORIES = FLY_CATEGORIES.map((c) => ({
  value: c.value as unknown as TackleCategory,
  label: c.label,
}));

export function FlySectionClient({
  species,
  initialPattern = "",
}: {
  species: { slug: string; common_name: string }[];
  initialPattern?: string;
}) {
  // Arriving with ?pattern= means someone followed a link to a specific fly, so open on the
  // reference rather than making them find the tab first.
  const [view, setView] = useState<"box" | "reference">(initialPattern ? "reference" : "box");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            ["box", "🪶 My fly gear"],
            ["reference", "📖 Reference"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              view === id
                ? "bg-guide text-on-brand"
                : "border border-border bg-surface text-muted hover:border-guide"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "box" ? (
        <TackleBoxClient
          species={species}
          discipline="fly"
          categories={CATEGORIES}
          labels={FLY_LABELS}
        />
      ) : (
        <FlyReference initialPattern={initialPattern} />
      )}
    </div>
  );
}
