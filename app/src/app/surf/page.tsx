import { getAllSpecies } from "@/lib/data";
import { SurfClient } from "@/components/SurfClient";

export const metadata = {
  title: "Surf Fishing — Maritime Angler",
  description:
    "Fishing a Maritime beach: reading bars, troughs and cuts, timing the tide, surf and wind, rods and rigs for spinning and fly, what you'll catch, and the hazards that make this different from a wharf.",
};

export default async function SurfPage() {
  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Surf Fishing</h1>
        <p className="max-w-2xl text-muted">
          A beach isn&apos;t a wharf with sand. There&apos;s no structure to stand on — you have
          to read it under the water, from the way the waves break. The fish sit in a band a
          few metres wide that moves with the tide, and it&apos;s usually far closer in than you
          think.
        </p>
      </div>
      <SurfClient species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))} />
    </div>
  );
}
