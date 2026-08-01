import Link from "next/link";
import { getAllSpecies, getAllLocationGuides } from "@/lib/data";
import { SpeciesCard } from "@/components/SpeciesCard";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata = {
  title: "Fishing Guide — Maritime Angler",
  description:
    "Species-by-species recreational fishing guides for New Brunswick, Nova Scotia, and Prince Edward Island: identification, seasons, regulations, gear, and technique.",
};

export default async function GuideHome() {
  const [species, locations] = await Promise.all([getAllSpecies(), getAllLocationGuides()]);
  const featured = species.slice(0, 6);

  return (
    <div>
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">
            Fishing guides for New Brunswick, Nova Scotia &amp; PEI
          </h1>
          <p className="mt-4 max-w-2xl text-brand-light/90 text-base sm:text-lg">
            Identification, seasons, regulations, gear, and technique for {species.length || "every"}{" "}
            species you can actually catch in the Maritimes — from wharf mackerel to river
            salmon — plus spot-by-spot trip guides.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/species"
              className="rounded-lg bg-white text-brand-dark font-semibold px-5 py-3 hover:bg-brand-light transition"
            >
              Browse all species
            </Link>
            <Link
              href="/locations"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              Trip guides by location
            </Link>
            <Link
              href="/regulations"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              Regulations overview
            </Link>
            <Link
              href="/near-me"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              📍 Fish near me
            </Link>
            <Link
              href="/guide/seasonality"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              📅 Seasonality calendar
            </Link>
            <Link
              href="/species/compare"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              ⚖️ Compare species
            </Link>
            <Link
              href="/guide/knots"
              className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              🪢 Knots &amp; rigging
            </Link>
          </div>
        </div>
      </section>

      {!isSupabaseConfigured && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-6">
          <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
            Supabase isn&apos;t configured yet — set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>, run the
            migrations, and seed the database. See <code>SETUP.md</code>.
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Popular species</h2>
          <Link href="/species" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((s) => (
            <SpeciesCard key={s.id} species={s} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="text-muted text-sm">No species loaded yet. Run the seed script.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">
            Not sure where to start?
          </h2>
          <p className="text-sm text-muted max-w-2xl mb-4">
            Trip guides walk through a specific stretch of coast or river — best spots, which
            species you&apos;ll actually encounter, tides, and gear — instead of one species at
            a time.
          </p>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <Link
                key={loc.id}
                href={`/locations/${loc.slug}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-brand hover:text-brand"
              >
                {loc.title}
              </Link>
            ))}
            {locations.length === 0 && (
              <p className="text-muted text-sm">No trip guides loaded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
