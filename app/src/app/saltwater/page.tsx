import { getAllSpecies } from "@/lib/data";
import { SaltwaterClient } from "@/components/SaltwaterClient";

export const metadata = {
  title: "Saltwater — Maritime Angler",
  description:
    "Fishing the salt in NB, NS and PEI — tides, structure, gear for spinning and fly alike, what you'll actually catch, wharf access, and keeping your tackle alive.",
};

export default async function SaltwaterPage() {
  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Saltwater</h1>
        <p className="max-w-2xl text-muted">
          Salt isn&apos;t fresh water with bigger fish in it. The tide decides when you go, the
          fish move rather than hold, most access belongs to somebody else, and the water
          quietly destroys your gear between trips. Spinning and fly together, because on a
          wharf they&apos;re solving the same problem.
        </p>
      </div>
      <SaltwaterClient
        species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))}
      />
    </div>
  );
}
