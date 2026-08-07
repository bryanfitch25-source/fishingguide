// Turns today's conditions into a specific answer, rather than general advice.
//
// This is the reason the safety section belongs inside this app instead of a bookmark.
// A printed pamphlet can tell you cold water is dangerous below 15°C. The app already
// knows the water off your station is 9.4°C, that the tide turned forty minutes ago, and
// that it has five and a half metres to climb before the next high — so it can tell you
// what that means for the next two hours, where you actually are.
//
// Every function here degrades to null rather than guessing. A missing sea temperature
// has to read as "not known" and not as "fine", because the whole point is that someone
// might act on it.

import type { TideEvent, TideState } from "./tides";
import { COLD_WATER_THRESHOLD_C } from "./safety";

export type Severity = "info" | "caution" | "danger";

export interface Assessment {
  id: string;
  severity: Severity;
  headline: string;
  detail: string;
}

/**
 * What the water temperature means for someone who goes into it.
 *
 * The bands come from the physiology rather than from round numbers: cold shock response
 * is strongest between about 10 and 15°C and is still significant up to 20°C, which is
 * why Transport Canada's own figure — 94% of Canadian boaters who drowned were in water
 * below 20°C — is the one worth quoting. Maritime inshore water sits in the worst part of
 * that range for most of the fishing season.
 */
export function assessWaterTemperature(seaTempC: number | null): Assessment | null {
  if (seaTempC === null || !Number.isFinite(seaTempC)) return null;
  const t = Math.round(seaTempC * 10) / 10;

  if (t < 5) {
    return {
      id: "water-temp",
      severity: "danger",
      headline: `${t}°C — cold shock is near-certain`,
      detail:
        "Going in unprepared means an involuntary gasp and hyperventilation you cannot override. If your head is under when it happens, that is the whole story. A PFD is what decides this, not swimming ability.",
    };
  }
  if (t < 10) {
    return {
      id: "water-temp",
      severity: "danger",
      headline: `${t}°C — full cold shock range`,
      detail:
        "This is the band where cold shock is most severe. Expect roughly a minute before you can control your breathing and about ten before your hands stop working. Wear the PFD rather than stowing it.",
    };
  }
  if (t < COLD_WATER_THRESHOLD_C) {
    return {
      id: "water-temp",
      severity: "caution",
      headline: `${t}°C — cold enough to incapacitate`,
      detail:
        "Transport Canada advises thermal protection below 15°C. It feels survivable from the boat and is not: the gasp reflex and loss of grip both still happen here.",
    };
  }
  if (t < 20) {
    return {
      id: "water-temp",
      severity: "caution",
      headline: `${t}°C — still the range most drownings happen in`,
      detail:
        "About 94% of Canadian boaters who drowned were in water below 20°C. Comfortable for a swim off the boat; not comfortable for an unplanned hour in it.",
    };
  }
  return {
    id: "water-temp",
    severity: "info",
    headline: `${t}°C — warm for these waters`,
    detail:
      "Above the range where cold shock dominates. Distance from shore, fatigue and whether anyone knows where you are now matter more than temperature.",
  };
}

/**
 * How long until the water reaches you, for anyone standing on something that floods.
 *
 * The Maritimes are the place in the world where this matters most. The Bay of Fundy
 * exposes flats kilometres wide and refills them faster than a person walks; the
 * Northumberland Strait bars and Minas Basin flats catch people every year. The app knows
 * the tide, so it can answer the actual question — how long have I got — instead of
 * advising vigilance in general.
 *
 * Deliberately reports the time to the *turn* rather than to the water's edge. Where the
 * water is is a function of the ground you're standing on, which the app does not know;
 * when it starts coming is a function of the tide, which it does.
 */
export function assessTidalCutoff(
  state: TideState,
  next: TideEvent | null,
  previous: TideEvent | null,
  nowMs = Date.now()
): Assessment | null {
  if (!next) return null;
  const minutesToNext = Math.round((new Date(next.time).getTime() - nowMs) / 60000);
  if (minutesToNext < 0) return null;

  const rangeM =
    previous && next ? Math.abs(next.heightM - previous.heightM) : null;
  // A big range is what makes a flat lethal rather than inconvenient: the same hour of
  // flood moves the water's edge much further when there's ten metres to fill.
  const bigRange = rangeM !== null && rangeM >= 4;

  if (state === "rising") {
    const hrs = Math.floor(minutesToNext / 60);
    const mins = minutesToNext % 60;
    const when = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    return {
      id: "tide-cutoff",
      severity: minutesToNext < 120 ? "danger" : "caution",
      headline: `Flooding now — high water in ${when}`,
      detail: bigRange
        ? `The tide is coming in and has about ${rangeM!.toFixed(1)} m to rise. On a flat or a bar that fills from behind you long before it reaches your feet. Fix your exit route now and watch it, not the water in front of you.`
        : "The tide is coming in. If you walked out to where you're standing, the way back is the thing to keep an eye on.",
    };
  }

  if (state === "falling") {
    const hrs = Math.floor(minutesToNext / 60);
    const mins = minutesToNext % 60;
    const when = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    return {
      id: "tide-cutoff",
      severity: "info",
      headline: `Ebbing — low water in ${when}`,
      detail:
        "Ground is opening up rather than closing. The catch is that it all has to be walked back across, and the flood after low water is when people get caught.",
    };
  }

  return null;
}

/** Wind and sea state, judged for a small open boat rather than for a ship. */
export function assessConditions(
  windKmh: number | null,
  waveHeightM: number | null
): Assessment | null {
  const w = windKmh !== null && Number.isFinite(windKmh) ? windKmh : null;
  const h = waveHeightM !== null && Number.isFinite(waveHeightM) ? waveHeightM : null;
  if (w === null && h === null) return null;

  const parts: string[] = [];
  if (w !== null) parts.push(`${Math.round(w)} km/h wind`);
  if (h !== null) parts.push(`${h.toFixed(1)} m seas`);
  const summary = parts.join(", ");

  // Thresholds set for a small open boat, which is what most of this app's readers fish
  // from. 25 km/h raises a short steep chop in the Strait; 1 m is a lot of water when the
  // freeboard is 60 cm.
  if ((w !== null && w >= 40) || (h !== null && h >= 1.5)) {
    return {
      id: "conditions",
      severity: "danger",
      headline: `${summary} — too much for a small open boat`,
      detail: "Fish from shore today, or pick somewhere with a lee. This is the kind of day boats get into trouble on the way back, not on the way out.",
    };
  }
  if ((w !== null && w >= 25) || (h !== null && h >= 1)) {
    return {
      id: "conditions",
      severity: "caution",
      headline: `${summary} — workable, with a plan`,
      detail: "Fine near shore in a lee, unpleasant in an open crossing. Check the forecast for the trend: wind against an ebbing tide stands the sea up quickly.",
    };
  }
  return {
    id: "conditions",
    severity: "info",
    headline: `${summary} — settled`,
    detail: "Nothing in the wind or sea to argue with. Cold water doesn't care about a calm day.",
  };
}

/** Highest severity present, for the summary strip. */
export function overallSeverity(assessments: (Assessment | null)[]): Severity {
  const present = assessments.filter((a): a is Assessment => a !== null);
  if (present.some((a) => a.severity === "danger")) return "danger";
  if (present.some((a) => a.severity === "caution")) return "caution";
  return "info";
}
