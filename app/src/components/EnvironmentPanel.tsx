import { getTideForecast, getWeather } from "@/lib/environment";
import { sunTimes, formatTime } from "@/lib/sun";
import { moonPhase } from "@/lib/moonphase";
import { goodFishingDay } from "@/lib/goodFishingDay";

// Renders live-ish (cached, see lib/environment.ts) conditions for a specific point:
// current weather, next few tide events, sunrise/sunset, and the informal "Good
// Fishing Day" read-out. Server component — safe to drop into any page with a
// lat/lng, and used by /api/environment for client components that only have a
// browser-geolocation point (NearMe).
export async function EnvironmentPanel({ lat, lng }: { lat: number; lng: number }) {
  const today = new Date();
  const [tide, weather] = await Promise.all([getTideForecast(lat, lng), getWeather(lat, lng)]);
  const sun = sunTimes(today, lat, lng);
  const moon = moonPhase(today.toISOString().slice(0, 10));
  const gfd = goodFishingDay(today.toISOString().slice(0, 10), tide, weather);

  const nowMs = today.getTime();
  const upcomingTides = tide?.events?.filter((e) => new Date(e.time).getTime() >= nowMs).slice(0, 4) ?? [];

  return (
    <div className="rounded-xl border border-border bg-surface card-lift p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-brand-dark">Conditions Right Now</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            gfd.label === "Great"
              ? "bg-green-100 text-green-800"
              : gfd.label === "Good"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-700"
          }`}
          title="An informal indicator only — not a scientific model. Always fish safely regardless of conditions."
        >
          {gfd.label} Fishing Day
        </span>
      </div>

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
              {weather.pressureTendency && (
                <p className="text-muted capitalize">Pressure {weather.pressureTendency}</p>
              )}
              <p className="text-[11px] text-muted mt-1">
                {weather.stationName} (~{weather.distanceKm} km away)
              </p>
            </>
          ) : (
            <p className="text-muted">Unavailable right now</p>
          )}
        </div>

        <div>
          <p className="text-xs text-muted mb-1">Sun &amp; Moon</p>
          <p className="font-semibold">
            ☀️ {formatTime(sun.sunrise, "America/Moncton")} – {formatTime(sun.sunset, "America/Moncton")}
          </p>
          <p className="text-muted">
            {moon.emoji} {moon.name}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-muted mb-1">Tide</p>
          {tide && upcomingTides.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-3">
                {upcomingTides.map((e) => (
                  <span key={e.time} className="text-sm">
                    <span className="font-semibold capitalize">{e.type}</span>{" "}
                    <span className="text-muted">
                      {new Date(e.time).toLocaleTimeString("en-CA", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "America/Moncton",
                      })}
                    </span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted mt-1">
                {tide.name} tide station (~{tide.distanceKm} km away)
              </p>
            </>
          ) : (
            <p className="text-muted">No nearby tide station</p>
          )}
        </div>
      </div>

      {gfd.reasons.length > 0 && (
        <p className="mt-3 text-xs text-muted border-t border-border pt-2">{gfd.reasons.join(" · ")}</p>
      )}
      <p className="mt-2 text-[11px] text-muted">
        Informal indicator only, not a validated model — conditions can change fast on the
        water, always check the marine forecast and fish safely.
      </p>
    </div>
  );
}
