import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { isUnitSystem, type UnitSystem } from "@/lib/units";
import { DEFAULT_FONT, DEFAULT_THEME, isFontId, isThemeId } from "@/lib/appearance";
import type { AnglerSettings, FavouriteStation } from "@/types/tackle";
import { StationPicker } from "@/components/StationPicker";
import { UnitsToggle } from "@/components/UnitsToggle";
import { AppearancePicker } from "@/components/AppearancePicker";
import { AnglerProfileForm } from "@/components/AnglerProfileForm";
import { RemindersPanel } from "@/components/RemindersPanel";

export const metadata = {
  title: "Settings — Maritime Angler",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [settingsRes, favouritesRes, species] = await Promise.all([
    supabase.from("angler_settings").select("*").maybeSingle(),
    supabase.from("favourite_stations").select("*").order("position"),
    getAllSpecies(),
  ]);

  const settings = settingsRes.data as AnglerSettings | null;
  const units: UnitSystem = isUnitSystem(settings?.units) ? settings.units : "metric";

  return (
    <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-10">
      <header className="mb-4 sm:mb-8 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mb-1 sm:mb-2">Settings</h1>
        <p className="text-muted max-w-2xl">
          Your tide station, units, profile and reminders.
        </p>
      </header>

      <div className="space-y-5">
        <StationPicker
          initialStation={
            settings?.tide_station_id && settings.tide_station_name
              ? {
                  id: settings.tide_station_id,
                  code: settings.tide_station_code,
                  name: settings.tide_station_name,
                  lat: settings.tide_station_lat,
                  lng: settings.tide_station_lng,
                }
              : null
          }
          initialFavourites={(favouritesRes.data as FavouriteStation[]) ?? []}
        />

        {/* Seeds the cookie from the stored row on first visit from a new device, so
            the account-level preference still travels — it just arrives one paint later
            than it used to, on this one page, rather than costing every route its
            static rendering. */}
        <AppearancePicker
          initialTheme={isThemeId(settings?.theme) ? settings.theme : DEFAULT_THEME}
          initialFont={isFontId(settings?.font_pairing) ? settings.font_pairing : DEFAULT_FONT}
          syncFromAccount
        />

        <UnitsToggle initialUnits={units} />

        <AnglerProfileForm
          initial={settings}
          species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))}
        />

        <RemindersPanel />
      </div>
    </div>
  );
}
