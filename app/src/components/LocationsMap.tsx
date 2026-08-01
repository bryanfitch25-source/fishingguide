"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

// Leaflet's default marker icons reference image files by a relative path that
// doesn't survive bundling — point them at the CDN-hosted originals instead of
// fighting the bundler over static asset paths for three small PNGs.
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const catchIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: "hue-rotate-[300deg]", // visually distinguish catch pins from location pins
});

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
}

export function LocationsMap({
  locationPins,
  catchPins = [],
  center,
  zoom = 7,
  height = 480,
}: {
  locationPins: MapPin[];
  catchPins?: MapPin[];
  center: [number, number];
  zoom?: number;
  height?: number;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locationPins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Popup>
              <strong>{p.title}</strong>
              {p.subtitle && (
                <>
                  <br />
                  {p.subtitle}
                </>
              )}
              {p.href && (
                <>
                  <br />
                  <Link href={p.href}>View trip guide →</Link>
                </>
              )}
            </Popup>
          </Marker>
        ))}
        {catchPins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={catchIcon}>
            <Popup>
              <strong>{p.title}</strong>
              {p.subtitle && (
                <>
                  <br />
                  {p.subtitle}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
