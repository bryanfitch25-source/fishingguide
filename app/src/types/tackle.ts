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
