"use client";

// Saved charts: downloading depth tiles into the browser's Cache Storage so an area is
// readable with no signal.
//
// Cache Storage rather than IndexedDB because the service worker can serve a cached
// Response directly on fetch, with no messaging and no decoding step — the map asks for
// a tile URL and gets one back, online or not. Storing blobs in IndexedDB would mean
// intercepting every tile request and reconstructing a Response by hand.
//
// A separate cache from the app shell (maritime-angler-vN) on purpose. Charts are large
// and deliberate; the shell is small and automatic. Keeping them apart means the service
// worker's activate step, which deletes caches whose name it doesn't recognise, cannot
// wipe a chart someone downloaded at the wharf — and means "delete this chart" doesn't
// take the app offline with it.
export const CHART_CACHE = "maritime-angler-charts-v1";

import {
  estimateBytes,
  tilesForBounds,
  tileUrl,
  type BathymetryLayer,
  type Bounds,
  type TileRef,
} from "./bathymetry";

/** What a saved area looks like in the index. */
export interface SavedChart {
  id: string;
  name: string;
  layer: BathymetryLayer;
  bounds: Bounds;
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  /** Bytes actually stored, measured after download rather than estimated. */
  bytes: number;
  savedAt: string;
}

// The index lives in localStorage, not in the cache. The Cache API can list its own keys,
// but it has no notion of "these 400 tiles are one saved area called Shediac Bay" — that
// grouping is ours, and it has to survive independently so the list can be shown without
// walking every cached entry.
const INDEX_KEY = "ma_saved_charts";

export function readIndex(): SavedChart[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedChart[]) : [];
  } catch {
    // A corrupt index should cost you the list, not the app.
    return [];
  }
}

function writeIndex(charts: SavedChart[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(charts));
  } catch {
    /* Quota or private mode — the tiles are still cached, only the list is lost. */
  }
}

export interface DownloadProgress {
  done: number;
  total: number;
  bytes: number;
  failed: number;
}

export interface PlannedDownload {
  tiles: TileRef[];
  tileCount: number;
  estimatedBytes: number;
}

/** What a download would involve, so the size can be shown before anything is fetched. */
export function planDownload(bounds: Bounds, minZoom: number, maxZoom: number): PlannedDownload {
  const tiles = tilesForBounds(bounds, minZoom, maxZoom);
  return { tiles, tileCount: tiles.length, estimatedBytes: estimateBytes(tiles.length) };
}

/**
 * Fetches every tile for an area into the chart cache.
 *
 * Deliberately serialised in small batches rather than fired all at once. A few hundred
 * simultaneous requests to the same origin gets throttled by the browser, and — more to
 * the point — it hammers a free government service to save one person a few seconds.
 * Six at a time is roughly what a browser would allow anyway.
 *
 * Individual tile failures are counted and skipped, not thrown. Losing four tiles out of
 * six hundred should leave you with a usable chart and an honest count, not nothing.
 */
export async function downloadChart(
  name: string,
  layer: BathymetryLayer,
  bounds: Bounds,
  minZoom: number,
  maxZoom: number,
  onProgress?: (p: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<SavedChart> {
  const { tiles } = planDownload(bounds, minZoom, maxZoom);
  const cache = await caches.open(CHART_CACHE);

  let done = 0;
  let bytes = 0;
  let failed = 0;
  const BATCH = 6;

  for (let i = 0; i < tiles.length; i += BATCH) {
    if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");
    const batch = tiles.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (t) => {
        const url = tileUrl(layer, t.z, t.x, t.y);
        try {
          const res = await fetch(url, { signal });
          if (res.ok) {
            // Read the length before caching: cache.put consumes the body, so the clone
            // has to happen first or the size can't be measured.
            const buf = await res.clone().arrayBuffer();
            bytes += buf.byteLength;
            await cache.put(url, res);
          } else {
            failed++;
          }
        } catch (err) {
          if ((err as Error)?.name === "AbortError") throw err;
          failed++;
        } finally {
          done++;
          onProgress?.({ done, total: tiles.length, bytes, failed });
        }
      })
    );
  }

  const chart: SavedChart = {
    id: `${layer}-${Date.now()}`,
    name,
    layer,
    bounds,
    minZoom,
    maxZoom,
    tileCount: tiles.length - failed,
    bytes,
    savedAt: new Date().toISOString(),
  };
  writeIndex([chart, ...readIndex()]);
  return chart;
}

/**
 * Removes a saved area's tiles.
 *
 * Only deletes tiles this area doesn't share with another saved chart. Overlapping areas
 * are the normal case — you save the bay, then save a wider box that contains it — and
 * deleting the inner one must not punch holes in the outer.
 */
export async function deleteChart(id: string): Promise<void> {
  const charts = readIndex();
  const target = charts.find((c) => c.id === id);
  if (!target) return;
  const remaining = charts.filter((c) => c.id !== id);

  const keep = new Set<string>();
  for (const c of remaining) {
    for (const t of tilesForBounds(c.bounds, c.minZoom, c.maxZoom)) {
      keep.add(tileUrl(c.layer, t.z, t.x, t.y));
    }
  }

  const cache = await caches.open(CHART_CACHE);
  for (const t of tilesForBounds(target.bounds, target.minZoom, target.maxZoom)) {
    const url = tileUrl(target.layer, t.z, t.x, t.y);
    if (!keep.has(url)) await cache.delete(url);
  }
  writeIndex(remaining);
}

/**
 * How much room the browser will give us, and how much is gone.
 *
 * Worth surfacing because this app's home is an iOS Home Screen icon, where the budget
 * is finite and eviction is silent — a chart can simply stop being there. Better to show
 * the number than to let someone find out offshore.
 */
export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
}

/**
 * Asks the browser to make this origin's storage persistent.
 *
 * Without it, cached charts are "best effort" and get evicted under pressure with no
 * warning. Granting is at the browser's discretion — Safari generally grants it for a
 * site added to the Home Screen — so this is a request, and its result is reported
 * rather than assumed.
 */
export async function requestPersistence(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
