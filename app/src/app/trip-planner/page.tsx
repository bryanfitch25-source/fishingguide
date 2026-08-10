import { redirect } from "next/navigation";
import { getAllLocationGuides, getAllSpecies } from "@/lib/data";
import { getCurrentUser, createClient } from "@/lib/supabase-server";
import { getTrips, splitTrips } from "@/lib/trips";
import { TripPlannerHome } from "@/components/TripPlannerHome";
import type { FavouriteStation } from "@/types/tackle";

export const metadata = {
  title: "Trip Planner — Maritime Angler",
  description: "Plan and save fishing trips anywhere in NB, NS or PEI — not just the curated trip guides.",
};

// Trips are saved, per-user rows now rather than a URL param, so this needs a session
// the same way /catches, /tackle and /spots already do.
export default async function TripPlannerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [trips, guides, species, supabase] = await Promise.all([
    getTrips(),
    getAllLocationGuides(),
    getAllSpecies(),
    createClient(),
  ]);
  const { data: favouritesData } = await supabase.from("favourite_stations").select("*").order("position");
  const favourites = (favouritesData as FavouriteStation[]) ?? [];

  const { upcoming, past } = splitTrips(trips);

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-8 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mb-1 sm:mb-2">Trip Planner</h1>
        <p className="text-muted max-w-2xl">
          Save a trip anywhere — search a place or use your location, or start from what
          you want to catch. Conditions, season, safety and a gear checklist follow.
        </p>
      </div>

      <TripPlannerHome upcoming={upcoming} past={past} guides={guides} species={species} favourites={favourites} />
    </div>
  );
}
