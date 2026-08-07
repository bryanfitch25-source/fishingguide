// Depth data from the Canadian Hydrographic Service's NONNA bathymetry — free, keyless,
// Open Government Licence, and the only open dataset with real inshore resolution for
// Maritime waters.
//
// "NONNA" is CHS's own abbreviation for NON-NAvigational, and that is not a formality.
// The data is a consolidation of survey sources of varying age and quality with genuine
// gaps between them; it is not a chart, it has not been checked for dangers to
// navigation, and a rock that nobody surveyed simply is not in it. Every screen that
// shows this must say so. See NON_NAVIGATIONAL_NOTICE.
//
// Two products, both served from the same GeoServer:
//   NONNA-100  ~100 m cells, broad coverage — the sensible default
//   NONNA-10   ~10 m cells, much finer but only where a modern survey exists
//
// Measured over Shediac Bay: the 10 m layer resolves the dredged channel clearly and is
// blank either side of it; the 100 m layer covers the bay but not the whole Strait.
// Neither is complete, which is why a gap renders as "no survey data" rather than as
// zero.

const GEOSERVER = "https://nonna-geoserver.data.chs-shc.ca/geoserver";

export type BathymetryLayer = "nonna100" | "nonna10";

interface LayerSpec {
  id: BathymetryLayer;
  label: string;
  /** Short line explaining the trade-off, shown beside the picker. */
  note: string;
  /** GeoServer WMTS layer name. */
  wmtsLayer: string;
  /** WCS coverage id — note this differs from the WMTS name by a " Coverage" suffix. */
  coverageId: string;
  /** Beyond this the tiles are upscaled rather than more detailed. */
  maxUsefulZoom: number;
}

export const BATHYMETRY_LAYERS: Record<BathymetryLayer, LayerSpec> = {
  nonna100: {
    id: "nonna100",
    label: "100 m",
    note: "Broad coverage. The usual choice.",
    wmtsLayer: "nonna:NONNA 100",
    coverageId: "nonna__NONNA 100 Coverage",
    maxUsefulZoom: 14,
  },
  nonna10: {
    id: "nonna10",
    label: "10 m",
    note: "Ten times finer, but only over surveyed channels and approaches — blank elsewhere.",
    wmtsLayer: "nonna:NONNA 10",
    coverageId: "nonna__NONNA 10 Coverage",
    maxUsefulZoom: 16,
  },
};

export function isBathymetryLayer(v: unknown): v is BathymetryLayer {
  return v === "nonna100" || v === "nonna10";
}

/**
 * The upstream WMTS tile for a z/x/y.
 *
 * EPSG:900913 is the old EPSG code for spherical Web Mercator, identical to EPSG:3857
 * and to the tile grid Leaflet and OpenStreetMap use — so a {z}/{x}/{y} maps across
 * directly with no reprojection.
 */
export function upstreamTileUrl(layer: BathymetryLayer, z: number, x: number, y: number): string {
  const spec = BATHYMETRY_LAYERS[layer];
  return (
    `${GEOSERVER}/gwc/service/wmts/rest/${encodeURIComponent(spec.wmtsLayer)}` +
    `/raster/EPSG:900913/EPSG:900913:${z}/${y}/${x}?format=image/png`
  );
}

/**
 * The app's own tile URL.
 *
 * Everything goes through our own route rather than straight to CHS, for four reasons
 * that all matter: the upstream sends no CORS headers; a same-origin URL is one the
 * service worker can match and serve from an offline cache; it puts the upstream address
 * in exactly one place; and it lets the tiles be cached at the edge so a second look at
 * the same water is instant.
 */
export function tileUrl(layer: BathymetryLayer, z: number, x: number, y: number): string {
  return `/api/depth/tile/${layer}/${z}/${x}/${y}`;
}

/** Leaflet template form of the same thing. */
export function tileUrlTemplate(layer: BathymetryLayer): string {
  return `/api/depth/tile/${layer}/{z}/{x}/{y}`;
}

// ---------------------------------------------------------------------------
// Web Mercator tile arithmetic
// ---------------------------------------------------------------------------

export interface TileRef {
  z: number;
  x: number;
  y: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function lngToTileX(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}

export function latToTileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}

/** Clamped to the Mercator limit so a bad bounds can't produce a negative tile index. */
function clampLat(lat: number): number {
  return Math.max(-85.05112878, Math.min(85.05112878, lat));
}

/**
 * Every tile covering `bounds` from `minZoom` to `maxZoom` inclusive.
 *
 * Tile count roughly quadruples per zoom level, so the top zoom dominates the total —
 * which is why the UI shows the count and estimated size before downloading anything
 * rather than after.
 */
export function tilesForBounds(bounds: Bounds, minZoom: number, maxZoom: number): TileRef[] {
  const tiles: TileRef[] = [];
  const north = clampLat(bounds.north);
  const south = clampLat(bounds.south);
  for (let z = minZoom; z <= maxZoom; z++) {
    const max = Math.pow(2, z) - 1;
    const x0 = Math.max(0, Math.min(max, lngToTileX(bounds.west, z)));
    const x1 = Math.max(0, Math.min(max, lngToTileX(bounds.east, z)));
    // Latitude runs the other way to tile Y: north edge gives the smaller index.
    const y0 = Math.max(0, Math.min(max, latToTileY(north, z)));
    const y1 = Math.max(0, Math.min(max, latToTileY(south, z)));
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

/**
 * Rough download size for a tile count.
 *
 * 8 KB against a measured mean of 8,842 bytes over 36 tiles spanning six Maritime
 * locations — Shediac, mid-Strait, Bay of Fundy, off Halifax, the Acadian Peninsula and
 * inland Fundy — at zooms 10 through 15.
 *
 * It runs high on sparse water: a 31-tile download of Shediac Bay came out at 4 KB per
 * tile, because an area with little survey coverage is mostly near-empty PNGs. High is
 * the right direction to be wrong in. Someone who is told 250 KB and spends 120 KB is
 * fine; the reverse is how you fill a phone at a boat launch.
 */
export const MEDIAN_TILE_BYTES = 8 * 1024;

export function estimateBytes(tileCount: number): number {
  return tileCount * MEDIAN_TILE_BYTES;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Depth soundings
// ---------------------------------------------------------------------------

/**
 * The value NONNA uses for "no survey here" — IEEE 754 single-precision max.
 *
 * It has to be recognised explicitly. Read as a number it is 3.4e38, and anything that
 * treated it as a depth would report the seabed as 34 undecillion metres down, or worse,
 * clamp it to something plausible.
 */
export const NODATA = 3.4028234663852886e38;

export interface Sounding {
  /** Metres below chart datum, positive. Null where the area is unsurveyed. */
  depthM: number | null;
  /** The layer the reading came from, since the two disagree in places. */
  layer: BathymetryLayer;
}

/** Longitude/latitude to EPSG:3857 metres, which is what the WCS subsets on. */
export function toMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  const y =
    (Math.log(Math.tan(((90 + clampLat(lat)) * Math.PI) / 360)) / (Math.PI / 180)) *
    (20037508.34 / 180);
  return { x, y };
}

/** WCS request for a small window around a point, in the plain ASCII-grid format. */
export function soundingUrl(layer: BathymetryLayer, lat: number, lng: number, halfSpanM = 150): string {
  const { x, y } = toMercator(lat, lng);
  const params = new URLSearchParams({
    service: "WCS",
    version: "2.0.1",
    request: "GetCoverage",
    coverageId: BATHYMETRY_LAYERS[layer].coverageId,
    format: "text/plain",
  });
  // Two `subset` parameters with the same key, which URLSearchParams handles correctly.
  params.append("subset", `x(${Math.round(x - halfSpanM)},${Math.round(x + halfSpanM)})`);
  params.append("subset", `y(${Math.round(y - halfSpanM)},${Math.round(y + halfSpanM)})`);
  return `${GEOSERVER}/wcs?${params.toString()}`;
}

/**
 * Reads the depth out of the WCS ASCII grid.
 *
 * The response is an Arc/Info ASCII grid: six header lines (NCOLS, NROWS, XLLCORNER,
 * YLLCORNER, CELLSIZE, NODATA_VALUE) then whitespace-separated cell values. Choosing
 * text/plain over GeoTIFF is what keeps this dependency-free — the alternative was
 * parsing a binary TIFF's strip offsets to read sixteen floats.
 *
 * Depths arrive as negative metres (elevation relative to chart datum), so they are
 * negated here and the rest of the app deals only in positive "metres deep". Verified
 * against four points: −3.2 m in Shediac Bay, −3.5 m off Pointe-du-Chêne, −19.2 m off
 * Halifax, −43.0 m in the Bay of Fundy.
 *
 * The mean of the window is used rather than a single cell. One cell of a 100 m grid is
 * a coin toss on exactly where the point landed; averaging the few cells around it gives
 * the depth of the spot rather than of an arbitrary pixel.
 */
export function parseAsciiGrid(body: string): number | null {
  const values: number[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Header lines start with a letter; everything else is data.
    if (/^[A-Za-z]/.test(trimmed)) continue;
    for (const token of trimmed.split(/\s+/)) {
      const n = Number(token);
      if (!Number.isFinite(n)) continue;
      // Anything at or near the nodata sentinel is a gap, not a reading.
      if (Math.abs(n) > 1e30) continue;
      values.push(n);
    }
  }
  if (values.length === 0) return null;
  const meanElevation = values.reduce((a, b) => a + b, 0) / values.length;
  const depth = -meanElevation;
  // A positive elevation is land, or datum noise on a drying bank — not a depth.
  if (depth <= 0) return null;
  return depth;
}

export const NON_NAVIGATIONAL_NOTICE =
  "Not for navigation. This is CHS's non-navigational bathymetry — survey data of mixed age and coverage, with real gaps. It has not been checked for dangers to navigation and an unsurveyed rock will not appear. Carry the official chart.";

/** Attribution the licence requires wherever the data is shown. */
export const CHS_ATTRIBUTION =
  "Depth data © Canadian Hydrographic Service (NONNA), Open Government Licence – Canada";
