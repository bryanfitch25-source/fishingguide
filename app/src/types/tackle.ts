export type TackleCategory =
  | "rod"
  | "reel"
  | "lure"
  | "line"
  | "terminal_tackle"
  | "net"
  | "electronics"
  | "apparel"
  | "other";

export const TACKLE_CATEGORIES: { value: TackleCategory; label: string }[] = [
  { value: "rod", label: "Rod" },
  { value: "reel", label: "Reel" },
  { value: "lure", label: "Lure" },
  { value: "line", label: "Line" },
  { value: "terminal_tackle", label: "Terminal Tackle" },
  { value: "net", label: "Net" },
  { value: "electronics", label: "Electronics" },
  { value: "apparel", label: "Apparel" },
  { value: "other", label: "Other" },
];

// Fallback glyph shown on a tray-diagram tile when the item has no photo.
export const CATEGORY_ICON: Record<TackleCategory, string> = {
  rod: "🎣",
  reel: "🎡",
  lure: "🐟",
  line: "🧵",
  terminal_tackle: "🪝",
  net: "🥅",
  electronics: "📟",
  apparel: "🧢",
  other: "📦",
};

export type TrayBrand = "Plano" | "Flambeau" | "Bass Pro / Cabela's" | "Other / Custom";

export const TRAY_BRANDS: TrayBrand[] = ["Plano", "Flambeau", "Bass Pro / Cabela's", "Other / Custom"];

export type TraySizeClass = "micro" | "small" | "medium" | "large" | "custom";

// Real tackle-tray sizing conventions. Plano's series numbers (3400/3500/3600/3700)
// denote footprint and are the industry-standard reference size; Flambeau's Tuff
// Tainer trays are built to the same boat-storage slots, with model numbers 4007
// (11" x 7.25" x 1.75", matches Plano 3600) and 5007 (14.25" x 9.125" x 2", matches
// Plano 3700) — most third-party boxes and rod-locker trays fit one of these families.
export const TRAY_SIZE_CLASSES: {
  value: TraySizeClass;
  label: string;
  planoNumber: string | null;
  flambeauNumber: string | null;
  dims: string;
  // Typical stock adjustable-divider configuration for this size, and the
  // width:height footprint ratio (from `dims`) used to shape the diagram grid.
  // Both are just a starting point — the actual divider count on a physical
  // tray varies, so it's editable per-tray.
  defaultCompartments: number;
  aspectRatio: number;
}[] = [
  {
    value: "micro",
    label: "Micro / Utility (Plano 3400)",
    planoNumber: "3400",
    flambeauNumber: null,
    dims: "Plano 3400-series compartment box",
    defaultCompartments: 4,
    aspectRatio: 1.4,
  },
  {
    value: "small",
    label: "Small (Plano 3500)",
    planoNumber: "3500",
    flambeauNumber: null,
    dims: 'Plano 3500 — ~9.1" × 5" × 1.25"',
    defaultCompartments: 5,
    aspectRatio: 9.1 / 5,
  },
  {
    value: "medium",
    label: "Medium (Plano 3600 / Flambeau 4007)",
    planoNumber: "3600",
    flambeauNumber: "4007",
    dims: 'Plano 3600 / Flambeau 4007 — ~11" × 7.25" × 1.75"',
    defaultCompartments: 6,
    aspectRatio: 11 / 7.25,
  },
  {
    value: "large",
    label: "Large (Plano 3700 / Flambeau 5007)",
    planoNumber: "3700",
    flambeauNumber: "5007",
    dims: 'Plano 3700 / Flambeau 5007 — ~14.25" × 9.1" × 2"',
    defaultCompartments: 8,
    aspectRatio: 14.25 / 9.1,
  },
  {
    value: "custom",
    label: "Custom / Other size",
    planoNumber: null,
    flambeauNumber: null,
    dims: "",
    defaultCompartments: 6,
    aspectRatio: 1.5,
  },
];

export interface TackleTray {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  size_class: TraySizeClass | null;
  compartments: number | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TackleItem {
  id: string;
  user_id: string;
  name: string;
  category: TackleCategory;
  brand: string | null;
  model: string | null;
  color_size: string | null;
  quantity: number;
  storage_location: string | null;
  tray_id: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  species_slugs?: string[];
}

export interface Catch {
  id: string;
  user_id: string;
  species_slug: string | null;
  catch_date: string;
  location: string | null;
  tackle_item_id: string | null;
  length_desc: string | null;
  weight_desc: string | null;
  kept: boolean;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}
