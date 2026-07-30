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

// Real tackle-tray sizing conventions: Plano's series numbers (3400/3500/3600/3700)
// denote footprint, and Flambeau's 4-series/5-series trays are built to the same
// boat-storage slots as Plano's 3600/3700 — most third-party boxes and rod-locker
// trays are sized to fit one of these two families.
export const TRAY_SIZE_CLASSES: { value: TraySizeClass; label: string; dims: string }[] = [
  { value: "micro", label: "Micro / Utility", dims: "Plano 3400-series compartment box" },
  { value: "small", label: "Small", dims: 'Plano 3500 — ~9.1" × 5" × 1.25"' },
  { value: "medium", label: "Medium", dims: 'Plano 3600 / Flambeau 4-series — ~11" × 7.25"' },
  { value: "large", label: "Large", dims: 'Plano 3700 / Flambeau 5-series — ~14" × 9.1"' },
  { value: "custom", label: "Custom / Other size", dims: "" },
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
