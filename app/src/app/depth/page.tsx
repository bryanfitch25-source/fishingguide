import { getActiveStationContext } from "@/lib/active-station";
import { DepthChartClient } from "@/components/DepthChartClient";

export const metadata = {
  title: "Depth Charts — Maritime Angler",
  description:
    "Seabed depth for New Brunswick, Nova Scotia and PEI waters from CHS non-navigational bathymetry, with offline download.",
};

// Centres on whichever tide station is active, for the same reason the Tides screen does:
// it is the piece of water the app already knows you care about, and it saves a pan from
// the middle of the Gulf every time the page opens.
export default async function DepthPage() {
  const { station, units } = await getActiveStationContext();

  // Shediac Bay, the same anchor active-station.ts falls back to when the IWLS station
  // list can't be reached — so the chart still opens somewhere sensible.
  const center: [number, number] = station ? [station.lat, station.lng] : [46.2283, -64.5397];
  const name = station?.name ?? "Shediac Bay";

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Depth Charts</h1>
        <p className="max-w-2xl text-muted">
          Seabed depth around {name}, from the Canadian Hydrographic Service. Tap the water for
          a reading, and save an area to keep it when the signal doesn&apos;t.
        </p>
      </div>
      <DepthChartClient center={center} stationName={name} units={units} />
    </div>
  );
}
