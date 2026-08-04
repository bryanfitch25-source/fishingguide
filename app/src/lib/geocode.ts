// Place-name search via OpenStreetMap's Nominatim — free, keyless, and used here only
// to turn something typed like "Shediac" into a coordinate we can rank tide stations
// against.
//
// Nominatim's usage policy is the constraint that shapes this file: it asks for a
// descriptive User-Agent identifying the application, a maximum of one request per
// second, and no bulk/automated querying. So this runs server-side only (a browser
// can't set User-Agent), fires once per deliberate user action rather than
// per-keystroke, and caches repeat lookups for a day — the coordinates of a town don't
// move, and every cache hit is a request the shared public service doesn't have to
// serve.

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const USER_AGENT =
  "MaritimeAngler/1.0 (recreational fishing guide for NB/NS/PEI; https://fishingguide-ebon.vercel.app)";

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

/**
 * Geocodes a free-text place name, biased to the Maritimes.
 *
 * The viewbox covers NB/NS/PEI and is a *preference*, not a hard filter — searching
 * "Halifax" should put the Nova Scotian one first without making it impossible to look
 * up a station elsewhere in Canada.
 */
export async function geocode(query: string, limit = 5): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: "jsonv2",
    limit: String(limit),
    countrycodes: "ca",
    viewbox: "-69.1,43.4,-59.7,48.1", // west,south,east,north — the Maritimes
    bounded: "0",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const json: { display_name?: string; lat?: string; lon?: string }[] = await res.json();
    if (!Array.isArray(json)) return [];

    return json
      .map((r) => ({
        displayName: r.display_name ?? "",
        lat: parseFloat(r.lat ?? ""),
        lng: parseFloat(r.lon ?? ""),
      }))
      .filter((r) => r.displayName && Number.isFinite(r.lat) && Number.isFinite(r.lng));
  } catch {
    return [];
  }
}

/** Trims Nominatim's very long display names down to something that fits a list row. */
export function shortPlaceName(displayName: string): string {
  const parts = displayName.split(",").map((p) => p.trim());
  if (parts.length <= 2) return displayName;
  // First part is the place itself; find the province and drop postcode/country noise.
  const province = parts.find((p) =>
    /New Brunswick|Nova Scotia|Prince Edward Island|Québec|Quebec|Newfoundland/i.test(p)
  );
  return province ? `${parts[0]}, ${province}` : `${parts[0]}, ${parts[1]}`;
}
