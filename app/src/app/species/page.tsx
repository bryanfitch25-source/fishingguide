import { getAllSpecies } from "@/lib/data";
import { SpeciesFilterGrid } from "@/components/SpeciesFilterGrid";

export const metadata = {
  title: "All Species — Maritime Angler",
  description: "Every recreational fish species covered for New Brunswick, Nova Scotia, and PEI.",
};

export default async function SpeciesIndexPage() {
  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">All Species</h1>
      <p className="text-muted mb-8 max-w-2xl">
        Freshwater, saltwater, and anadromous species you can target from shore or boat across
        New Brunswick, Nova Scotia, and Prince Edward Island.
      </p>
      <SpeciesFilterGrid species={species} />
    </div>
  );
}
