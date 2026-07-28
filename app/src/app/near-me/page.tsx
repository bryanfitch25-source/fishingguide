import { getAllSpecies, getAllLocationGuides } from "@/lib/data";
import { NearMe } from "@/components/NearMe";

export const metadata = {
  title: "Fish Near Me — Maritime Angler",
  description:
    "See which species should be biting at your location in NB, NS, or PEI right now, plus the nearest trip guides.",
};

export default async function NearMePage() {
  const [species, locations] = await Promise.all([getAllSpecies(), getAllLocationGuides()]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Fish Near Me</h1>
      <p className="text-muted mb-8 max-w-2xl">
        Uses your location (or a province you pick) plus the current month to show which
        species should realistically be biting near you right now.
      </p>
      <NearMe species={species} locations={locations} />
    </div>
  );
}
