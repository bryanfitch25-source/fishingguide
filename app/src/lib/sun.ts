// Sunrise/sunset from lat/lng/date, computed locally (NOAA's standard solar position
// algorithm) — no API, no key, same spirit as the moon-phase math already in the app.

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

export interface SunTimes {
  sunrise: Date | null; // null = sun doesn't rise that day at that latitude (polar night)
  sunset: Date | null; // null = sun doesn't set that day (midnight sun)
}

export function sunTimes(date: Date, lat: number, lng: number): SunTimes {
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((start - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);

  const lngHour = lng / 15;

  function compute(isSunrise: boolean): Date | null {
    const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M)) + 282.634;
    L = ((L % 360) + 360) % 360;

    let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
    RA = ((RA % 360) + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(toRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));

    const zenith = 90.833; // official sunrise/sunset zenith (accounts for refraction + solar radius)
    const cosH =
      (Math.cos(toRad(zenith)) - sinDec * Math.sin(toRad(lat))) / (cosDec * Math.cos(toRad(lat)));

    if (cosH > 1 || cosH < -1) return null; // sun never rises/sets this day at this latitude

    let H = isSunrise ? 360 - toDeg(Math.acos(cosH)) : toDeg(Math.acos(cosH));
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;

    const ms = start + UT * 3600000;
    return new Date(ms);
  }

  return { sunrise: compute(true), sunset: compute(false) };
}

export function formatTime(d: Date | null, timeZone: string): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone });
}
