import { getTideForecast, getWeather } from "@/lib/environment";
import { getMarineConditions, getHourlyForecast, dailyForecastSummary } from "@/lib/marine";
import { sunTimes, formatTime } from "@/lib/sun";
import { moonPhase } from "@/lib/moonphase";
import { solunarDay } from "@/lib/solunar";
import { goodFishingDay } from "@/lib/goodFishingDay";
import { currentTide } from "@/lib/tides";
import {
  assessWaterTemperature,
  assessTidalCutoff,
  assessConditions,
  type Assessment,
} from "@/lib/safety-assessment";
import { hasLiveConditions, daysUntil } from "@/lib/trips";
import { localDate, parseLocalDate } from "@/lib/dates";
import { formatHeight, type UnitSystem } from "@/lib/units";
import { SolunarCard } from "@/components/SolunarCard";
import { AccentCard } from "@/components/AccentCard";

const SEVERITY_TONE: Record<Assessment["severity"], "falling" | "today" | "neutral"> = {
  danger: "falling",
  caution: "today",
  info: "neutral",
};

/** Open-Meteo's hourly endpoint returns days 0–6 from today (forecast_days=7). */
const FORECAST_HORIZON_DAYS = 6;

/**
 * Conditions for one trip, on its own date.
 *
 * Split into three tiers by what's actually knowable that far out. Tide predictions,
 * sun/moon and solunar periods are astronomical, computable for any date, so they show
 * regardless of how far out the trip is. Live weather, sea temperature and the safety
 * assessments built from them (lib/safety-assessment.ts) are "right now" readings with
 * no forecast behind them — see hasLiveConditions — so those only render for a trip
 * that's today. In between, a trip within the next week gets an actual forecast
 * (temperature range, wind, a representative icon) from Open-Meteo's hourly endpoint —
 * clearly labelled as a forecast rather than "conditions right now," and without the
 * safety cards, which need live sea state this doesn't provide. Past six days out, none
 * of that exists yet and the trip gets a plain note instead of a fabricated number.
 */
export async function TripConditionsPanel({
  lat,
  lng,
  tripDate,
  units = "metric",
}: {
  lat: number;
  lng: number;
  tripDate: string | null;
  units?: UnitSystem;
}) {
  const isLive = hasLiveConditions(tripDate);
  const targetDate = tripDate ? parseLocalDate(tripDate) : new Date();
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const nowMs = new Date().getTime();
  const tripDaysOut = daysUntil(tripDate);
  const forecastAvailable = !isLive && tripDaysOut !== null && tripDaysOut <= FORECAST_HORIZON_DAYS;

  const [tide, weather, marine, hourly] = await Promise.all([
    getTideForecast(lat, lng, targetDate),
    isLive ? getWeather(lat, lng) : Promise.resolve(null),
    isLive ? getMarineConditions(lat, lng) : Promise.resolve(null),
    forecastAvailable ? getHourlyForecast(lat, lng) : Promise.resolve(null),
  ]);
  const forecast = forecastAvailable && tripDate ? dailyForecastSummary(hourly, tripDate) : null;

  const sun = sunTimes(targetDate, lat, lng);
  const moon = moonPhase(tripDate ?? localDate());
  const solunar = solunarDay(dayStart, lat, lng);

  const assessments: Assessment[] = [];
  let gfd: { label: string; reasons: string[] } | null = null;

  if (isLive) {
    gfd = goodFishingDay(
      localDate(),
      tide ? { name: tide.name, distanceKm: tide.distanceKm, events: tide.events } : null,
      weather
    );
    const ct = tide && tide.events.length > 0 ? currentTide(tide.events, nowMs) : null;
    const wt = assessWaterTemperature(marine?.seaTemperatureC ?? null);
    const tc = ct ? assessTidalCutoff(ct.state, ct.next, ct.previous) : null;
    const cond = assessConditions(weather?.windKmh ?? null, marine?.waveHeightM ?? null);
    for (const a of [wt, tc, cond]) if (a) assessments.push(a);
  }

  // Only the events that fall on the trip's own day — getTideForecast fetches a
  // 3-day window starting at that date so there's context either side, but a trip
  // sheet for one day shouldn't show the next two days' tides too.
  const dayEvents =
    tide?.events.filter((e) => new Date(e.time).toDateString() === dayStart.toDateString()) ?? [];

  return (
    <div className="space-y-4">
      {isLive ? (
        <AccentCard
          tone="rising"
          title="Conditions right now"
          action={
            gfd && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold bg-accent-light text-accent-dark"
                title="An informal indicator only — not a scientific model."
              >
                {gfd.label} Fishing Day
              </span>
            )
          }
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted mb-1">Weather</p>
              {weather ? (
                <>
                  <p className="font-semibold">
                    {weather.temperatureC !== null ? `${Math.round(weather.temperatureC)}°C` : "—"}
                    {weather.condition ? ` · ${weather.condition}` : ""}
                  </p>
                  {weather.windKmh !== null && (
                    <p className="text-muted">
                      Wind {weather.windDirection ?? ""} {Math.round(weather.windKmh)} km/h
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted">Unavailable right now</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Sea</p>
              {marine?.seaTemperatureC !== null && marine?.seaTemperatureC !== undefined ? (
                <p className="font-semibold">{marine.seaTemperatureC.toFixed(1)}°C</p>
              ) : (
                <p className="text-muted">No marine data here</p>
              )}
              {marine?.waveHeightM !== null && marine?.waveHeightM !== undefined && (
                <p className="text-muted">{formatHeight(marine.waveHeightM, units)} seas</p>
              )}
            </div>
          </div>
          {gfd && gfd.reasons.length > 0 && (
            <p className="mt-3 text-xs text-muted border-t border-border pt-2">{gfd.reasons.join(" · ")}</p>
          )}
        </AccentCard>
      ) : forecast ? (
        <AccentCard tone="neutral" title={`Forecast — ${tripDaysOut} day${tripDaysOut === 1 ? "" : "s"} out`}>
          <p className="text-sm">
            <span className="text-lg align-middle">{forecast.emoji}</span>{" "}
            {forecast.maxTempC !== null && forecast.minTempC !== null ? (
              <span className="font-semibold">
                {Math.round(forecast.maxTempC)}° / {Math.round(forecast.minTempC)}°C
              </span>
            ) : (
              <span className="text-muted">Temperature unavailable</span>
            )}
            {forecast.maxWindKmh !== null && (
              <span className="text-muted"> · wind up to {Math.round(forecast.maxWindKmh)} km/h</span>
            )}
          </p>
          <p className="mt-2 text-xs text-muted">
            A forecast, not a live reading — sea temperature, wave height and the safety
            cards below will show once your trip is today.
          </p>
        </AccentCard>
      ) : (
        <AccentCard tone="neutral" title="Conditions">
          <p className="text-sm text-muted">
            No forecast reaches this far out yet — it&apos;s {tripDaysOut} days out. Tide, sun,
            moon and solunar below are accurate for {tripDate}; check back within a week of
            your trip for weather.
          </p>
        </AccentCard>
      )}

      {assessments.map((a) => (
        <AccentCard key={a.id} tone={SEVERITY_TONE[a.severity]} title={a.headline}>
          <p className="text-sm text-muted">{a.detail}</p>
        </AccentCard>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AccentCard tone="neutral" title="Sun &amp; Moon">
          <p className="font-semibold text-sm">
            ☀️ {formatTime(sun.sunrise, "America/Moncton")} – {formatTime(sun.sunset, "America/Moncton")}
          </p>
          <p className="text-sm text-muted">
            {moon.emoji} {moon.name}
          </p>
        </AccentCard>
        <SolunarCard solunar={solunar} nowMs={nowMs} />
      </div>

      <AccentCard tone="neutral" title="Tide">
        {dayEvents.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {dayEvents.map((e) => (
              <li key={e.time} className="flex items-center gap-3">
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    e.type === "high" ? "bg-brand-light text-brand-dark" : "bg-catches-light text-catches"
                  }`}
                >
                  {e.type === "high" ? "H" : "L"}
                </span>
                <span className="font-semibold tabular-nums">
                  {new Date(e.time).toLocaleTimeString("en-CA", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/Moncton",
                  })}
                </span>
                <span className="text-muted tabular-nums">{formatHeight(e.heightM, units)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No nearby tide station, or no predictions for this date.</p>
        )}
        {tide && <p className="mt-2 text-[11px] text-muted">{tide.name} tide station (~{tide.distanceKm} km away)</p>}
      </AccentCard>

      <p className="text-[11px] text-muted">
        Informal indicators only, not validated models — conditions can change fast on the
        water. Always check the marine forecast and fish safely.
      </p>
    </div>
  );
}
