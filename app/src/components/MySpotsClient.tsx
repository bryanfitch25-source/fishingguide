"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import type { FavouriteStation } from "@/types/tackle";
import { formatCountdown } from "@/lib/tides";
import { formatHeight, type UnitSystem } from "@/lib/units";
import { AccentCard, TideStatePill } from "./AccentCard";

interface Snapshot {
  heightM: number;
  state: "rising" | "falling" | "unknown";
  next: { time: string; heightM: number; type: "high" | "low" } | null;
}

type CardState =
  | { status: "loading" }
  | { status: "ready"; snapshot: Snapshot }
  | { status: "unavailable"; reason: string };

// Every saved spot's current tide, side by side.
//
// The point of the screen is deciding where to go, which only works if you can compare
// them at a glance — so each card fetches independently and renders the moment its own
// data lands. One slow or dead station leaves a single "unavailable" card rather than
// holding up the other seven.
export function MySpotsClient({
  favourites,
  activeStationId,
  units,
}: {
  favourites: FavouriteStation[];
  activeStationId: string | null;
  units: UnitSystem;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Seeded at construction rather than reset inside the effect: setting every card to
  // "loading" synchronously in an effect schedules a second render pass before the
  // first has painted, which React flags as a cascading render.
  const [states, setStates] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(favourites.map((f) => [f.id, { status: "loading" } as CardState]))
  );

  // Fires the requests and nothing else — every setState here happens in a promise
  // callback, never synchronously, so it's safe to call straight from an effect.
  const fetchSnapshots = useCallback(() => {
    for (const fav of favourites) {
        fetch(`/api/stations/snapshot?stationId=${encodeURIComponent(fav.station_id)}`)
          .then(async (res) => {
            if (res.ok) {
              const snapshot: Snapshot = await res.json();
              setStates((s) => ({ ...s, [fav.id]: { status: "ready", snapshot } }));
              return;
            }
            const body = await res.json().catch(() => ({}));
            setStates((s) => ({
              ...s,
              [fav.id]: {
                status: "unavailable",
                reason:
                  body.error === "inactive"
                    ? "No predictions — station may be discontinued"
                    : "Couldn't reach the tide service",
              },
            }));
          })
          .catch(() =>
            setStates((s) => ({
              ...s,
              [fav.id]: { status: "unavailable", reason: "Couldn't reach the tide service" },
            }))
          );
    }
  }, [favourites]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  // The manual refresh button, unlike the initial load, does need to clear the readings
  // already on screen so stale heights aren't left sitting there during the refetch.
  function refresh() {
    setStates(Object.fromEntries(favourites.map((f) => [f.id, { status: "loading" } as CardState])));
    fetchSnapshots();
  }

  async function switchTo(fav: FavouriteStation) {
    setSwitching(fav.id);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in to switch stations.");
      setSwitching(null);
      return;
    }
    const { error: saveError } = await supabase.from("angler_settings").upsert(
      {
        user_id: user.id,
        tide_station_id: fav.station_id,
        tide_station_code: fav.station_code,
        tide_station_name: fav.station_name,
        tide_station_lat: fav.latitude,
        tide_station_lng: fav.longitude,
      },
      { onConflict: "user_id" }
    );
    if (saveError) {
      setError(`Couldn't switch to ${fav.station_name}: ${saveError.message}`);
      setSwitching(null);
      return;
    }
    // Straight to the tides screen for the spot just picked — the whole reason for
    // being on this page is choosing where to go.
    router.push("/tides");
  }

  if (favourites.length === 0) {
    return (
      <AccentCard tone="neutral" title="No spots saved yet">
        <p className="text-sm text-muted">
          Save a tide station and it shows up here, so you can compare conditions across
          every spot you fish before deciding where to go. Add one from{" "}
          <Link href="/settings" className="text-brand underline">
            settings
          </Link>
          .
        </p>
      </AccentCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{favourites.length} saved</p>
        <button
          onClick={refresh}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition hover:border-brand"
        >
          ⟳ Refresh
        </button>
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {favourites.map((fav) => {
          const state = states[fav.id] ?? { status: "loading" as const };
          const isActive = fav.station_id === activeStationId;
          return (
            <AccentCard
              key={fav.id}
              tone={
                state.status === "ready"
                  ? state.snapshot.state === "falling"
                    ? "falling"
                    : "rising"
                  : "neutral"
              }
              title={
                <span>
                  {isActive && <span title="Currently selected">✓ </span>}
                  {fav.station_name}
                </span>
              }
              action={
                state.status === "ready" ? <TideStatePill state={state.snapshot.state} /> : null
              }
            >
              {state.status === "loading" && <p className="text-sm text-muted">Loading…</p>}

              {state.status === "unavailable" && (
                <p className="text-sm text-muted">{state.reason}</p>
              )}

              {state.status === "ready" && (
                <>
                  <p className="text-2xl font-bold text-brand-dark">
                    {formatHeight(state.snapshot.heightM, units)}
                  </p>
                  {state.snapshot.next && (
                    <p className="mt-1 text-xs text-muted">
                      Next {state.snapshot.next.type} {formatCountdown(new Date(state.snapshot.next.time).getTime())}
                    </p>
                  )}
                </>
              )}

              <button
                onClick={() => switchTo(fav)}
                disabled={isActive || switching === fav.id}
                className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-brand disabled:opacity-50"
              >
                {isActive
                  ? "Currently showing"
                  : switching === fav.id
                    ? "Switching…"
                    : "Show tides for this spot"}
              </button>
            </AccentCard>
          );
        })}
      </div>
    </div>
  );
}
