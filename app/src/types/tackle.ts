export type TackleCategory =
  // Conventional tackle.
  | "rod"
  | "reel"
  | "lure"
  | "line"
  | "terminal_tackle"
  | "net"
  | "electronics"
  | "apparel"
  | "other"
  // Fly gear. Same table, same record shape, but never shown on the same screen — see
  // the `discipline` column added by 20260809090000_fly_discipline.sql and lib/fly.ts.
  | "fly_rod"
  | "fly_reel"
  | "fly_line"
  | "backing"
  | "leader_tippet"
  | "fly"
  | "fly_accessory";

/** Which box an item lives in. Enforced in the database by a check constraint. */
export type Discipline = "conventional" | "fly";

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
  fly_rod: "🎣",
  fly_reel: "🎡",
  fly_line: "🧵",
  backing: "🪢",
  leader_tippet: "➰",
  fly: "🪶",
  fly_accessory: "🧰",
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
  // Maximum realistic compartment count with dividers fully in for this size (not a
  // typical/average configuration — the diagram should start full, not sparse), and
  // the width:height footprint ratio (from `dims`) used to shape the diagram grid.
  // Both are just a starting point — the actual divider count on a physical tray
  // varies, so it's editable per-tray.
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
    defaultCompartments: 15,
    aspectRatio: 9.1 / 5,
  },
  {
    value: "medium",
    label: "Medium (Plano 3600 / Flambeau 4007)",
    planoNumber: "3600",
    flambeauNumber: "4007",
    dims: 'Plano 3600 / Flambeau 4007 — ~11" × 7.25" × 1.75"',
    defaultCompartments: 18,
    aspectRatio: 11 / 7.25,
  },
  {
    value: "large",
    label: "Large (Plano 3700 / Flambeau 5007)",
    planoNumber: "3700",
    flambeauNumber: "5007",
    dims: 'Plano 3700 / Flambeau 5007 — ~14.25" × 9.1" × 2"',
    defaultCompartments: 24,
    aspectRatio: 14.25 / 9.1,
  },
  {
    value: "custom",
    label: "Custom / Other size",
    planoNumber: null,
    flambeauNumber: null,
    dims: "",
    defaultCompartments: 12,
    aspectRatio: 1.5,
  },
];

export interface TackleTray {
  id: string;
  user_id: string;
  discipline?: Discipline;
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
  extra_photo_urls: string[];
  slot_index: number | null;
  slot_span: number;
  packed: boolean;
  last_serviced_on: string | null;
  maintenance_interval_days: number | null;
  maintenance_notes: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Per-category specifications — rod power, reel gear ratio, lure weight and so on.
   * The shape is defined by lib/tackle-specs.ts rather than here, because the field set
   * changes with the gear rather than with the schema. Optional so the app still compiles
   * and runs against a database where the specs migration hasn't been applied.
   */
  specs?: Record<string, string | boolean>;
  /**
   * Warranty cover. Optional so the app still compiles and runs against a database where
   * the warranty migration hasn't been applied.
   */
  purchase_date?: string | null;
  warranty_expires_on?: string | null;
  warranty_lifetime?: boolean | null;
  warranty_provider?: string | null;
  warranty_reference?: string | null;
  warranty_notes?: string | null;
  /**
   * Salt, fresh or both. Null means unsaid rather than unknown-and-guessed — see
   * lib/water-type.ts. Optional so the app runs before that migration lands.
   */
  water_type?: "salt" | "fresh" | "both" | null;
  /** Which box this belongs to. Optional so the app runs before the migration lands. */
  discipline?: Discipline;
  species_slugs?: string[];
  catch_count?: number;
}

export interface Catch {
  id: string;
  user_id: string;
  species_slug: string | null;
  catch_date: string;
  location: string | null;
  tackle_item_id: string | null;
  /** Set when logged as part of a saved trip (see types/trips.ts). Null for a catch with no trip. */
  trip_id: string | null;
  length_desc: string | null;
  weight_desc: string | null;
  kept: boolean;
  notes: string | null;
  photo_url: string | null;
  extra_photo_urls: string[];
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;

  // Numeric measurements, always metric. These sit alongside the original free-text
  // length_desc/weight_desc rather than replacing them — the migration backfills what
  // it can parse, and anything it couldn't keeps displaying its original string.
  length_cm: number | null;
  weight_kg: number | null;

  // Conditions at the moment of the catch. Recorded at logging time because it can't
  // be reconstructed later — the tide and weather APIs only serve forecasts and recent
  // observations. Null on catches logged before this existed, or entered by hand.
  caught_at: string | null;
  tide_state: "rising" | "falling" | "unknown" | null;
  tide_height_m: number | null;
  tide_station_name: string | null;
  weather_condition: string | null;
  temperature_c: number | null;
  pressure_kpa: number | null;
  wind_kmh: number | null;
}

export type WaterPreference = "salt" | "fresh" | "both";

export interface AnglerSettings {
  user_id: string;
  license_expiry: string | null;
  last_license_reminder_sent: string | null;

  tide_station_id: string | null;
  tide_station_code: string | null;
  tide_station_name: string | null;
  tide_station_lat: number | null;
  tide_station_lng: number | null;

  units: "metric" | "imperial";
  theme: string;
  font_pairing: string;
  tide_digest_enabled: boolean;
  last_tide_digest_sent: string | null;

  season_reminders_enabled: boolean;
  last_season_reminder_sent: string | null;

  angler_name: string | null;
  favourite_species_slug: string | null;
  favourite_lure: string | null;
  water_preference: WaterPreference | null;
  profile_notes: string | null;

  updated_at: string;
}

export interface FavouriteStation {
  id: string;
  user_id: string;
  station_id: string;
  station_code: string | null;
  station_name: string;
  latitude: number | null;
  longitude: number | null;
  position: number;
  created_at: string;
}

export const MAX_FAVOURITE_STATIONS = 8;
