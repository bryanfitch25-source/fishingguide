import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { CatchLogClient } from "@/components/CatchLogClient";
import { isUnitSystem, type UnitSystem } from "@/lib/units";

export const metadata = {
  title: "Catch Log — Maritime Angler",
};

export default async function CatchLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [species, settingsRes] = await Promise.all([
    getAllSpecies(),
    supabase.from("angler_settings").select("units").maybeSingle(),
  ]);

  const units: UnitSystem = isUnitSystem(settingsRes.data?.units) ? settingsRes.data.units : "metric";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-8 scene-panel rounded-2xl p-5 sm:p-6">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Catch Log</h1>
        <p className="text-muted max-w-2xl">
          What you caught, where, and what you used — your own record of what actually works.
        </p>
      </div>
      <CatchLogClient
        species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))}
        units={units}
      />
    </div>
  );
}
