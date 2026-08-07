"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  BATHYMETRY_LAYERS,
  CHS_ATTRIBUTION,
  NON_NAVIGATIONAL_NOTICE,
  formatBytes,
  isBathymetryLayer,
  type BathymetryLayer,
  type Bounds,
} from "@/lib/bathymetry";
import {
  deleteChart,
  downloadChart,
  planDownload,
  readIndex,
  requestPersistence,
  storageEstimate,
  type DownloadProgress,
  type SavedChart,
} from "@/lib/chart-storage";
import type { SoundingResult } from "./DepthChart";
import type { UnitSystem } from "@/lib/units";

// Leaflet touches `window` at import time, so the map can never be server-rendered.
const DepthChart = dynamic(() => import("./DepthChart").then((m) => m.DepthChart), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
      Loading chart…
    </div>
  ),
});

const LAYER_KEY = "ma_depth_layer";

// How much detail a saved area carries.
//
// The bottom of the range is fixed at 10 rather than tracking the current view: those
// levels cost almost nothing (a handful of tiles for a whole region) and they are what
// stops a saved area from being a detailed rectangle floating in a grey void when you
// zoom out offline.
const MIN_SAVE_ZOOM = 10;
const DETAIL_CHOICES = [
  { maxZoom: 13, label: "Standard", blurb: "Enough to see channels and drop-offs." },
  { maxZoom: 14, label: "Detailed", blurb: "Closer in. Roughly four times the size." },
  { maxZoom: 15, label: "Maximum", blurb: "As fine as the data goes. Large." },
] as const;

export function DepthChartClient({
  center,
  stationName,
  units,
}: {
  center: [number, number];
  stationName: string;
  units: UnitSystem;
}) {
  const [layer, setLayer] = useState<BathymetryLayer>("nonna100");
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [zoom, setZoom] = useState(12);
  const [sounding, setSounding] = useState<SoundingResult | null>(null);
  const [saved, setSaved] = useState<SavedChart[]>([]);
  const [maxZoom, setMaxZoom] = useState<number>(13);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [areaName, setAreaName] = useState("");

  // Seeded at construction rather than in an effect: both are synchronous reads of
  // storage that already have a value on the first render.
  const [restored, setRestored] = useState(false);
  if (!restored) {
    setRestored(true);
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(LAYER_KEY);
      if (isBathymetryLayer(stored)) setLayer(stored);
      setSaved(readIndex());
    }
  }

  const refreshStorage = useCallback(() => {
    storageEstimate().then(setStorage);
  }, []);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  useEffect(() => {
    if (typeof localStorage !== "undefined") localStorage.setItem(LAYER_KEY, layer);
  }, [layer]);

  const handleBounds = useCallback((b: Bounds, z: number) => {
    setBounds(b);
    setZoom(z);
  }, []);

  const handlePick = useCallback(
    (lat: number, lng: number) => {
      setSounding({ lat, lng, depthM: null, layerLabel: "", loading: true });
      fetch(`/api/depth/sounding?lat=${lat}&lng=${lng}&layer=${layer}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { depthM: number | null; layerLabel: string } | null) => {
          setSounding({
            lat,
            lng,
            depthM: d?.depthM ?? null,
            layerLabel: d?.layerLabel ?? "",
            loading: false,
          });
        })
        .catch(() => {
          setSounding({ lat, lng, depthM: null, layerLabel: "", loading: false });
        });
    },
    [layer]
  );

  const plan = bounds ? planDownload(bounds, MIN_SAVE_ZOOM, maxZoom) : null;

  async function handleDownload() {
    if (!bounds || !plan) return;
    setBusy(true);
    setMessage(null);
    setProgress({ done: 0, total: plan.tileCount, bytes: 0, failed: 0 });
    // Asked for at the moment of downloading, which is the moment it means something —
    // and the moment a browser is most likely to grant it.
    const persisted = await requestPersistence();
    try {
      const chart = await downloadChart(
        areaName.trim() || `${stationName} area`,
        layer,
        bounds,
        MIN_SAVE_ZOOM,
        maxZoom,
        setProgress
      );
      setSaved(readIndex());
      setAreaName("");
      const missing = plan.tileCount - chart.tileCount;
      setMessage(
        `Saved “${chart.name}” — ${chart.tileCount} tiles, ${formatBytes(chart.bytes)}.` +
          (missing > 0 ? ` ${missing} tiles had no data and were skipped.` : "") +
          (persisted ? "" : " Your browser wouldn't mark this storage as permanent, so it may be cleared if the device runs low.")
      );
    } catch {
      setMessage("Download failed. Check your connection and try again — anything already saved was kept.");
    } finally {
      setBusy(false);
      setProgress(null);
      refreshStorage();
    }
  }

  async function handleDelete(chart: SavedChart) {
    if (!confirm(`Delete the saved chart “${chart.name}”? You'll need a signal to view that area again.`)) return;
    await deleteChart(chart.id);
    setSaved(readIndex());
    refreshStorage();
    setMessage(`Deleted “${chart.name}”.`);
  }

  const spec = BATHYMETRY_LAYERS[layer];

  return (
    <div className="space-y-4">
      {/* Non-negotiable, and first. NONNA is explicitly non-navigational data; someone
          running a boat off it needs to have read this before they read the chart. */}
      <div className="rounded-lg border border-danger bg-danger-light px-4 py-3 text-sm text-danger">
        <strong>Not for navigation.</strong> {NON_NAVIGATIONAL_NOTICE.replace("Not for navigation. ", "")}
      </div>

      {/* On its own panel rather than loose on the page: the app's backgrounds are
          photographs, and small muted type sat directly on one was barely readable. */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Resolution</span>
          {(Object.keys(BATHYMETRY_LAYERS) as BathymetryLayer[]).map((id) => (
            <button
              key={id}
              onClick={() => setLayer(id)}
              aria-pressed={layer === id}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                layer === id
                  ? "bg-brand text-on-brand"
                  : "border border-border text-muted hover:border-brand"
              }`}
            >
              {BATHYMETRY_LAYERS[id].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{spec.note}</p>
        {/* Said plainly because it would otherwise be guessed at, and guessed wrong.
            CHS serves these tiles pre-rendered and their legend graphic carries no
            labels, so there is no published scale to print here — the shading shows
            where the bottom changes, not how deep it is. The number comes from a
            separate request against the underlying grid, which is why it needs a tap. */}
        <p className="mt-2 text-xs text-muted">
          The shading is CHS&apos;s own and has no published scale — read it for where the
          bottom changes, not for how deep it is. <strong>Tap any spot for the actual
          depth.</strong> Blank means nothing was surveyed there, which is not the same as
          shallow.
        </p>
      </div>

      <DepthChart
        center={center}
        layer={layer}
        units={units}
        sounding={sounding}
        onBoundsChange={handleBounds}
        onPick={handlePick}
        savedOutlines={saved.map((s) => ({ id: s.id, bounds: s.bounds, name: s.name }))}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Save this area                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-1 font-bold text-brand-dark">Save this area for offline</h2>
        <p className="mb-3 text-sm text-muted">
          Downloads the depth data for whatever the map is showing, so it still opens with no
          signal. The street map underneath is not included — OpenStreetMap&apos;s terms
          don&apos;t allow downloading it in bulk — so offline you get the depths, the coastline
          they imply, and your own position.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {DETAIL_CHOICES.map((c) => (
            <button
              key={c.maxZoom}
              onClick={() => setMaxZoom(c.maxZoom)}
              aria-pressed={maxZoom === c.maxZoom}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                maxZoom === c.maxZoom
                  ? "border-brand bg-brand-light"
                  : "border-border hover:border-brand"
              }`}
            >
              <span className="block font-semibold">{c.label}</span>
              <span className="block text-xs text-muted">{c.blurb}</span>
            </button>
          ))}
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-medium">Name this area</span>
          <input
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder={`${stationName} area`}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        {plan && (
          <p className="mb-3 text-sm">
            <strong>{plan.tileCount.toLocaleString()}</strong> tiles, roughly{" "}
            <strong>{formatBytes(plan.estimatedBytes)}</strong>
            <span className="text-muted"> at zoom {MIN_SAVE_ZOOM}–{maxZoom}</span>
            {zoom > maxZoom && (
              <span className="block text-xs text-accent-dark">
                You&apos;re zoomed in past the detail being saved — offline, this area will
                stop sharpening at zoom {maxZoom}.
              </span>
            )}
          </p>
        )}

        {progress && (
          <div className="mb-3">
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-brand transition-[width]"
                style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {progress.done} of {progress.total} · {formatBytes(progress.bytes)}
              {progress.failed > 0 && ` · ${progress.failed} skipped`}
            </p>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={busy || !plan || plan.tileCount === 0}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "Downloading…" : "⬇ Save this area"}
        </button>

        {message && <p className="mt-3 text-sm text-brand-dark">{message}</p>}

        {storage && storage.quota > 0 && (
          <p className="mt-3 text-xs text-muted">
            Using {formatBytes(storage.usage)} of about {formatBytes(storage.quota)} the browser
            allows this app.
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Saved charts                                                        */}
      {/* ------------------------------------------------------------------ */}
      {saved.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 font-bold text-brand-dark">Saved charts</h2>
          <ul className="divide-y divide-border">
            {saved.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {BATHYMETRY_LAYERS[c.layer].label} · {c.tileCount.toLocaleString()} tiles ·{" "}
                    {formatBytes(c.bytes)} · saved{" "}
                    {new Date(c.savedAt).toLocaleDateString("en-CA")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger transition hover:border-danger"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted">{CHS_ATTRIBUTION}</p>
    </div>
  );
}
