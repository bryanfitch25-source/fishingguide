"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import {
  BATHYMETRY_LAYERS,
  CHS_ATTRIBUTION,
  tileUrlTemplate,
  type BathymetryLayer,
  type Bounds,
} from "@/lib/bathymetry";
import { formatHeight, type UnitSystem } from "@/lib/units";

const soundingIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#fff;border:3px solid #b91c1c;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export interface SoundingResult {
  lat: number;
  lng: number;
  depthM: number | null;
  layerLabel: string;
  loading: boolean;
}

/**
 * Reports viewport changes upward and turns a tap into a depth request.
 *
 * react-leaflet gives no way to read the map from outside the MapContainer, so anything
 * that needs the current bounds has to live in a child like this one.
 */
function MapBridge({
  onBoundsChange,
  onPick,
}: {
  onBoundsChange: (b: Bounds, zoom: number) => void;
  onPick: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => report(),
    zoomend: () => report(),
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });

  const report = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange(
      { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
      map.getZoom()
    );
  }, [map, onBoundsChange]);

  // Report once on mount so the download panel has bounds before anyone pans.
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    report();
  }, [report]);

  return null;
}

export function DepthChart({
  center,
  zoom = 12,
  layer,
  units,
  height = 460,
  sounding,
  onBoundsChange,
  onPick,
  savedOutlines = [],
}: {
  center: [number, number];
  zoom?: number;
  layer: BathymetryLayer;
  units: UnitSystem;
  height?: number;
  sounding: SoundingResult | null;
  onBoundsChange: (b: Bounds, zoom: number) => void;
  onPick: (lat: number, lng: number) => void;
  savedOutlines?: { id: string; bounds: Bounds; name: string }[];
}) {
  const spec = BATHYMETRY_LAYERS[layer];

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        {/* Base map is online-only by design — see the note in the download panel. OSM's
            tile policy does not permit bulk downloading, so saved charts carry the CHS
            bathymetry alone. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TileLayer
          // Keyed so switching resolution actually swaps the layer rather than leaving
          // React to reuse the old one with a stale url prop.
          key={layer}
          attribution={CHS_ATTRIBUTION}
          url={tileUrlTemplate(layer)}
          opacity={0.85}
          maxNativeZoom={spec.maxUsefulZoom}
          maxZoom={19}
        />
        {savedOutlines.map((o) => (
          <Circle
            key={o.id}
            center={[(o.bounds.north + o.bounds.south) / 2, (o.bounds.east + o.bounds.west) / 2]}
            radius={200}
            pathOptions={{ color: "#0f766e", weight: 2, fillOpacity: 0.1 }}
          />
        ))}
        {sounding && (
          <Marker position={[sounding.lat, sounding.lng]} icon={soundingIcon}>
            <Popup>
              {sounding.loading ? (
                <span className="text-sm">Reading depth…</span>
              ) : sounding.depthM === null ? (
                <span className="text-sm">
                  <strong>No survey data here.</strong>
                  <br />
                  Nothing has been sounded at this spot — not a depth of zero.
                </span>
              ) : (
                <span className="text-sm">
                  <strong className="text-base">{formatHeight(sounding.depthM, units)}</strong> deep
                  <br />
                  <span className="text-muted">
                    below chart datum · {sounding.layerLabel} grid
                  </span>
                </span>
              )}
            </Popup>
          </Marker>
        )}
        <MapBridge onBoundsChange={onBoundsChange} onPick={onPick} />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-1 left-1 z-[400] rounded bg-surface/85 px-2 py-1 text-[10px] text-muted">
        Tap the water for a depth reading
      </div>
    </div>
  );
}
