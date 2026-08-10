"use client";

import { useState } from "react";
import type { Catch } from "@/types/tackle";
import { moonPhase } from "@/lib/moonphase";
import {
  formatHeight,
  formatLength,
  formatPressure,
  formatSpeed,
  formatTemperature,
  formatWeight,
  type UnitSystem,
} from "@/lib/units";

// One catch, photo-led.
//
// The photo is the record — that's the whole reason this replaced a table row. But photo
// coverage is uneven: quick-logged catches often have none, and anything entered by hand
// before galleries shipped never will. A grid where half the tiles are empty grey boxes
// looks worse than the table did, so a catch without a photo gets a *designed* tile
// instead of a placeholder: the species glyph over a tint derived from the species name,
// with that night's moon in the corner. It reads as deliberate rather than missing.

// Deterministic tint per species, so the same fish is always the same colour and the
// grid has some variety without anything being random between renders.
const TINTS = [
  "from-brand-light to-surface",
  "from-accent-light to-surface",
  "from-catches-light to-surface",
  "from-guide-light to-surface",
];

function tintFor(slug: string | null): string {
  if (!slug) return TINTS[0];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

const SPECIES_GLYPH: Record<string, string> = {
  "atlantic-mackerel": "🐟",
  "striped-bass": "🐟",
  "atlantic-salmon": "🐟",
  "brook-trout": "🎣",
  "rainbow-trout": "🎣",
  "brown-trout": "🎣",
  "smallmouth-bass": "🐡",
  "largemouth-bass": "🐡",
  "atlantic-cod": "🐠",
  "winter-flounder": "🐡",
  "bluefin-tuna": "🐋",
  "american-eel": "🐍",
  "rainbow-smelt": "🐟",
};

function glyphFor(slug: string | null): string {
  return (slug && SPECIES_GLYPH[slug]) || "🐟";
}

export function CatchCard({
  c,
  speciesName,
  tackleName,
  isPersonalBest,
  units,
  onEdit,
  onDelete,
}: {
  c: Catch;
  speciesName: (slug: string | null) => string | null;
  tackleName: (id: string | null) => string | null;
  isPersonalBest: boolean;
  units: UnitSystem;
  /** Omit both to render read-only — used where a catch is shown outside the Catch Log itself. */
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const moon = moonPhase(c.catch_date);
  const name = speciesName(c.species_slug) ?? "Unidentified";

  const size = [
    c.length_cm != null ? formatLength(c.length_cm, units) : c.length_desc,
    c.weight_kg != null ? formatWeight(c.weight_kg, units) : c.weight_desc,
  ]
    .filter(Boolean)
    .join(" · ");

  // Only the conditions that were actually captured — a row of em dashes would suggest
  // the data is missing rather than that it was never recorded.
  const conditions: [string, string][] = [];
  if (c.tide_state) {
    const arrow = c.tide_state === "rising" ? "↑" : c.tide_state === "falling" ? "↓" : "—";
    // Capitalised here rather than with a `capitalize` class: that class title-cases every
    // word in the cell, which turned "1.21 m" into "1.21 M" and "Pointe-du-Chêne" into
    // "Pointe-Du-Chêne" once the other conditions shared the same style.
    const state = c.tide_state[0].toUpperCase() + c.tide_state.slice(1);
    conditions.push([
      "Tide",
      `${arrow} ${state}${c.tide_height_m != null ? ` ${formatHeight(c.tide_height_m, units)}` : ""}`,
    ]);
  }
  if (c.weather_condition) conditions.push(["Weather", c.weather_condition]);
  if (c.temperature_c != null) conditions.push(["Air", formatTemperature(c.temperature_c, units)]);
  if (c.wind_kmh != null) conditions.push(["Wind", formatSpeed(c.wind_kmh, units)]);
  if (c.pressure_kpa != null) conditions.push(["Pressure", formatPressure(c.pressure_kpa, units)]);
  if (c.tide_station_name) conditions.push(["Station", c.tide_station_name]);

  const dateLabel = new Date(`${c.catch_date}T12:00:00`).toLocaleDateString("en-CA", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = c.caught_at
    ? new Date(c.caught_at).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <article className="card-lift overflow-hidden rounded-xl border border-border bg-surface print-clean">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="block w-full text-left"
      >
        <div className="relative">
          {c.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
            <img src={c.photo_url} alt="" className="h-36 w-full object-cover sm:h-44" />
          ) : (
            <div
              className={`flex h-36 w-full items-center justify-center bg-gradient-to-br text-5xl sm:h-44 ${tintFor(
                c.species_slug
              )}`}
              aria-hidden
            >
              {glyphFor(c.species_slug)}
            </div>
          )}

          {isPersonalBest && (
            <span
              className="absolute left-2 top-2 rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-bold text-accent-dark"
              title="Personal best for this species"
            >
              🏆 PB
            </span>
          )}
          <span
            className="absolute right-2 top-2 rounded-full bg-surface/85 px-1.5 py-0.5 text-sm"
            title={`${moon.name} on the night of this catch`}
          >
            {moon.emoji}
          </span>
          {c.extra_photo_urls.length > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-surface/85 px-2 py-0.5 text-[10px] font-semibold text-muted">
              +{c.extra_photo_urls.length}
            </span>
          )}
        </div>

        <div className="p-3">
          <p className="flex items-baseline justify-between gap-2 font-bold text-brand-dark">
            <span className="min-w-0 truncate">{name}</span>
            <span className="shrink-0 text-[11px] font-medium text-muted">
              {c.kept ? "Kept" : "Released"}
            </span>
          </p>
          {size && <p className="text-sm tabular-nums text-muted">{size}</p>}
          <p className="mt-0.5 text-xs text-muted">
            {dateLabel}
            {timeLabel && ` · ${timeLabel}`}
            {c.location && ` · ${c.location}`}
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-3 text-sm">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {tackleName(c.tackle_item_id) && (
              <div className="col-span-2">
                <dt className="text-[11px] text-muted">Tackle</dt>
                <dd className="font-medium">{tackleName(c.tackle_item_id)}</dd>
              </div>
            )}
            {conditions.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-muted">{label}</dt>
                <dd className="font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          {conditions.length === 0 && (
            <p className="text-muted">
              No conditions were recorded with this catch — the 🎣 quick-log button captures
              them automatically.
            </p>
          )}

          {c.notes && <p className="mt-2 border-t border-border pt-2">{c.notes}</p>}

          <div className="mt-3 flex items-center gap-4 text-sm no-print">
            {onEdit && (
              <button onClick={onEdit} className="font-medium text-brand hover:underline">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="font-medium text-danger hover:underline">
                Delete
              </button>
            )}
            {c.lat !== null && c.lng !== null && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=14/${c.lat}/${c.lng}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-muted hover:text-brand"
              >
                📍 Map
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
