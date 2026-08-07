import { getActiveStationContext } from "@/lib/active-station";
import { currentTide } from "@/lib/tides";
import { getMarineConditions } from "@/lib/marine";
import { getWeather } from "@/lib/environment";
import { SafetyClient } from "@/components/SafetyClient";
import {
  assessConditions,
  assessTidalCutoff,
  assessWaterTemperature,
  type Assessment,
} from "@/lib/safety-assessment";

export const metadata = {
  title: "Safety — Maritime Angler",
  description:
    "Cold water, required equipment, float plans, distress calls and ice — read against the conditions where you actually fish.",
};

// Every source here is already fetched elsewhere in the app; this page just asks a
// different question of the same data. Nothing new is polled, and each fetch is allowed
// to fail on its own — a missing sea temperature should cost one card, not the page.
export default async function SafetyPage() {
  const { station, revertedFrom } = await getActiveStationContext();
  void revertedFrom;

  const lat = station?.lat ?? 46.2283;
  const lng = station?.lng ?? -64.5397;
  const name = station?.name ?? "Shediac Bay";

  const [marine, weather, events] = await Promise.all([
    getMarineConditions(lat, lng),
    getWeather(lat, lng),
    (async () => {
      const ctx = await getActiveStationContext();
      return ctx.events;
    })(),
  ]);

  // `new Date().getTime()` rather than `Date.now()`: the purity lint flags the latter as
  // an impure call during render, and the rest of the app already reads the clock this
  // way (see tides/page.tsx). Read once and passed down, so every card agrees on "now".
  const now = new Date().getTime();
  const tide = events && events.length ? currentTide(events, now) : null;

  const assessments = [
    assessWaterTemperature(marine?.seaTemperatureC ?? null),
    tide ? assessTidalCutoff(tide.state, tide.next, tide.previous, now) : null,
    assessConditions(weather?.windKmh ?? null, marine?.waveHeightM ?? null),
  ].filter((a): a is Assessment => a !== null);

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Safety</h1>
        <p className="max-w-2xl text-muted">
          What the water is doing today, what you&apos;re required to carry, and what to say when it
          goes wrong. Nearly everyone who drowns here is in cold water, close to shore, without a
          PFD on.
        </p>
      </div>
      <SafetyClient
        assessments={assessments}
        stationName={name}
        hasLiveData={marine !== null || weather !== null || tide !== null}
        generatedAt={new Date(now).toISOString()}
      />
    </div>
  );
}
