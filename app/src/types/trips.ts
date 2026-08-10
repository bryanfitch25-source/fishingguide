import type { Province } from "@/types/content";

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  /** ISO date (YYYY-MM-DD), or null for a trip that isn't scheduled yet. */
  trip_date: string | null;
  lat: number | null;
  lng: number | null;
  place_name: string | null;
  province: Province | null;
  /** Set only when the trip started from a curated guide — a shortcut, not a requirement. */
  location_guide_slug: string | null;
  target_species: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** The subset a create/edit form actually collects — everything else is server-assigned. */
export type TripInput = Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">;
