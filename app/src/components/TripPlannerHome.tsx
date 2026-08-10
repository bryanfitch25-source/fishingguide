"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TripForm } from "@/components/TripForm";
import { SpeciesTripStart } from "@/components/SpeciesTripStart";
import { formatTripDates } from "@/lib/trip-dates";
import type { FavouriteStation } from "@/types/tackle";
import type { LocationGuide, Species } from "@/types/content";
import type { Trip } from "@/types/trips";

type View = "list" | "new-location" | "species-picker" | "new-from-species";

function TripRow({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trip-planner/${trip.id}`}
      className="block rounded-xl border border-border bg-surface card-lift p-4 hover:border-brand transition"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold text-brand-dark">{trip.name}</span>
        <span className="text-sm text-muted whitespace-nowrap">{formatTripDates(trip)}</span>
      </div>
      {(trip.place_name || trip.target_species.length > 0) && (
        <p className="mt-1 text-sm text-muted">
          {trip.place_name}
          {trip.place_name && trip.target_species.length > 0 ? " · " : ""}
          {trip.target_species.length > 0 && `Targeting ${trip.target_species.length} species`}
        </p>
      )}
    </Link>
  );
}

export function TripPlannerHome({
  upcoming,
  past,
  guides,
  species,
  favourites,
}: {
  upcoming: Trip[];
  past: Trip[];
  guides: LocationGuide[];
  species: Species[];
  favourites: FavouriteStation[];
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [prefillSpecies, setPrefillSpecies] = useState<string[]>([]);

  function handleSaved(trip: Trip) {
    router.push(`/trip-planner/${trip.id}`);
  }

  if (view === "new-location" || view === "new-from-species") {
    return (
      <TripForm
        initial={null}
        prefillTargetSpecies={view === "new-from-species" ? prefillSpecies : undefined}
        guides={guides}
        favourites={favourites}
        species={species}
        onSaved={handleSaved}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "species-picker") {
    return (
      <SpeciesTripStart
        species={species}
        onContinue={(slug) => {
          setPrefillSpecies([slug]);
          setView("new-from-species");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setView("new-location")}
          className="rounded-lg bg-brand text-on-brand font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
        >
          + Plan a trip
        </button>
        <button
          type="button"
          onClick={() => setView("species-picker")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand transition"
        >
          🎣 Plan around a species
        </button>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-muted">
          No trips yet — plan one from a location or a target species above.
        </p>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Past</h2>
          <div className="space-y-3">
            {past.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
