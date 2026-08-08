import { getAllSpecies } from "@/lib/data";
import { getOwnedGear } from "@/lib/owned";
import { MatcherClient } from "@/components/MatcherClient";

export const metadata = {
  title: "What to Throw — Maritime Angler",
  description:
    "Which lures and flies work for which Maritime fish, in which water, and which of them you already own.",
};

// Reads the auth session to badge the gear you own, so it can't be fully static — the same
// trade-off already accepted on the species detail pages. Signed out it still renders, just
// without the badges.
export const dynamic = "force-dynamic";

export default async function MatcherPage() {
  const [species, owned] = await Promise.all([getAllSpecies(), getOwnedGear()]);

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">What to Throw</h1>
        <p className="max-w-2xl text-muted">
          Which lures and flies work for which fish, in which water — and which of them are
          already sitting in your Tackle Box and Fly Box. Every recommendation comes from the
          gear section of that fish&apos;s own guide, so this and the guide never disagree.
        </p>
      </div>
      <MatcherClient
        species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))}
        owned={owned}
      />
    </div>
  );
}
