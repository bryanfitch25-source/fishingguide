import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { isUnitSystem, type UnitSystem } from "@/lib/units";
import type { FavouriteStation } from "@/types/tackle";
import { MySpotsClient } from "@/components/MySpotsClient";

export const metadata = {
  title: "My Spots — Maritime Angler",
};

export default async function MySpotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [favouritesRes, settingsRes] = await Promise.all([
    supabase.from("favourite_stations").select("*").order("position"),
    supabase.from("angler_settings").select("tide_station_id, units").maybeSingle(),
  ]);

  const units: UnitSystem = isUnitSystem(settingsRes.data?.units) ? settingsRes.data.units : "metric";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <header className="mb-8 scene-panel rounded-2xl p-5 sm:p-6">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">My Spots</h1>
        <p className="text-muted max-w-2xl">
          Every spot you fish, side by side, so you can see which one the tide suits right
          now without checking them one at a time.
        </p>
      </header>

      <MySpotsClient
        favourites={(favouritesRes.data as FavouriteStation[]) ?? []}
        activeStationId={settingsRes.data?.tide_station_id ?? null}
        units={units}
      />
    </div>
  );
}
