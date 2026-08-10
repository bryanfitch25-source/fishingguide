"use client";

import { useState } from "react";
import { guessProvince } from "@/lib/geo";
import type { FavouriteStation } from "@/types/tackle";
import type { LocationGuide, Province } from "@/types/content";

export interface TripLocation {
  lat: number;
  lng: number;
  place_name: string;
  province: Province | null;
  /** Set only when picked via the guide shortcut below. */
  location_guide_slug: string | null;
}

interface RankedStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface SearchResponse {
  place: { name: string; lat: number; lng: number } | null;
  stations: RankedStation[];
  error?: string;
}

// A trip's location, independent of the curated guides — search any place name or use
// GPS, same underlying /api/stations/search as the Tides station picker, but this one
// never writes to angler_settings or favourite_stations. Picking a trip's spot has
// nothing to do with your default tide station elsewhere in the app; the two were
// getting silently conflated by reusing StationPicker as-is, which is why this is its
// own component rather than that one with props bolted on.
export function TripLocationPicker({
  value,
  onChange,
  guides,
  favourites,
}: {
  value: TripLocation | null;
  onChange: (loc: TripLocation) => void;
  guides: LocationGuide[];
  favourites: FavouriteStation[];
}) {
  const [editing, setEditing] = useState(!value);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RankedStation[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function fromPoint(lat: number, lng: number, name: string): TripLocation {
    const guess = guessProvince(lat, lng);
    return {
      lat,
      lng,
      place_name: name,
      province: guess.outOfRegion ? null : guess.province,
      location_guide_slug: null,
    };
  }

  function pick(loc: TripLocation) {
    onChange(loc);
    setEditing(false);
    setResults([]);
    setStatus(null);
    setQuery("");
  }

  async function applySearch(url: string, searchingMessage: string) {
    setBusy(true);
    setStatus(searchingMessage);
    setResults([]);
    try {
      const res = await fetch(url);
      const data: SearchResponse = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "Search failed. Try again in a moment.");
        return;
      }
      setResults(data.stations);
      setStatus(data.stations.length === 0 ? "No results found near there." : null);
    } catch {
      setStatus("Search failed — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setStatus("This device doesn't support location lookup — try searching by place name.");
      return;
    }
    setStatus("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        applySearch(
          `/api/stations/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`,
          "Finding nearby places…"
        ),
      (err) =>
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — search by place name instead."
            : "Couldn't get your location — search by place name instead."
        ),
      { timeout: 10000 }
    );
  }

  function searchByName(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setStatus("Enter a town, landmark or address to search.");
      return;
    }
    applySearch(`/api/stations/search?q=${encodeURIComponent(query)}`, "Searching…");
  }

  if (!editing && value) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <span className="text-sm">
          <span className="font-semibold">{value.place_name}</span>
          {value.province && <span className="text-muted"> · {value.province}</span>}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="ml-auto text-xs font-medium text-accent hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-2">
        <form onSubmit={searchByName} className="flex flex-1 min-w-[180px] gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a place name"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-brand disabled:opacity-60"
          >
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={busy}
          className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-on-brand hover:bg-brand-dark disabled:opacity-60"
        >
          📍 Use my location
        </button>
      </div>

      {status && <p className="text-xs text-muted">{status}</p>}

      {results.length > 0 && (
        <ul className="space-y-1">
          {results.slice(0, 6).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(fromPoint(s.latitude, s.longitude, s.name))}
                className="w-full rounded-lg border border-border px-3 py-1.5 text-left text-sm hover:border-brand"
              >
                <span className="font-medium">{s.name}</span>{" "}
                <span className="text-muted">· {s.distanceKm.toFixed(1)} km away</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {favourites.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Your spots</p>
          <div className="flex flex-wrap gap-1.5">
            {favourites
              .filter((f) => f.latitude !== null && f.longitude !== null)
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => pick(fromPoint(f.latitude as number, f.longitude as number, f.station_name))}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-brand"
                >
                  {f.station_name}
                </button>
              ))}
          </div>
        </div>
      )}

      {guides.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-muted">Or start from a trip guide</p>
          <div className="flex flex-wrap gap-1.5">
            {guides
              .filter((g) => g.lat !== null && g.lng !== null)
              .map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() =>
                    pick({
                      lat: g.lat as number,
                      lng: g.lng as number,
                      place_name: g.title,
                      province: g.province,
                      location_guide_slug: g.slug,
                    })
                  }
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-brand"
                >
                  {g.title}
                </button>
              ))}
          </div>
        </div>
      )}

      {value && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs font-medium text-muted hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
