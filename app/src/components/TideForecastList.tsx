import { AccentCard } from "./AccentCard";
import { groupByDay, type TideEvent } from "@/lib/tides";
import { hourlyAt, type HourlyPoint } from "@/lib/marine";
import { moonPhase } from "@/lib/moonphase";
import { formatHeight, formatSpeed, formatTemperature, type UnitSystem } from "@/lib/units";
import type { WeatherConditions } from "@/lib/environment";

// Every upcoming high and low for the next week, grouped into a card per day.
//
// Today's card carries the amber "today" accent so it's findable at a glance in a list
// this long, and each tide row picks up the hourly forecast for its own hour — the
// weather at 5am matters more than the daily summary when that's when the tide turns.

function dayLabel(dayKey: string, todayKey: string, tomorrowKey: string): string {
  if (dayKey === todayKey) return "Today";
  if (dayKey === tomorrowKey) return "Tomorrow";
  // dayKey is YYYY-MM-DD; parse as local noon so the label can't slip a day.
  return new Date(`${dayKey}T12:00:00`).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function TideForecastList({
  events,
  weather,
  hourly,
  units,
  timeZone = "America/Moncton",
  nowMs,
}: {
  events: TideEvent[];
  weather: WeatherConditions | null;
  hourly: Map<string, HourlyPoint> | null;
  units: UnitSystem;
  timeZone?: string;
  nowMs: number;
}) {
  const upcoming = events.filter((e) => new Date(e.time).getTime() >= nowMs);
  if (upcoming.length === 0) {
    return (
      <AccentCard tone="neutral" title="7-day tide forecast">
        <p className="text-sm text-muted">
          No upcoming tide predictions for this station in the next seven days.
        </p>
      </AccentCard>
    );
  }

  const days = groupByDay(upcoming, timeZone);
  const todayKey = new Date(nowMs).toLocaleDateString("en-CA", { timeZone });
  const tomorrowKey = new Date(nowMs + 86400000).toLocaleDateString("en-CA", { timeZone });

  return (
    <section className="space-y-3">
      <h2 className="font-bold text-brand-dark">7-day tide forecast</h2>
      {days.map(({ dayKey, events: dayEvents }) => {
        const isToday = dayKey === todayKey;
        const moon = moonPhase(dayKey);
        return (
          <AccentCard
            key={dayKey}
            tone={isToday ? "today" : "neutral"}
            title={dayLabel(dayKey, todayKey, tomorrowKey)}
            action={
              <span className="text-xs text-muted">
                {moon.emoji} {moon.name}
                {isToday && weather?.windKmh !== null && weather?.windKmh !== undefined && (
                  <> · {formatSpeed(weather.windKmh, units)}</>
                )}
              </span>
            }
          >
            <ul className="divide-y divide-border">
              {dayEvents.map((e) => {
                const hour = hourlyAt(hourly, e.time);
                return (
                  <li key={e.time} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        e.type === "high"
                          ? "bg-brand-light text-brand-dark"
                          : "bg-catches-light text-catches"
                      }`}
                      title={e.type === "high" ? "High water" : "Low water"}
                    >
                      {e.type === "high" ? "H" : "L"}
                    </span>
                    <span className="w-20 shrink-0 font-semibold tabular-nums">
                      {new Date(e.time).toLocaleTimeString("en-CA", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone,
                      })}
                    </span>
                    <span className="text-muted tabular-nums">{formatHeight(e.heightM, units)}</span>
                    {hour && (hour.emoji || hour.temperatureC !== null) && (
                      <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                        {hour.emoji} {formatTemperature(hour.temperatureC, units)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </AccentCard>
        );
      })}
    </section>
  );
}
