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
}[] = [
  {
    value: "micro",
    label: "Micro / Utility (Plano 3400)",
    planoNumber: "3400",
    flambeauNumber: null,
    dims: "Plano 3400-series compartment box",
  },
  {
    value: "small",
    label: "Small (Plano 3500)",
    planoNumber: "3500",
    flambeauNumber: null,
    dims: 'Plano 3500 — ~9.1" × 5" × 1.25"',
  },
  {
    value: "medium",
    label: "Medium (Plano 3600 / Flambeau 4007)",
    planoNumber: "3600",
    flambeauNumber: "4007",
    dims: 'Plano 3600 / Flambeau 4007 — ~11" × 7.25" × 1.75"',
  },
  {
    value: "large",
    label: "Large (Plano 3700 / Flambeau 5007)",
    planoNumber: "3700",
    flambeauNumber: "5007",
    dims: 'Plano 3700 / Flambeau 5007 — ~14.25" × 9.1" × 2"',
  },
  { value: "custom", label: "Custom / Other size", planoNumber: null, flambeauNumber: null, dims: "" },
];

export interface TackleTray {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  size_class: TraySizeClass | null;
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
