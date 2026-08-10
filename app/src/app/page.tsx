import { Suspense } from "react";
import { RecentActivity } from "@/components/RecentActivity";
import { HomeNav } from "@/components/HomeNav";

export const metadata = {
  title: "Maritime Angler",
  description: "Your all-around fishing app: species guide, tackle box, and catch log for NB, NS & PEI.",
};

// RecentActivity reads the auth session cookie, so this route can't be fully static —
// same trade-off already accepted on the species detail pages. It's wrapped in Suspense
// below so that auth check and its two DB queries don't hold up everything else: without
// a boundary, Next waits for every async component in the tree before sending any HTML,
// so a signed-in visitor was blocked on Supabase round-trips before seeing a nav that
// doesn't depend on them at all. With the boundary, the shell streams immediately and
// Recent Activity slots in above it once it resolves.
export const dynamic = "force-dynamic";

// The page is a launcher. It used to be fourteen equally-weighted cards, which is not a
// launcher but a search problem — so the sections now live under five headings in
// lib/home-nav.ts, with two lenses over them. Nothing was removed; the routes that had
// cards are one tap deeper.
export default async function Home() {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-12">
      <Suspense fallback={null}>
        <RecentActivity />
      </Suspense>

      <HomeNav />
    </div>
  );
}
