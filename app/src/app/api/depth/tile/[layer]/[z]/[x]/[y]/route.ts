import { NextRequest, NextResponse } from "next/server";
import { isBathymetryLayer, upstreamTileUrl } from "@/lib/bathymetry";

// Bathymetry tiles, proxied from the CHS GeoServer.
//
// A same-origin URL is the whole point. CHS sends no CORS headers, so the browser can't
// fetch their tiles into a Cache itself; and even if it could, the service worker needs a
// URL it can recognise in order to serve saved charts offline. Routing through here gives
// both, plus one place where the upstream address lives.
//
// Tiles are immutable in practice — NONNA is republished occasionally, not continuously —
// so they cache hard. A year is longer than any plausible interval between someone
// looking at the same piece of water twice.
const CACHE_HEADER = "public, max-age=31536000, s-maxage=31536000, immutable";

// A transparent 1×1 PNG, returned instead of an error when the upstream has nothing.
// A tile request that 500s makes Leaflet draw a broken-image box across the map; an empty
// transparent tile reads correctly as "no data here", which is what a gap in the survey
// actually is.
const EMPTY_TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

function emptyTile(reason: string) {
  return new NextResponse(new Uint8Array(EMPTY_TILE), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Short cache: a gap caused by an upstream hiccup should not be remembered for a
      // year the way a real tile is.
      "Cache-Control": "public, max-age=300",
      "X-Depth-Tile": reason,
    },
  });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ layer: string; z: string; x: string; y: string }> }
) {
  const { layer, z, x, y } = await context.params;

  if (!isBathymetryLayer(layer)) {
    return NextResponse.json({ error: "Unknown depth layer." }, { status: 404 });
  }

  const zi = Number(z);
  const xi = Number(x);
  const yi = Number(y);
  // Bounds-check before going upstream: the indices come straight off the URL, and a
  // zoom of 40 would ask CHS for a tile that cannot exist.
  if (![zi, xi, yi].every(Number.isInteger) || zi < 0 || zi > 22) {
    return NextResponse.json({ error: "Bad tile coordinates." }, { status: 400 });
  }
  const max = Math.pow(2, zi) - 1;
  if (xi < 0 || yi < 0 || xi > max || yi > max) {
    return NextResponse.json({ error: "Tile out of range for this zoom." }, { status: 400 });
  }

  try {
    const upstream = await fetch(upstreamTileUrl(layer, zi, xi, yi), {
      // Matches the CDN header above; keeps a hot area off the upstream entirely.
      next: { revalidate: 31536000 },
      headers: { Accept: "image/png" },
    });

    // GeoServer answers a tile outside the coverage with a 404 or an XML exception rather
    // than an empty image. Both mean the same thing to a chart: nothing surveyed here.
    if (!upstream.ok) return emptyTile(`upstream-${upstream.status}`);
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return emptyTile("upstream-not-image");

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": contentType, "Cache-Control": CACHE_HEADER },
    });
  } catch {
    // Network failure. Same reasoning as above — an empty tile degrades better than a
    // broken one, and the short cache means it retries soon.
    return emptyTile("fetch-failed");
  }
}
