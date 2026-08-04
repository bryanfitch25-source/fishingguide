import { AccentCard, TideStatePill } from "./AccentCard";
import { formatCountdown, type CurrentTide } from "@/lib/tides";
import { formatHeight, formatSpeed, formatTemperature, type UnitSystem } from "@/lib/units";
import type { WeatherConditions } from "@/lib/environment";

// The headline card: where the tide is right now, which way it's going, and what's next.
//
// The "next" line is derived from the same event list the 7-day forecast below it
// renders, so the two can't disagree — a mismatch there ("next high at 8:45" over a
// list whose first entry says 9:10") is the kind of thing that quietly destroys trust
// in the whole screen.
export function TideNowCard({
  stationName,
  current,
  weather,
  units,
  timeZone = "America/Moncton",
  nowMs,
}: {
  stationName: string;
  current: CurrentTide | null;
  weather: WeatherConditions | null;
  units: UnitSystem;
  timeZone?: string;
  nowMs: number;
}) {
  if (!current) {
    return (
      <AccentCard tone="neutral" title="Current tide">
        <p className="text-sm text-muted">
          No current reading for {stationName} — the prediction window doesn&apos;t cover right now.
        </p>
      </AccentCard>
    );
  }

  const timeOf = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone });

  return (
    <AccentCard
      tone={current.state === "falling" ? "falling" : "rising"}
      title={stationName}
      action={<TideStatePill state={current.state} />}
    >
      <p className="text-4xl font-bold tracking-tight text-brand-dark">
        {formatHeight(current.heightM, units)}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        as of{" "}
        {new Date(nowMs).toLocaleTimeString("en-CA", {
          hour: "numeric",
          minute: "2-digit",
          timeZone,
        })}{" "}
        · interpolated between predicted high and low water
      </p>

      {current.next && (
        <p className="mt-3 text-sm">
          <span className="font-semibold capitalize">Next: {current.next.type} tide</span>{" "}
          <span className="text-muted">
            at {timeOf(current.next.time)} · {formatCountdown(new Date(current.next.time).getTime(), nowMs)} ·{" "}
            {formatHeight(current.next.heightM, units)}
          </span>
        </p>
      )}

      {weather && (
        <p className="mt-3 border-t border-border pt-3 text-sm text-muted">
          {weather.condition ?? "Current conditions"} ·{" "}
          {formatTemperature(weather.temperatureC, units)}
          {weather.windKmh !== null && (
            <>
              {" "}
              · Wind {weather.windDirection ?? ""} {formatSpeed(weather.windKmh, units)}
            </>
          )}
        </p>
      )}
    </AccentCard>
  );
}
