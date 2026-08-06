import Link from "next/link";
import { getActiveStationContext } from "@/lib/active-station";
import { currentTide, chsStationUrl } from "@/lib/tides";
import { getWeather } from "@/lib/environment";
import { getMarineConditions, getHourlyForecast } from "@/lib/marine";
import { solunarDay } from "@/lib/solunar";
import { goodFishingDay } from "@/lib/goodFishingDay";
import { sunTimes, formatTime } from "@/lib/sun";
import { moonPhase } from "@/lib/moonphase";
import { AccentCard } from "@/components/AccentCard";
import { TideNowCard } from "@/components/TideNowCard";
import { TideCurve } from "@/components/TideCurve";
import { MarineCard } from "@/components/MarineCard";
import { SolunarCard } from "@/components/SolunarCard";
import { TideForecastList } from "@/components/TideForecastList";
import { StationDistance } from "@/components/StationDistance";
import { localDate } from "@/lib/dates";

export const metadata = {
  title: "Tides — Maritime Angler",
  description:
    "Live tide predictions, marine conditions and solunar feeding periods for New Brunswick, Nova Scotia and PEI.",
};

const TIME_ZONE = "America/Moncton";

export default async function TidesPage() {
  const { station, units, events, revertedFrom, stationListFailed } =
    await getActiveStationContext();

  // Tide predictions are the one thing this page can't do without. Everything else is
  // explicitly bonus and each piece is allowed to fail on its own.
  if (!station) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-3">Tides</h1>
        <AccentCard tone="falling" title="Tide service unavailable">
          <p className="text-sm text-muted">
            {stationListFailed
              ? "The Canadian Hydrographic Service station list couldn't be reached, so there's no station to show tides for."
              : "No operating tide station could be resolved."}{" "}
            You can check predictions directly at{" "}
            <a
              href="https://www.tides.gc.ca/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              tides.gc.ca
            </a>
            .
          </p>
        </AccentCard>
      </div>
    );
  }

  // All four remaining sources fetched concurrently — a slow network then costs the
  // single slowest request rather than the sum of them.
  const [weather, marine, hourly] = await Promise.all([
    getWeather(station.lat, station.lng),
    getMarineConditions(station.lat, station.lng),
    getHourlyForecast(station.lat, station.lng),
  ]);

  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const current = events ? currentTide(events, nowMs) : null;
  const solunar = solunarDay(todayStart, station.lat, station.lng);
  const sun = sunTimes(now, station.lat, station.lng);
  const moon = moonPhase(localDate(now));

  // Good Fishing Day keeps working from the same inputs as before; the tide shape it
  // wants matches what getActiveStationContext already loaded.
  const gfd = goodFishingDay(
    localDate(now),
    events ? { name: station.name, distanceKm: 0, events } : null,
    weather
  );

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10 space-y-3 sm:space-y-5">
      {/* On a phone the title, station name and two buttons stacked into their own
          full-width panel pushed the actual tide reading below the fold. Sharing one
          row on small screens keeps the headline card visible on load. */}
      <header className="scene-panel rounded-2xl p-4 sm:p-6">
        {/* No wrap: with wrapping on, the station name's natural width pushed the two
            buttons onto a second line and cost ~50px of a 715px viewport. Letting the
            name truncate instead keeps the whole header to one row. */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark leading-tight">Tides</h1>
            {/* Truncation moved onto the name alone. It used to be on the whole line,
                which would have swallowed the distance and — worse — the "somewhere
                closer" link, leaving an element that is there but unreachable. The name
                still gives up its tail first; everything after it stays clickable. */}
            <p className="text-sm sm:text-base text-muted">
              <span className="inline-block max-w-full truncate align-bottom">
                {station.name}
                {/* The "default station" qualifier is the first thing to go when space is
                    tight — truncating it mid-word reads as a glitch, and the Station
                    button sitting beside it already says one can be chosen. */}
                {station.isDefault && <span className="hidden sm:inline"> — default station</span>}
              </span>
              <StationDistance
                stationId={station.id}
                stationLat={station.lat}
                stationLng={station.lng}
                units={units}
              />
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/spots"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-brand transition"
            >
              ⭐ Spots
            </Link>
            <Link
              href="/settings"
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-brand transition"
            >
              Station
            </Link>
          </div>
        </div>
      </header>

      {revertedFrom && (
        <AccentCard tone="today" title="Station changed automatically">
          <p className="text-sm text-muted">
            <strong>{revertedFrom}</strong> returned no predictions for the next seven days,
            which usually means it&apos;s been discontinued. Switched to{" "}
            <strong>{station.name}</strong>. You can pick a different one from{" "}
            <Link href="/settings" className="text-brand underline">
              settings
            </Link>
            .
          </p>
        </AccentCard>
      )}

      {events === null ? (
        <AccentCard tone="falling" title="Tide predictions unavailable">
          <p className="text-sm text-muted">
            Couldn&apos;t reach the Canadian Hydrographic Service for {station.name} just now.
            View the same station&apos;s predictions directly at{" "}
            <a
              href={chsStationUrl(station.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline"
            >
              tides.gc.ca
            </a>
            .
          </p>
        </AccentCard>
      ) : (
        <>
          <TideNowCard
            stationName={station.name}
            current={current}
            weather={weather}
            units={units}
            timeZone={TIME_ZONE}
            nowMs={nowMs}
          />

          <AccentCard
            tone="neutral"
            title="Next 24 hours"
            action={
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  gfd.label === "Great"
                    ? "bg-success-light text-success"
                    : gfd.label === "Good"
                      ? "bg-accent-light text-accent-dark"
                      : "bg-background text-muted"
                }`}
                title="An informal indicator only — not a scientific model."
              >
                {gfd.label} Fishing Day
              </span>
            }
          >
            <TideCurve events={events} units={units} timeZone={TIME_ZONE} nowMs={nowMs} />
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border pt-3 text-sm text-muted">
              <span>
                ☀️ {formatTime(sun.sunrise, TIME_ZONE)} – {formatTime(sun.sunset, TIME_ZONE)}
              </span>
              <span>
                {moon.emoji} {moon.name}
              </span>
              {weather?.pressureTendency && (
                <span className="capitalize">Pressure {weather.pressureTendency}</span>
              )}
            </div>
            {gfd.reasons.length > 0 && (
              <p className="mt-2 text-xs text-muted">{gfd.reasons.join(" · ")}</p>
            )}
          </AccentCard>

          <div className="grid gap-5 sm:grid-cols-2">
            <MarineCard marine={marine} units={units} />
            <SolunarCard solunar={solunar} timeZone={TIME_ZONE} nowMs={nowMs} />
          </div>

          <TideForecastList
            events={events}
            weather={weather}
            hourly={hourly}
            units={units}
            timeZone={TIME_ZONE}
            nowMs={nowMs}
          />
        </>
      )}

      <p className="text-[11px] text-muted">
        Tide predictions from the Canadian Hydrographic Service (IWLS) · weather from
        Environment Canada · marine forecast from Open-Meteo. Predictions only — not for
        navigation, and no substitute for the official marine forecast.
      </p>
    </div>
  );
}
