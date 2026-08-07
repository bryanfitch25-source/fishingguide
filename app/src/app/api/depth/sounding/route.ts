import { NextRequest, NextResponse } from "next/server";
import {
  BATHYMETRY_LAYERS,
  isBathymetryLayer,
  parseAsciiGrid,
  soundingUrl,
  type BathymetryLayer,
} from "@/lib/bathymetry";

// Depth at a point, for the tap-anywhere readout on the chart.
//
// This exists because CHS's rendered tiles are a picture, not data: the WMS serves a
// pre-rendered RGBA raster, its GetFeatureInfo returns palette values rather than
// metres, and its legend graphic carries no labels at all. So the colours on the chart
// genuinely cannot be read as depths. Rather than ship a chart whose shading means
// nothing you can name, the actual number comes from the WCS, which does serve the
// underlying grid.
//
// Server-side because the WCS sends no CORS headers, and because the response is an
// ASCII grid that is better parsed once here than in every client.

export const revalidate = 86400; // seabed does not move

/** Falls back to the coarser layer when the fine one has no survey at this point. */
const FALLBACK: Record<BathymetryLayer, BathymetryLayer | null> = {
  nonna10: "nonna100",
  nonna100: null,
};

async function probe(layer: BathymetryLayer, lat: number, lng: number): Promise<number | null> {
  try {
    const res = await fetch(soundingUrl(layer, lat, lng), {
      next: { revalidate: 86400 },
      headers: { Accept: "text/plain" },
    });
    if (!res.ok) return null;
    return parseAsciiGrid(await res.text());
  } catch {
    return null;
  }
}

/** A query parameter that actually carries a value — not absent, not "". */
function isPresent(v: string | null): v is string {
  return v !== null && v.trim() !== "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const requested = searchParams.get("layer") ?? "nonna100";

  // Presence and emptiness both checked before conversion. Number() maps null AND the
  // empty string to 0, so testing only for finiteness turned a request carrying no
  // coordinates into a valid query for 0°N 0°E — a point in the Gulf of Guinea — answered
  // 200 with a null depth. That is indistinguishable from "this Maritime spot is
  // unsurveyed", which is a different thing entirely.
  if (!isPresent(latParam) || !isPresent(lngParam)) {
    return NextResponse.json({ error: "Need both lat and lng." }, { status: 400 });
  }
  const lat = Number(latParam);
  const lng = Number(lngParam);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Need a valid lat and lng." }, { status: 400 });
  }
  if (!isBathymetryLayer(requested)) {
    return NextResponse.json({ error: "Unknown depth layer." }, { status: 400 });
  }

  let depthM = await probe(requested, lat, lng);
  let source: BathymetryLayer = requested;

  // The 10 m product is blank away from surveyed channels, and a blank reading there
  // means "nobody surveyed this at 10 m", not "no data exists" — the 100 m product often
  // covers the same water. Saying which one answered keeps that visible rather than
  // quietly presenting a coarse reading as a fine one.
  const fallback = FALLBACK[requested];
  if (depthM === null && fallback) {
    const coarse = await probe(fallback, lat, lng);
    if (coarse !== null) {
      depthM = coarse;
      source = fallback;
    }
  }

  return NextResponse.json({
    depthM,
    layer: source,
    layerLabel: BATHYMETRY_LAYERS[source].label,
    // Distinguishes "we asked and there is no survey" from "we could not ask", which are
    // different things to a person deciding whether to trust the blank.
    surveyed: depthM !== null,
  });
}
