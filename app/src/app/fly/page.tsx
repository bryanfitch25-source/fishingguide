import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { FlySectionClient } from "@/components/FlySectionClient";

export const metadata = {
  title: "Fly Box — Maritime Angler",
  description:
    "Fly gear kept separate from conventional tackle, with Maritime patterns, line weights, the tippet chart, fly knots and the salmon rules.",
};

export default async function FlyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Fly Box</h1>
        <p className="max-w-2xl text-muted">
          Rods, reels, lines, leaders and flies — kept entirely apart from the Tackle Box, because
          on Maritime salmon water the two aren&apos;t interchangeable and aren&apos;t even legal
          alternatives.
        </p>
      </div>
      <FlySectionClient species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))} />
    </div>
  );
}
