import { NextRequest, NextResponse } from "next/server";
import { getTideEvents, currentTide } from "@/lib/tides";

// A single station's current tide reading — deliberately the lightest possible fetch.
//
// My Spots calls this once per favourite, and each card resolves on its own so the
// dashboard fills in progressively instead of waiting on the slowest station. That's
// only reasonable because this route skips the weather, marine and solunar work the
// full Tides page does for the one actively-selected station: eight favourites at four
// requests each would be thirty-two calls to two free public APIs for a screen whose
// entire job is "which of these is worth the drive".
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId");
  if (!stationId) {
    return NextResponse.json({ error: "stationId is required." }, { status: 400 });
  }

  // Two days is enough to always bracket "now" with a previous and next extreme, which
  // is all currentTide needs, without pulling a full week per card.
  const events = await getTideEvents(stationId, 2);
  if (events === null) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
  if (events.length === 0) {
    return NextResponse.json({ error: "inactive" }, { status: 404 });
  }

  const current = currentTide(events);
  if (!current) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }

  return NextResponse.json({
    heightM: current.heightM,
    state: current.state,
    next: current.next,
  });
}
