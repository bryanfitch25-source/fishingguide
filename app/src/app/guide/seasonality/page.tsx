import { getAllSpecies } from "@/lib/data";
import { SeasonalityHeatmap } from "@/components/SeasonalityHeatmap";

export const metadata = {
  title: "Seasonality Calendar — Maritime Angler",
  description: "Month-by-month activity for every species covered in the guide, at a glance.",
};

export default async function SeasonalityPage() {
  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-8 scene-panel rounded-2xl p-5 sm:p-6">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Seasonality Calendar</h1>
        <p className="text-muted max-w-2xl">
          When each species is realistically worth targeting, month by month. Same data that
          drives Fish Near Me, just laid out as a full-year view.
        </p>
      </div>
      <SeasonalityHeatmap species={species} />
      <p className="mt-4 text-xs text-muted">
        Editorial approximation for the region as a whole — always check each species&apos; own
        guide page for regulation-specific season dates before keeping anything.
      </p>
    </div>
  );
}
