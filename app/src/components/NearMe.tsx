"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LocationGuide, Province, Species } from "@/types/content";
import { SpeciesCard } from "./SpeciesCard";
import { SEASONALITY, isInSeason } from "@/lib/seasonality";
import { guessProvince, haversineKm, type ProvinceGuess } from "@/lib/geo";
import { provinceLabel } from "./Badges";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "denied"; message: string }
  | { status: "located"; lat: number; lng: number; guess: ProvinceGuess };

export function NearMe({
  species,
  locations,
}: {
  species: Species[];
  locations: LocationGuide[];
}) {
  const [loc, setLoc] = useState<LocationState>({ status: "idle" });
  const [manualProvince, setManualProvince] = useState<Province | null>(null);

  const month = new Date().getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];

  const province: Province | null =
    manualProvince ?? (loc.status === "located" && !loc.guess.outOfRegion ? loc.guess.province : null);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLoc({ status: "denied", message: "Your browser doesn't support location. Pick your province below instead." });
      return;
    }
    setLoc({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLoc({
          status: "located",
          lat: latitude,
          lng: longitude,
          guess: guessProvince(latitude, longitude),
        });
        setManualProvince(null);
      },
      (err) => {
        setLoc({
          status: "denied",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location permission was denied. Pick your province below instead."
              : "Couldn't get your location. Pick your province below instead.",
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const { inSeason, offSeason } = useMemo(() => {
    if (!province) return { inSeason: [], offSeason: [] };
    const here = species.filter((s) => s.provinces.includes(province));
    return {
      inSeason: here.filter((s) => isInSeason(s.slug, month)),
      offSeason: here.filter((s) => !isInSeason(s.slug, month)),
    };
  }, [species, province, month]);

  const nearestGuides = useMemo(() => {
    if (loc.status !== "located") return [];
    return locations
      .filter((g) => g.lat != null && g.lng != null)
      .map((g) => ({
        guide: g,
        distanceKm: Math.round(haversineKm(loc.lat, loc.lng, g.lat as number, g.lng as number)),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [loc, locations]);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={requestLocation}
            disabled={loc.status === "locating"}
            className="rounded-lg bg-brand text-white font-semibold px-5 py-3 hover:bg-brand-dark transition disabled:opacity-60"
          >
            {loc.status === "locating" ? "Locating…" : "📍 Use my location"}
          </button>
          <span className="text-sm text-muted">or pick a province:</span>
          <div className="flex gap-2">
            {(["NB", "NS", "PEI"] as Province[]).map((p) => (
              <button
                key={p}
                onClick={() => setManualProvince(p)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                  province === p && manualProvince === p
                    ? "bg-brand text-white border-brand"
                    : "border-border hover:border-brand hover:text-brand"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loc.status === "denied" && (
          <p className="mt-3 text-sm text-amber-700">{loc.message}</p>
        )}
        {loc.status === "located" && loc.guess.outOfRegion && !manualProvince && (
          <p className="mt-3 text-sm text-amber-700">
            You look to be roughly {loc.guess.distanceKm} km from {loc.guess.nearestTown} — outside
            the region this app covers. Pick a province above to browse anyway.
          </p>
        )}
        {loc.status === "located" && !loc.guess.outOfRegion && (
          <p className="mt-3 text-sm text-muted">
            You appear to be in <strong>{provinceLabel(loc.guess.province)}</strong> (nearest
            reference point: {loc.guess.nearestTown}, ~{loc.guess.distanceKm} km). Location is
            only used in your browser; it&apos;s never stored or sent anywhere.
          </p>
        )}
      </div>

      {loc.status === "located" && nearestGuides.length > 0 && !loc.guess.outOfRegion && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-brand-dark mb-3">Nearest trip guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearestGuides.map(({ guide, distanceKm }) => (
              <Link
                key={guide.id}
                href={`/locations/${guide.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 hover:border-brand transition"
              >
                <span className="font-semibold text-brand-dark group-hover:text-brand">
                  {guide.title}
                </span>
                <span className="block text-sm text-muted mt-1">~{distanceKm} km away</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {province && (
        <>
          <section className="mb-10">
            <h2 className="text-xl font-bold text-brand-dark mb-1">
              Likely biting in {provinceLabel(province)} in {monthName}
            </h2>
            <p className="text-sm text-muted mb-4">
              Based on each guide&apos;s season and timing notes. Always check the current
              regulations on the species page before keeping anything.
            </p>
            {inSeason.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inSeason.map((s) => (
                  <div key={s.id}>
                    <SpeciesCard species={s} />
                    {SEASONALITY[s.slug]?.note && (
                      <p className="text-xs text-muted mt-1 px-1">{SEASONALITY[s.slug].note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Nothing flagged as prime this month — check the off-season list below.
              </p>
            )}
          </section>

          {offSeason.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-brand-dark mb-1">
                Out of season / less likely right now
              </h2>
              <p className="text-sm text-muted mb-4">
                Still worth reading up on for a future trip.
              </p>
              <div className="flex flex-wrap gap-2">
                {offSeason.map((s) => (
                  <Link
                    key={s.id}
                    href={`/species/${s.slug}`}
                    className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-brand hover:text-brand"
                  >
                    {s.common_name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!province && loc.status === "idle" && (
        <p className="text-muted text-sm">
          Share your location or pick a province to see what should be biting right now.
        </p>
      )}
    </div>
  );
}
