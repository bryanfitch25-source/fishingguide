"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { haversineKm } from "@/lib/geo";
import type { UnitSystem } from "@/lib/units";

// How far the station you're reading is from where you're standing.
//
// The picker shows distance while you're choosing and then never mentions it again, which
// is backwards: the number matters most later, when you've forgotten which station you
// picked and the water in front of you isn't doing what the page says. A station 40 km up
// the coast can be an hour off the tide you're looking at.
//
// Deliberately does not prompt for location. It asks the Permissions API whether
// geolocation is *already* granted — which it will be if you've used Fish Near Me or the
// station picker — and stays silent otherwise. A page that throws a location prompt at you
// for a line of supporting text has misjudged what that line is worth.

/** Below this, "at the wharf you're standing on" is near enough to true. */
const SAME_PLACE_KM = 2;
/** A different station has to beat the current one by this much before it's worth saying. */
const WORTH_SWITCHING_KM = 10;

function formatDistance(km: number, units: UnitSystem): string {
  if (units === "imperial") {
    const miles = km * 0.621371;
    return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
  }
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

interface NearbyStation {
  id: string;
  name: string;
  distanceKm: number;
}

export function StationDistance({
  stationId,
  stationLat,
  stationLng,
  units,
}: {
  stationId: string;
  stationLat: number;
  stationLng: number;
  units: UnitSystem;
}) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [closer, setCloser] = useState<NearbyStation | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function measure() {
      // No Permissions API (older Safari) means no way to check without prompting, so
      // don't. The feature is a nicety; a surprise permission dialog is not.
      if (!navigator.geolocation || !navigator.permissions) return;
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (status.state !== "granted" || cancelled) return;
      } catch {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const { latitude, longitude } = pos.coords;
          const km = haversineKm(latitude, longitude, stationLat, stationLng);
          setDistanceKm(km);

          // Only worth asking the server for alternatives once we know the current one
          // isn't already on top of us.
          if (km <= SAME_PLACE_KM) return;
          fetch(`/api/stations/search?lat=${latitude}&lng=${longitude}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data: { stations?: NearbyStation[] } | null) => {
              if (cancelled || !data?.stations?.length) return;
              const nearest = data.stations.find((s) => s.id !== stationId);
              if (nearest && km - nearest.distanceKm >= WORTH_SWITCHING_KM) setCloser(nearest);
            })
            .catch(() => {
              /* An unreachable station list just means no nudge — the distance still shows. */
            });
        },
        () => {
          /* Permission was granted but the fix failed; nothing to show, nothing to say. */
        },
        { maximumAge: 300000, timeout: 8000 }
      );
    }

    measure();
    return () => {
      cancelled = true;
    };
  }, [stationId, stationLat, stationLng]);

  if (distanceKm === null) return null;

  return (
    <>
      <span className="text-muted">
        {" · "}
        {distanceKm <= SAME_PLACE_KM ? "where you are" : `${formatDistance(distanceKm, units)} away`}
      </span>
      {closer && (
        <Link
          href="/settings"
          className="ml-2 whitespace-nowrap rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-bold text-accent-dark"
          title={`${closer.name} is ${formatDistance(closer.distanceKm, units)} from you`}
        >
          {closer.name} is closer
        </Link>
      )}
    </>
  );
}
