// A fun, informal "Good Fishing Day" indicator — NOT a scientific or validated model.
// It combines a few things anglers commonly go by (moon phase, proximity to a tide
// change, barometric pressure trend) into a rough score, purely for a bit of context.
// Always shown with a disclaimer; never treated as advice, same principle the app
// already applies to regulations ("always confirm with DFO directly").

import { moonPhase } from "./moonphase";
import type { NearestTideStation } from "./environment";
import type { WeatherConditions } from "./environment";

export interface GoodFishingDay {
  score: number; // 0-3
  label: "Fair" | "Good" | "Great";
  reasons: string[];
}

export function goodFishingDay(
  dateStr: string,
  tide: NearestTideStation | null,
  weather: WeatherConditions | null
): GoodFishingDay {
  let score = 0;
  const reasons: string[] = [];

  // Folklore: activity is often higher within ~2 hours of a full or new moon's
  // stronger tidal pull, and around the new/full phases themselves.
  const moon = moonPhase(dateStr);
  if (moon.name === "Full Moon" || moon.name === "New Moon") {
    score += 1;
    reasons.push(`${moon.emoji} ${moon.name} — stronger tidal pull`);
  }

  // Folklore: fish often feed more actively as the tide is changing (moving water).
  if (tide?.events?.length) {
    const now = Date.now();
    const closest = tide.events.reduce((best, e) => {
      const diff = Math.abs(new Date(e.time).getTime() - now);
      const bestDiff = Math.abs(new Date(best.time).getTime() - now);
      return diff < bestDiff ? e : best;
    });
    const hoursAway = Math.abs(new Date(closest.time).getTime() - now) / 3600000;
    if (hoursAway <= 2) {
      score += 1;
      reasons.push(`🌊 Within 2 hours of ${closest.type} tide at ${tide.name}`);
    }
  }

  // Folklore: steady or falling pressure ahead of weather is often better than a
  // sharp rise after a front's already passed.
  if (weather?.pressureTendency === "falling" || weather?.pressureTendency === "steady") {
    score += 1;
    const icon = weather.pressureTendency === "falling" ? "📉" : "➖";
    reasons.push(`${icon} Barometric pressure ${weather.pressureTendency}`);
  }

  const label = score >= 3 ? "Great" : score >= 1 ? "Good" : "Fair";
  return { score, label, reasons };
}
