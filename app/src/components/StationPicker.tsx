"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { MAX_FAVOURITE_STATIONS, type FavouriteStation } from "@/types/tackle";
import { chsStationUrl } from "@/lib/tides";
import { AccentCard } from "./AccentCard";

interface RankedStation {
  id: string;
  code: string;
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

export interface SelectedStation {
  id: string;
  code: string | null;
  name: string;
  lat: number | null;
  lng: number | null;
}

// Picking which station the app is about.
//
// Two ways in — GPS and a typed place name — but both land on the same ranked list with
// the closest auto-selected. The list matters: straight-line distance often disagrees
// with which station actually reflects your water, because a headland or a river mouth
// can sit between you and the nearest one. Only someone reading the names can tell, so
// the alternatives stay on screen rather than being collapsed to a single answer.
export function StationPicker({
  initialStation,
  initialFavourites,
}: {
  initialStation: SelectedStation | null;
  initialFavourites: FavouriteStation[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [selected, setSelected] = useState<SelectedStation | null>(initialStation);
  const [favourites, setFavourites] = useState<FavouriteStation[]>(initialFavourites);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RankedStation[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isFavourite = (stationId: string) => favourites.some((f) => f.station_id === stationId);

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
      const closest = data.stations[0];
      if (closest) {
        await saveStation(closest, { silent: true });
        setStatus(
          `Auto-selected nearest station${data.place ? ` to ${data.place.name}` : ""}: ${
            closest.name
          } (${closest.distanceKm.toFixed(1)} km). Tap another to switch.`
        );
      } else {
        setStatus("No tide stations found near there.");
      }
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
          "Finding nearby stations…"
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

  async function saveStation(station: RankedStation, opts: { silent?: boolean } = {}) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("Sign in to save a station.");
      return;
    }
    const { error } = await supabase.from("angler_settings").upsert(
      {
        user_id: user.id,
        tide_station_id: station.id,
        tide_station_code: station.code,
        tide_station_name: station.name,
        tide_station_lat: station.latitude,
        tide_station_lng: station.longitude,
      },
      { onConflict: "user_id" }
    );
    if (error) {
      setStatus(`Couldn't save that station: ${error.message}`);
      return;
    }
    setSelected({
      id: station.id,
      code: station.code,
      name: station.name,
      lat: station.latitude,
      lng: station.longitude,
    });
    if (!opts.silent) setStatus(`Now showing tides for ${station.name}.`);
  }

  async function toggleFavourite(station: RankedStation | SelectedStation) {
    const existing = favourites.find((f) => f.station_id === station.id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("Sign in to save favourites.");
      return;
    }

    if (existing) {
      const { error } = await supabase.from("favourite_stations").delete().eq("id", existing.id);
      if (error) {
        setStatus(`Couldn't remove that favourite: ${error.message}`);
        return;
      }
      setFavourites((f) => f.filter((x) => x.id !== existing.id));
      return;
    }

    if (favourites.length >= MAX_FAVOURITE_STATIONS) {
      setStatus(
        `You can keep up to ${MAX_FAVOURITE_STATIONS} favourite spots — remove one before adding another.`
      );
      return;
    }

    const lat = "latitude" in station ? station.latitude : station.lat;
    const lng = "longitude" in station ? station.longitude : station.lng;
    const { data, error } = await supabase
      .from("favourite_stations")
      .insert({
        user_id: user.id,
        station_id: station.id,
        station_code: station.code,
        station_name: station.name,
        latitude: lat,
        longitude: lng,
        position: favourites.length,
      })
      .select()
      .single();

    if (error) {
      // The 8-favourite cap is also enforced by a database trigger, in case two tabs
      // race past the client-side check above.
      setStatus(
        error.message.includes("FAVOURITE_LIMIT")
          ? `You can keep up to ${MAX_FAVOURITE_STATIONS} favourite spots — remove one before adding another.`
          : `Couldn't save that favourite: ${error.message}`
      );
      return;
    }
    setFavourites((f) => [...f, data as FavouriteStation]);
  }

  async function removeFavourite(fav: FavouriteStation) {
    if (!confirm(`Remove ${fav.station_name} from your spots?`)) return;
    const { error } = await supabase.from("favourite_stations").delete().eq("id", fav.id);
    if (error) {
      setStatus(`Couldn't remove that favourite: ${error.message}`);
      return;
    }
    setFavourites((f) => f.filter((x) => x.id !== fav.id));
  }

  return (
    <AccentCard tone="rising" title="📍 Tide station">
      {selected ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="mr-auto">
            <p className="font-semibold text-brand-dark">{selected.name}</p>
            {selected.code && (
              <a
                href={chsStationUrl(selected.code)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand underline"
              >
                Official CHS predictions ({selected.code})
              </a>
            )}
          </div>
          <button
            onClick={() => toggleFavourite(selected)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent transition"
            title={isFavourite(selected.id) ? "Remove from My Spots" : "Add to My Spots"}
          >
            {isFavourite(selected.id) ? "★ Saved" : "☆ Save to My Spots"}
          </button>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted">
          No station chosen yet — you&apos;re seeing the default. Pick one below to make it stick.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={useMyLocation}
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          Use my current location
        </button>
        <form onSubmit={searchByName} className="flex flex-1 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="or search a town, e.g. Shediac"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-brand disabled:opacity-60"
          >
            Search
          </button>
        </form>
      </div>

      {status && <p className="mt-3 text-sm text-muted">{status}</p>}

      {results.length > 0 && (
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {results.map((s) => (
            <li key={s.id} className="flex items-center gap-2 px-3 py-2">
              <button
                onClick={() => saveStation(s)}
                className="mr-auto text-left text-sm hover:text-brand"
              >
                <span className={`font-medium ${selected?.id === s.id ? "text-brand" : ""}`}>
                  {selected?.id === s.id ? "✓ " : ""}
                  {s.name}
                </span>
                <span className="ml-2 text-xs text-muted">{s.distanceKm.toFixed(1)} km</span>
              </button>
              <button
                onClick={() => toggleFavourite(s)}
                className="rounded px-2 py-1 text-sm hover:bg-background"
                title={isFavourite(s.id) ? "Remove from My Spots" : "Add to My Spots"}
              >
                {isFavourite(s.id) ? "★" : "☆"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          My Spots ({favourites.length}/{MAX_FAVOURITE_STATIONS})
        </p>
        {favourites.length === 0 ? (
          <p className="text-sm text-muted">
            No saved spots yet — search for a station above and tap ☆ to keep it here.
          </p>
        ) : (
          <ul className="space-y-1">
            {favourites.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <button
                  onClick={() =>
                    saveStation({
                      id: f.station_id,
                      code: f.station_code ?? "",
                      name: f.station_name,
                      latitude: f.latitude ?? 0,
                      longitude: f.longitude ?? 0,
                      distanceKm: 0,
                    })
                  }
                  className="mr-auto text-left hover:text-brand"
                >
                  {selected?.id === f.station_id && "✓ "}
                  {f.station_name}
                </button>
                <button
                  onClick={() => removeFavourite(f)}
                  className="rounded px-2 text-muted hover:text-danger"
                  aria-label={`Remove ${f.station_name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccentCard>
  );
}
