import type { Province } from "@/types/content";

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  /** ISO date (YYYY-MM-DD), or null for a trip that isn't scheduled yet. Also the start date for a multi-day trip. */
  trip_date: string | null;
  /** Null for a single-day trip (or one with no trip_date at all); otherwise the last day, inclusive. */
  trip_end_date: string | null;
  lat: number | null;
  lng: number | null;
  place_name: string | null;
  province: Province | null;
  /** Set only when the trip started from a curated guide — a shortcut, not a requirement. */
  location_guide_slug: string | null;
  target_species: string[];
  notes: string | null;
  /** Whether to push a reminder the morning of trip_date. Meaningless without a date. */
  reminder_enabled: boolean;
  /** Set once the trip is shared — a public, read-only link at /trip-planner/shared/[token]. */
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

/** The subset a create/edit form actually collects — everything else is server-assigned. */
export type TripInput = Omit<Trip, "id" | "user_id" | "created_at" | "updated_at" | "share_token">;

/** One invited account's access to a trip — see invite_to_trip() in the Phase E migration. */
export interface TripShare {
  id: string;
  trip_id: string;
  invited_user_id: string;
  /** Snapshotted at invite time, not a live join to auth.users. */
  invited_email: string;
  created_at: string;
}
