// What each kind of tackle actually needs recorded.
//
// The form used to be one shape for everything, with a single "Color / Size" box doing
// the work for all nine categories. That box means "1/2 oz, chartreuse" on a jig, "20 lb"
// on a line, "6'6\" MH" on a rod and nothing at all on a landing net — so everything
// beyond the first attribute went into free-text Notes, where it can't be filtered,
// sorted, or shown on a tile.
//
// Stored as a single `specs` jsonb column rather than forty sparse columns. Two reasons:
// this list will keep changing as gear does, and a jsonb column absorbs that without a
// migration each time; and forty mostly-null columns on a table where every row uses at
// most eight of them is a poor trade for one person's tackle box.
//
// Field ids are globally unique, not per-category, so switching a half-filled form from
// Rod to Reel and back doesn't quietly drop what was already typed.
//
// ---------------------------------------------------------------------------
// A note on units
// ---------------------------------------------------------------------------
// These deliberately ignore the app's metric/imperial toggle. A rod is a 6'6" medium-heavy
// whether or not you think in metres; 20 lb test, a 1/2 oz jig and a 5.4:1 gear ratio are
// the names manufacturers print on the product, not measurements the app took. Converting
// them would produce "1.98 m medium-heavy", which is not a thing anyone would recognise or
// search for. Real measurements the app records itself — a fish's length, the tide — still
// follow the toggle.

import type { TackleCategory } from "@/types/tackle";

export type SpecFieldType = "text" | "number" | "select" | "toggle";

export interface SpecField {
  id: string;
  label: string;
  type: SpecFieldType;
  /** Suffix shown inside the field, e.g. "oz" or "lb". */
  unit?: string;
  placeholder?: string;
  options?: string[];
  /** Sits on its own row rather than sharing the two-column grid. */
  wide?: boolean;
  /** Included in the one-line summary when set. Order follows this array. */
  summary?: boolean;
  hint?: string;
}

export interface CategorySpec {
  /** Heading for the category-specific block in the form. */
  title: string;
  /** One line under the heading, only where it earns its space. */
  blurb?: string;
  fields: SpecField[];
}

const ROD_POWERS = [
  "Ultralight",
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Heavy",
  "Heavy",
  "Extra-Heavy",
];

const ROD_ACTIONS = ["Slow", "Moderate", "Moderate-Fast", "Fast", "Extra-Fast"];

export const TACKLE_SPECS: Record<TackleCategory, CategorySpec> = {
  rod: {
    title: "Rod details",
    blurb: "Power is how much it takes to bend it; action is where along the blank it bends.",
    fields: [
      {
        id: "rod_type",
        label: "Type",
        type: "select",
        options: ["Spinning", "Casting", "Fly", "Surf", "Ice", "Trolling", "Telescopic"],
        summary: true,
      },
      { id: "rod_length", label: "Length", type: "text", placeholder: `6'6"`, summary: true },
      { id: "rod_power", label: "Power", type: "select", options: ROD_POWERS, summary: true },
      { id: "rod_action", label: "Action", type: "select", options: ROD_ACTIONS },
      { id: "rod_pieces", label: "Pieces", type: "select", options: ["1", "2", "3", "4+"] },
      {
        id: "rod_lure_range",
        label: "Lure weight range",
        type: "text",
        unit: "oz",
        placeholder: "1/4 – 3/4",
      },
      {
        id: "rod_line_range",
        label: "Line rating",
        type: "text",
        unit: "lb",
        placeholder: "8 – 17",
      },
      {
        id: "rod_handle",
        label: "Handle",
        type: "select",
        options: ["Cork", "EVA foam", "Split grip cork", "Split grip EVA", "Other"],
      },
    ],
  },

  reel: {
    title: "Reel details",
    fields: [
      {
        id: "reel_type",
        label: "Type",
        type: "select",
        options: ["Spinning", "Baitcasting", "Spincast", "Fly", "Conventional", "Ice"],
        summary: true,
      },
      {
        id: "reel_size",
        label: "Size",
        type: "text",
        placeholder: "2500",
        summary: true,
        hint: "Spinning reels use 1000–10000; fly reels use line weight.",
      },
      { id: "reel_gear_ratio", label: "Gear ratio", type: "text", placeholder: "6.2:1", summary: true },
      { id: "reel_max_drag", label: "Max drag", type: "number", unit: "lb", placeholder: "20" },
      { id: "reel_bearings", label: "Bearings", type: "text", placeholder: "9+1" },
      {
        id: "reel_hand",
        label: "Retrieve",
        type: "select",
        options: ["Left", "Right", "Reversible"],
      },
      {
        id: "reel_line_capacity",
        label: "Line capacity",
        type: "text",
        placeholder: "10 lb / 200 yd",
        wide: true,
      },
    ],
  },

  lure: {
    title: "Lure details",
    fields: [
      {
        id: "lure_type",
        label: "Type",
        type: "select",
        options: [
          "Crankbait",
          "Jerkbait",
          "Spinnerbait",
          "Inline spinner",
          "Spoon",
          "Jig",
          "Soft plastic",
          "Topwater",
          "Swimbait",
          "Buzzbait",
          "Fly",
          "Bucktail",
          "Tube",
          "Other",
        ],
        summary: true,
      },
      { id: "lure_weight", label: "Weight", type: "text", unit: "oz", placeholder: "1/2", summary: true },
      { id: "lure_colour", label: "Colour", type: "text", placeholder: "Chartreuse / white", summary: true },
      { id: "lure_length", label: "Length", type: "text", unit: "in", placeholder: "3.5" },
      {
        id: "lure_action",
        label: "Buoyancy",
        type: "select",
        options: ["Floating", "Sinking", "Suspending", "Slow sink", "Fast sink"],
      },
      {
        id: "lure_depth",
        label: "Dive depth",
        type: "text",
        unit: "ft",
        placeholder: "4 – 8",
        hint: "Crankbaits and divers only.",
      },
      { id: "lure_hook_size", label: "Hook size", type: "text", placeholder: "#4 treble" },
      { id: "lure_weedless", label: "Weedless", type: "toggle" },
    ],
  },

  line: {
    title: "Line details",
    fields: [
      {
        id: "line_type",
        label: "Type",
        type: "select",
        options: ["Monofilament", "Fluorocarbon", "Braid", "Copolymer", "Fly line", "Leader", "Wire"],
        summary: true,
      },
      { id: "line_test", label: "Test", type: "number", unit: "lb", placeholder: "20", summary: true },
      { id: "line_colour", label: "Colour", type: "text", placeholder: "Moss green", summary: true },
      { id: "line_diameter", label: "Diameter", type: "text", unit: "in", placeholder: "0.011" },
      { id: "line_length", label: "Spool length", type: "text", unit: "yd", placeholder: "300" },
      {
        id: "line_spooled_on",
        label: "Spooled on",
        type: "text",
        placeholder: "Which reel",
        hint: "Line goes off well before it looks worn — worth knowing when it went on.",
      },
    ],
  },

  terminal_tackle: {
    title: "Terminal tackle details",
    fields: [
      {
        id: "term_type",
        label: "Type",
        type: "select",
        options: [
          "Hook",
          "Treble hook",
          "Circle hook",
          "Jig head",
          "Swivel",
          "Snap",
          "Split ring",
          "Sinker",
          "Bobber / float",
          "Bead",
          "Leader",
          "Rig",
        ],
        summary: true,
      },
      { id: "term_size", label: "Size", type: "text", placeholder: "2/0", summary: true },
      { id: "term_weight", label: "Weight", type: "text", unit: "oz", placeholder: "1/4", summary: true },
      {
        id: "term_material",
        label: "Material / finish",
        type: "select",
        options: ["Bronze", "Nickel", "Black nickel", "Stainless", "Tungsten", "Lead", "Brass", "Other"],
      },
      { id: "term_count", label: "Per pack", type: "number", placeholder: "25" },
    ],
  },

  net: {
    title: "Net details",
    fields: [
      {
        id: "net_type",
        label: "Type",
        type: "select",
        options: ["Landing net", "Dip net", "Cast net", "Smelt net", "Bait net"],
        summary: true,
      },
      { id: "net_hoop", label: "Hoop size", type: "text", unit: "in", placeholder: "20 × 24", summary: true },
      { id: "net_handle", label: "Handle length", type: "text", unit: "in", placeholder: "36" },
      {
        id: "net_mesh",
        label: "Mesh",
        type: "select",
        options: ["Rubber", "Coated nylon", "Knotless nylon", "Monofilament"],
        summary: true,
        hint: "Rubber and knotless mesh do far less damage to a fish you intend to release.",
      },
      { id: "net_folding", label: "Folds / collapsible", type: "toggle" },
    ],
  },

  electronics: {
    title: "Electronics details",
    fields: [
      {
        id: "elec_type",
        label: "Type",
        type: "select",
        options: ["Fishfinder", "Chartplotter", "Combo", "GPS", "VHF radio", "Underwater camera", "Trolling motor"],
        summary: true,
      },
      { id: "elec_screen", label: "Screen", type: "text", unit: "in", placeholder: "7", summary: true },
      { id: "elec_transducer", label: "Transducer", type: "text", placeholder: "CHIRP / DownScan" },
      { id: "elec_power", label: "Power", type: "text", placeholder: "12 V / internal battery" },
      { id: "elec_year", label: "Year", type: "number", placeholder: "2024" },
    ],
  },

  apparel: {
    title: "Apparel details",
    fields: [
      {
        id: "app_type",
        label: "Type",
        type: "select",
        options: ["Waders", "Wading boots", "Rain jacket", "Bibs", "Gloves", "Hat", "PFD / life jacket", "Boots", "Layer"],
        summary: true,
      },
      { id: "app_size", label: "Size", type: "text", placeholder: "L / 10", summary: true },
      {
        id: "app_material",
        label: "Material",
        type: "select",
        options: ["Breathable / Gore-Tex", "Neoprene", "PVC / rubber", "Nylon", "Fleece", "Wool", "Other"],
        summary: true,
      },
      {
        id: "app_sole",
        label: "Sole",
        type: "select",
        options: ["Felt", "Rubber", "Studded rubber", "Studded felt", "N/A"],
        hint: "Felt soles are restricted in some provinces as a whirling-disease vector — check before you travel with them.",
      },
      { id: "app_waterproof", label: "Waterproof", type: "toggle" },
    ],
  },

  other: {
    title: "Other details",
    blurb: "Anything that doesn't fit a category above — pliers, scales, coolers, a chair.",
    fields: [
      { id: "other_kind", label: "What is it", type: "text", placeholder: "Pliers, scale, cooler…", summary: true },
      { id: "other_size", label: "Size / spec", type: "text", placeholder: "7 in", summary: true },
    ],
  },
};

export type SpecValues = Record<string, string | boolean>;

/** Every field id the schema knows about, used to drop stale keys on save. */
export const ALL_SPEC_IDS: ReadonlySet<string> = new Set(
  Object.values(TACKLE_SPECS).flatMap((c) => c.fields.map((f) => f.id))
);

export function fieldsFor(category: TackleCategory): SpecField[] {
  return TACKLE_SPECS[category]?.fields ?? [];
}

function displayValue(field: SpecField, raw: string | boolean): string | null {
  if (field.type === "toggle") return raw === true ? field.label : null;
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return null;
  return field.unit ? `${s} ${field.unit}` : s;
}

/**
 * The one-line description shown on list rows, tray tiles and in the CSV.
 *
 * This is what keeps the change from breaking everything that already reads
 * `color_size`. Rather than retiring that column and rewriting every consumer, it becomes
 * a derived summary: the fields marked `summary` for the item's category, joined. Existing
 * screens carry on working untouched and start showing better text than the free-form
 * string they had — "Crankbait · 1/2 oz · Chartreuse / white" instead of whatever was
 * typed once and never revisited.
 */
export function summarise(category: TackleCategory, specs: SpecValues | null | undefined): string {
  if (!specs) return "";
  const parts: string[] = [];
  for (const field of fieldsFor(category)) {
    if (!field.summary) continue;
    const v = displayValue(field, specs[field.id]);
    if (v) parts.push(v);
  }
  return parts.join(" · ");
}

/** Every populated field, in schema order — for the detail panel. */
export function describe(
  category: TackleCategory,
  specs: SpecValues | null | undefined
): { label: string; value: string }[] {
  if (!specs) return [];
  const out: { label: string; value: string }[] = [];
  for (const field of fieldsFor(category)) {
    const raw = specs[field.id];
    if (raw === undefined) continue;
    if (field.type === "toggle") {
      if (raw === true) out.push({ label: field.label, value: "Yes" });
      continue;
    }
    const s = typeof raw === "string" ? raw.trim() : "";
    if (!s) continue;
    out.push({ label: field.label, value: field.unit ? `${s} ${field.unit}` : s });
  }
  return out;
}

/**
 * Strips empties and anything not in the current schema before saving.
 *
 * Without the schema check, a field renamed or removed here would leave orphaned keys in
 * the jsonb of every item that had it — invisible in the form, still in the export.
 */
export function cleanSpecs(specs: SpecValues): SpecValues {
  const out: SpecValues = {};
  for (const [k, v] of Object.entries(specs)) {
    if (!ALL_SPEC_IDS.has(k)) continue;
    if (v === true) out[k] = true;
    else if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

/** Columns added by the specs migration, for the schema-compat write fallback. */
export const TACKLE_SPEC_FIELDS = ["specs"] as const;
