import type { Province } from "@/types/content";

// Reference towns per province; nearest reference point decides the province.
// Coarse but reliable for the Maritimes' geography, including coastlines.
const REFERENCE_POINTS: { province: Province; name: string; lat: number; lng: number }[] = [
  { province: "NB", name: "Moncton", lat: 46.09, lng: -64.77 },
  { province: "NB", name: "Saint John", lat: 45.27, lng: -66.06 },
  { province: "NB", name: "Fredericton", lat: 45.96, lng: -66.64 },
  { province: "NB", name: "Miramichi", lat: 47.03, lng: -65.47 },
  { province: "NB", name: "Bathurst", lat: 47.62, lng: -65.65 },
  { province: "NB", name: "Edmundston", lat: 47.37, lng: -68.33 },
  { province: "NB", name: "Shediac", lat: 46.22, lng: -64.54 },
  { province: "NB", name: "Sackville", lat: 45.9, lng: -64.37 },
  { province: "NS", name: "Halifax", lat: 44.65, lng: -63.57 },
  { province: "NS", name: "Sydney", lat: 46.14, lng: -60.18 },
  { province: "NS", name: "Yarmouth", lat: 43.84, lng: -66.12 },
  { province: "NS", name: "Truro", lat: 45.37, lng: -63.28 },
  { province: "NS", name: "Amherst", lat: 45.82, lng: -64.21 },
  { province: "NS", name: "Antigonish", lat: 45.62, lng: -61.99 },
  { province: "NS", name: "Bridgewater", lat: 44.38, lng: -64.52 },
  { province: "NS", name: "Pictou", lat: 45.68, lng: -62.71 },
  { province: "PEI", name: "Charlottetown", lat: 46.24, lng: -63.13 },
  { province: "PEI", name: "Summerside", lat: 46.39, lng: -63.79 },
  { province: "PEI", name: "Georgetown", lat: 46.18, lng: -62.53 },
  { province: "PEI", name: "Tignish", lat: 46.95, lng: -64.03 },
  { province: "PEI", name: "Souris", lat: 46.35, lng: -62.25 },
  { province: "PEI", name: "Montague", lat: 46.16, lng: -62.65 },
];

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export interface ProvinceGuess {
  province: Province;
  nearestTown: string;
  distanceKm: number;
  /** True when the point is far from any reference town (outside the Maritimes). */
  outOfRegion: boolean;
}

export function guessProvince(lat: number, lng: number): ProvinceGuess {
  let best = REFERENCE_POINTS[0];
  let bestDist = Infinity;
  for (const p of REFERENCE_POINTS) {
    const d = haversineKm(lat, lng, p.lat, p.lng);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return {
    province: best.province,
    nearestTown: best.name,
    distanceKm: Math.round(bestDist),
    outOfRegion: bestDist > 200,
  };
}
