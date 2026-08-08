import { RecentActivity } from "@/components/RecentActivity";
import { HomeNav } from "@/components/HomeNav";

export const metadata = {
  title: "Maritime Angler",
  description: "Your all-around fishing app: species guide, tackle box, and catch log for NB, NS & PEI.",
};

// RecentActivity reads the auth session cookie, so this route can't be fully static —
// same trade-off already accepted on the species detail pages.
export const dynamic = "force-dynamic";

// The page is a launcher. It used to be fourteen equally-weighted cards, which is not a
// launcher but a search problem — so the sections now live under five headings in
// lib/home-nav.ts, with two lenses over them. Nothing was removed; the routes that had
// cards are one tap deeper.
export default async function Home() {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-12">
      <div className="mb-4 sm:mb-8 scene-panel card-lift rounded-2xl p-4 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-dark">Maritime Angler</h1>
        <p className="mt-1 sm:mt-3 max-w-2xl text-sm sm:text-lg text-muted">
          Tides, species guides, tackle and catches for NB, NS &amp; PEI.
        </p>
      </div>

      <RecentActivity />

      <HomeNav />
    </div>
  );
}
