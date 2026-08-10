import Link from "next/link";
import { getAllSpecies } from "@/lib/data";
import { getSharedTrip } from "@/lib/trips";
import { SharedTripView } from "@/components/SharedTripView";

export const metadata = {
  title: "Shared Trip — Maritime Angler",
  robots: { index: false, follow: false },
};

// Public, unauthenticated, read-only — no sign-in, no edit/delete. See SharedTripView
// for what it does and doesn't show.
export default async function SharedTripPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const trip = await getSharedTrip(token);

  if (!trip) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
        <p className="text-sm text-muted">
          This link isn&apos;t valid, or the trip is no longer shared.{" "}
          <Link href="/" className="text-accent hover:underline">
            Maritime Angler
          </Link>
        </p>
      </div>
    );
  }

  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10 space-y-8">
      <div className="rounded-xl border border-accent bg-accent-light p-3 text-sm text-accent-dark">
        Shared, read-only trip sheet.{" "}
        <Link href="/" className="underline">
          Maritime Angler
        </Link>{" "}
        is a recreational fishing reference for NB, NS &amp; PEI.
      </div>

      <SharedTripView trip={trip} species={species} />
    </div>
  );
}
