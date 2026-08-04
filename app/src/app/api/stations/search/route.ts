import { NextRequest, NextResponse } from "next/server";
import { rankStationsNear } from "@/lib/tides";
import { geocode, shortPlaceName } from "@/lib/geocode";

// Finds tide stations, either near a coordinate ("use my location") or near a place
// name ("Shediac"). Both paths end at the same ranked list so the picker renders one
// component either way.
//
// Nominatim runs server-side only: a browser can't set the User-Agent its usage policy
// requires, and keeping the call here means the response is cached for everyone rather
// than once per visitor.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
    }
    const stations = await rankStationsNear(lat, lng);
    if (stations.length === 0) {
      return NextResponse.json(
        { error: "Couldn't reach the tide station list just now. Try again in a moment." },
        { status: 502 }
      );
    }
    return NextResponse.json({ place: null, stations });
  }

  if (!q || !q.trim()) {
    return NextResponse.json({ error: "Enter a place name to search." }, { status: 400 });
  }

  const places = await geocode(q, 1);
  if (places.length === 0) {
    return NextResponse.json(
      { error: `No place found matching "${q.trim()}". Try a nearby town or landmark.` },
      { status: 404 }
    );
  }

  const place = places[0];
  const stations = await rankStationsNear(place.lat, place.lng);
  if (stations.length === 0) {
    return NextResponse.json(
      { error: "Couldn't reach the tide station list just now. Try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    place: { name: shortPlaceName(place.displayName), lat: place.lat, lng: place.lng },
    stations,
  });
}
