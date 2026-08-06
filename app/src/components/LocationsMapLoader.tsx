"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./LocationsMap";

// Leaflet touches `window` at import time, so it can never run during SSR — this
// thin client wrapper is what lets a Server Component page (locations/page.tsx)
// safely render a map without crashing the server render.
const LocationsMap = dynamic(() => import("./LocationsMap").then((m) => m.LocationsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center rounded-xl border border-border bg-surface card-lift text-sm text-muted">
      Loading map…
    </div>
  ),
});

export function LocationsMapLoader(props: {
  locationPins: MapPin[];
  catchPins?: MapPin[];
  center: [number, number];
  zoom?: number;
  height?: number;
}) {
  return <LocationsMap {...props} />;
}
