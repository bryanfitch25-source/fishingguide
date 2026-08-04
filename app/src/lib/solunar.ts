// Solunar feeding periods, computed locally rather than fetched.
//
// Slack Water pulled moonrise/moonset/transit from the US Naval Observatory API, which
// costs one network call per date and leaves the card blank when the network is down.
// The same numbers come out of standard lunar position maths, so this computes them —
// no API, no key, works offline in the Home Screen app, and available for any date
// rather than today only.
//
// The theory: fish feed more actively when the moon is overhead or underfoot (major
// periods) and around moonrise/moonset (minor periods). Like the moon phase already in
// the app, this is angling folklore rather than a validated model, and the UI says so.
//
// Position maths follows Meeus's low-precision lunar formulae — accurate to a few
// arcminutes, which is far finer than the hour-plus windows built on top of it.

const RAD = Math.PI / 180;
const OBLIQUITY = 23.4397 * RAD; // Earth's axial tilt
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

/** Days since the J2000.0 epoch. */
function toDays(ms: number): number {
  return (ms - J2000_MS) / 86400000;
}

interface EquatorialPosition {
  rightAscension: number; // radians
  declination: number; // radians
}

function moonEquatorial(d: number): EquatorialPosition {
  const meanLongitude = (218.316 + 13.176396 * d) * RAD;
  const meanAnomaly = (134.963 + 13.064993 * d) * RAD;
  const argOfLatitude = (93.272 + 13.22935 * d) * RAD;

  const eclipticLongitude = meanLongitude + 6.289 * RAD * Math.sin(meanAnomaly);
  const eclipticLatitude = 5.128 * RAD * Math.sin(argOfLatitude);

  return {
    rightAscension: Math.atan2(
      Math.sin(eclipticLongitude) * Math.cos(OBLIQUITY) -
        Math.tan(eclipticLatitude) * Math.sin(OBLIQUITY),
      Math.cos(eclipticLongitude)
    ),
    declination: Math.asin(
      Math.sin(eclipticLatitude) * Math.cos(OBLIQUITY) +
        Math.cos(eclipticLatitude) * Math.sin(OBLIQUITY) * Math.sin(eclipticLongitude)
    ),
  };
}

/** Greenwich mean sidereal time, in radians. */
function siderealTime(d: number, lngRad: number): number {
  return (280.16 + 360.9856235 * d) * RAD + lngRad;
}

/** Moon altitude above the horizon, in radians. Negative means below. */
function moonAltitude(ms: number, lat: number, lng: number): number {
  const d = toDays(ms);
  const { rightAscension, declination } = moonEquatorial(d);
  const hourAngle = siderealTime(d, lng * RAD) - rightAscension;
  const latRad = lat * RAD;
  return Math.asin(
    Math.sin(latRad) * Math.sin(declination) +
      Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle)
  );
}

/**
 * Hour angle of the moon, normalised to [-π, π). Zero at upper transit (moon due south
 * and highest), ±π at lower transit (underfoot).
 */
function moonHourAngle(ms: number, lng: number): number {
  const d = toDays(ms);
  const { rightAscension } = moonEquatorial(d);
  let h = siderealTime(d, lng * RAD) - rightAscension;
  h = ((h + Math.PI) % (2 * Math.PI)) - Math.PI;
  return h < -Math.PI ? h + 2 * Math.PI : h;
}

export interface SolunarPeriod {
  kind: "major" | "minor";
  /** What the window is centred on, for the UI to label it. */
  cause: "overhead" | "underfoot" | "moonrise" | "moonset";
  start: Date;
  end: Date;
}

export interface SolunarDay {
  moonrise: Date | null;
  moonset: Date | null;
  /** Moon overhead (upper transit) and underfoot (lower transit). */
  overhead: Date | null;
  underfoot: Date | null;
  periods: SolunarPeriod[];
}

// Standard geometric altitude for moonrise/set: the moon's centre sits slightly below
// the true horizon at the moment its limb appears, once refraction and parallax are
// accounted for.
const RISE_SET_ALTITUDE = 0.125 * RAD;

const MAJOR_HALF_WIDTH_MS = 60 * 60000; // 2-hour window
const MINOR_HALF_WIDTH_MS = 30 * 60000; // 1-hour window

/**
 * Refines a crossing to the minute by bisection. Coarse scanning finds the interval;
 * this pins down where inside it the crossing actually happened.
 */
function refine(
  startMs: number,
  endMs: number,
  test: (ms: number) => number,
  iterations = 12
): number {
  let lo = startMs;
  let hi = endMs;
  const loSign = Math.sign(test(lo));
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(test(mid)) === loSign) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Solunar periods for one calendar day at a location.
 *
 * `dayStart`/`dayEnd` bound the local calendar day. Moonrise, moonset and the transits
 * each happen roughly 50 minutes later than the day before, so on about one day in 25
 * a given event falls outside the day entirely — those come back null, and the UI says
 * "no minor period today" rather than rendering a broken-looking empty card.
 */
export function solunarDay(dayStart: Date, lat: number, lng: number): SolunarDay {
  const startMs = dayStart.getTime();
  const endMs = startMs + 86400000;
  const stepMs = 10 * 60000; // 10-minute coarse scan

  let moonrise: Date | null = null;
  let moonset: Date | null = null;
  let overhead: Date | null = null;
  let underfoot: Date | null = null;

  const altitudeAboveHorizon = (ms: number) => moonAltitude(ms, lat, lng) - RISE_SET_ALTITUDE;

  let prevMs = startMs;
  let prevAlt = altitudeAboveHorizon(prevMs);
  let prevHourAngle = moonHourAngle(prevMs, lng);

  for (let ms = startMs + stepMs; ms <= endMs; ms += stepMs) {
    const alt = altitudeAboveHorizon(ms);
    if (prevAlt < 0 && alt >= 0 && !moonrise) {
      moonrise = new Date(refine(prevMs, ms, altitudeAboveHorizon));
    } else if (prevAlt >= 0 && alt < 0 && !moonset) {
      moonset = new Date(refine(prevMs, ms, altitudeAboveHorizon));
    }

    // Upper transit: hour angle sweeps through zero going negative -> positive.
    const hourAngle = moonHourAngle(ms, lng);
    if (prevHourAngle < 0 && hourAngle >= 0 && Math.abs(hourAngle - prevHourAngle) < Math.PI) {
      if (!overhead) overhead = new Date(refine(prevMs, ms, (m) => moonHourAngle(m, lng)));
    }
    // Lower transit: the wrap from +π to -π.
    if (prevHourAngle > 0 && hourAngle < 0 && Math.abs(hourAngle - prevHourAngle) > Math.PI) {
      if (!underfoot) underfoot = new Date((prevMs + ms) / 2);
    }

    prevMs = ms;
    prevAlt = alt;
    prevHourAngle = hourAngle;
  }

  const periods: SolunarPeriod[] = [];
  const addPeriod = (
    kind: SolunarPeriod["kind"],
    cause: SolunarPeriod["cause"],
    centre: Date | null,
    halfWidthMs: number
  ) => {
    if (!centre) return;
    periods.push({
      kind,
      cause,
      start: new Date(centre.getTime() - halfWidthMs),
      end: new Date(centre.getTime() + halfWidthMs),
    });
  };

  addPeriod("major", "overhead", overhead, MAJOR_HALF_WIDTH_MS);
  addPeriod("major", "underfoot", underfoot, MAJOR_HALF_WIDTH_MS);
  addPeriod("minor", "moonrise", moonrise, MINOR_HALF_WIDTH_MS);
  addPeriod("minor", "moonset", moonset, MINOR_HALF_WIDTH_MS);
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  return { moonrise, moonset, overhead, underfoot, periods };
}

export const PERIOD_LABEL: Record<SolunarPeriod["cause"], string> = {
  overhead: "Moon overhead",
  underfoot: "Moon underfoot",
  moonrise: "Moonrise",
  moonset: "Moonset",
};

/** Whether a moment falls inside any period — drives the "active now" highlight. */
export function activePeriod(periods: SolunarPeriod[], atMs = Date.now()): SolunarPeriod | null {
  return (
    periods.find((p) => atMs >= p.start.getTime() && atMs <= p.end.getTime()) ?? null
  );
}
