"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Catch } from "@/types/tackle";
import { PhotoUploadField } from "./PhotoUploadField";
import { MultiPhotoField } from "./MultiPhotoField";
import { moonPhase } from "@/lib/moonphase";
import { downloadCSV } from "@/lib/csv";
import { LocationsMapLoader } from "./LocationsMapLoader";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

interface SpeciesOption {
  slug: string;
  common_name: string;
}

interface TackleOption {
  id: string;
  name: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchAll(
  supabase: SupabaseBrowserClient
): Promise<{ catches: Catch[]; tackle: TackleOption[]; error: string | null }> {
  const [catchesRes, tackleRes] = await Promise.all([
    supabase.from("catches").select("*").order("catch_date", { ascending: false }),
    supabase.from("tackle_items").select("id, name").order("name"),
  ]);
  return {
    catches: catchesRes.error ? [] : (catchesRes.data as unknown as Catch[]),
    tackle: (tackleRes.data as TackleOption[]) ?? [],
    error: catchesRes.error?.message ?? null,
  };
}

const emptyForm = {
  id: null as string | null,
  species_slug: "",
  catch_date: today(),
  location: "",
  tackle_item_id: "",
  length_desc: "",
  weight_desc: "",
  kept: false,
  notes: "",
  photo_url: "",
  extra_photo_urls: [] as string[],
  lat: null as number | null,
  lng: null as number | null,
};

// Parses a free-form length string ("18 in", "45cm") into inches for personal-best
// comparison. Best-effort only — unparseable strings just don't compete for the badge.
function lengthInches(desc: string | null): number | null {
  if (!desc) return null;
  const m = desc.match(/([\d.]+)\s*(in|inch|inches|cm|centimeters?|"|')/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  return /cm|centimeter/i.test(m[2]) ? n / 2.54 : n;
}

type LocateState = "idle" | "locating" | "denied";

// Minimal typing for the Web Speech API (not in TypeScript's default DOM lib) —
// only the bits used for dictating a Notes field. Widely supported in Chrome/Edge;
// unsupported browsers just never see the "Dictate" button (see voiceSupported).
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function CatchLogClient({ species }: { species: SpeciesOption[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [tackle, setTackle] = useState<TackleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locateState, setLocateState] = useState<LocateState>("idle");
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  async function loadAll() {
    setLoading(true);
    const result = await fetchAll(supabase);
    if (result.error) setError(result.error);
    setCatches(result.catches);
    setTackle(result.tackle);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchAll(supabase);
      if (cancelled) return;
      if (result.error) setError(result.error);
      setCatches(result.catches);
      setTackle(result.tackle);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAdd() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(c: Catch) {
    setForm({
      id: c.id,
      species_slug: c.species_slug ?? "",
      catch_date: c.catch_date,
      location: c.location ?? "",
      tackle_item_id: c.tackle_item_id ?? "",
      length_desc: c.length_desc ?? "",
      weight_desc: c.weight_desc ?? "",
      kept: c.kept,
      notes: c.notes ?? "",
      photo_url: c.photo_url ?? "",
      extra_photo_urls: c.extra_photo_urls ?? [],
      lat: c.lat,
      lng: c.lng,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this catch?")) return;
    const { error } = await supabase.from("catches").delete().eq("id", id);
    if (error) setError(error.message);
    else loadAll();
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocateState("denied");
      return;
    }
    setLocateState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocateState("idle");
      },
      () => setLocateState("denied")
    );
  }

  function startVoiceNote() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-CA";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript + " ";
      setForm((f) => ({ ...f, notes: (f.notes ? f.notes + " " : "") + transcript.trim() }));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopVoiceNote() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You've been signed out — please sign in again.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      species_slug: form.species_slug || null,
      catch_date: form.catch_date,
      location: form.location.trim() || null,
      tackle_item_id: form.tackle_item_id || null,
      length_desc: form.length_desc.trim() || null,
      weight_desc: form.weight_desc.trim() || null,
      kept: form.kept,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
      extra_photo_urls: form.extra_photo_urls,
      lat: form.lat,
      lng: form.lng,
    };

    const query = form.id
      ? supabase.from("catches").update(payload).eq("id", form.id)
      : supabase.from("catches").insert(payload);

    const { error } = await query;
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    loadAll();
  }

  const speciesName = (slug: string | null) =>
    slug ? species.find((s) => s.slug === slug)?.common_name ?? slug : null;
  const tackleName = (id: string | null) => (id ? tackle.find((t) => t.id === id)?.name ?? null : null);

  // Personal best per species: the catch with the longest parsed length. Ties/unparseable
  // lengths just don't get the badge — this is a nice-to-have, not exact science.
  const personalBestIds = useMemo(() => {
    const bestBySpecies = new Map<string, { id: string; inches: number }>();
    for (const c of catches) {
      if (!c.species_slug) continue;
      const inches = lengthInches(c.length_desc);
      if (inches === null) continue;
      const current = bestBySpecies.get(c.species_slug);
      if (!current || inches > current.inches) bestBySpecies.set(c.species_slug, { id: c.id, inches });
    }
    return new Set([...bestBySpecies.values()].map((v) => v.id));
  }, [catches]);

  const thisYear = new Date().getFullYear();
  const stats = {
    total: catches.length,
    uniqueSpecies: new Set(catches.filter((c) => c.species_slug).map((c) => c.species_slug)).size,
    kept: catches.filter((c) => c.kept).length,
    released: catches.filter((c) => !c.kept).length,
    thisYear: catches.filter((c) => new Date(c.catch_date).getFullYear() === thisYear).length,
  };

  const geoTaggedCatches = catches.filter((c) => c.lat !== null && c.lng !== null);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const yearCatches = catches.filter((c) => new Date(c.catch_date).getFullYear() === thisYear);

  const monthCounts = new Map<number, number>();
  for (const c of yearCatches) {
    const m = new Date(c.catch_date).getMonth();
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
  }
  const topMonth = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const tackleCounts = new Map<string, number>();
  for (const c of yearCatches) {
    if (!c.tackle_item_id) continue;
    tackleCounts.set(c.tackle_item_id, (tackleCounts.get(c.tackle_item_id) ?? 0) + 1);
  }
  const topTackle = [...tackleCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const caughtSlugs = new Set(catches.filter((c) => c.species_slug).map((c) => c.species_slug as string));
  const lifeList = species
    .map((s) => ({
      ...s,
      caught: caughtSlugs.has(s.slug),
      firstCatchDate: catches
        .filter((c) => c.species_slug === s.slug)
        .map((c) => c.catch_date)
        .sort()[0],
    }))
    .sort((a, b) => Number(b.caught) - Number(a.caught) || a.common_name.localeCompare(b.common_name));

  function exportCSV() {
    downloadCSV(
      "catch-log.csv",
      ["Date", "Species", "Location", "Length", "Weight", "Tackle", "Kept", "Moon Phase", "Notes"],
      catches.map((c) => [
        c.catch_date,
        speciesName(c.species_slug) ?? "",
        c.location ?? "",
        c.length_desc ?? "",
        c.weight_desc ?? "",
        tackleName(c.tackle_item_id) ?? "",
        c.kept ? "Kept" : "Released",
        moonPhase(c.catch_date).name,
        c.notes ?? "",
      ])
    );
  }

  return (
    <div>
      {catches.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.total}</p>
            <p className="text-xs text-muted">Total Catches</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.uniqueSpecies}</p>
            <p className="text-xs text-muted">Species Caught</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.thisYear}</p>
            <p className="text-xs text-muted">This Year ({thisYear})</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.kept}</p>
            <p className="text-xs text-muted">Kept</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.released}</p>
            <p className="text-xs text-muted">Released</p>
          </div>
        </div>
      )}

      {geoTaggedCatches.length > 0 && (
        <div className="mb-6 no-print">
          <LocationsMapLoader
            locationPins={[]}
            catchPins={geoTaggedCatches.map((c) => ({
              id: c.id,
              lat: c.lat as number,
              lng: c.lng as number,
              title: speciesName(c.species_slug) ?? "Catch",
              subtitle: c.catch_date,
            }))}
            center={[geoTaggedCatches[0].lat as number, geoTaggedCatches[0].lng as number]}
            zoom={8}
            height={360}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-6 no-print">
        <p className="text-sm text-muted">
          {catches.length} catch{catches.length === 1 ? "" : "es"} logged
        </p>
        <div className="flex gap-2">
          {catches.length > 0 && (
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-catches transition"
            >
              🖨️ Print
            </button>
          )}
          {catches.length > 0 && (
            <button
              onClick={() => setShowInsights((v) => !v)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-catches transition"
            >
              📅 {showInsights ? "Hide" : "Year in Review & Life List"}
            </button>
          )}
          {catches.length > 0 && (
            <button
              onClick={exportCSV}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-catches transition"
            >
              ⬇ Export CSV
            </button>
          )}
          <button
            onClick={startAdd}
            className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
          >
            + Log a Catch
          </button>
        </div>
      </div>

      {showInsights && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-5">
          <h3 className="font-bold text-brand-dark mb-3">📅 {thisYear} in Review</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-5">
            <div>
              <p className="text-xs text-muted">Catches this year</p>
              <p className="font-semibold text-lg">{yearCatches.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Best month</p>
              <p className="font-semibold text-lg">{topMonth ? MONTH_NAMES[topMonth[0]] : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Most-used gear</p>
              <p className="font-semibold text-lg">{topTackle ? tackleName(topTackle[0]) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Species this year</p>
              <p className="font-semibold text-lg">
                {new Set(yearCatches.filter((c) => c.species_slug).map((c) => c.species_slug)).size}
              </p>
            </div>
          </div>

          <h3 className="font-bold text-brand-dark mb-2">
            🏅 Species Life List — {caughtSlugs.size} / {species.length} caught
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {lifeList.map((s) => (
              <span
                key={s.slug}
                title={s.caught ? `First caught ${s.firstCatchDate}` : "Not caught yet"}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  s.caught ? "bg-catches-light text-catches" : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.caught ? "🏅" : "⚪"} {s.common_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-surface p-5 space-y-4 no-print"
        >
          <h2 className="font-bold text-brand-dark">{form.id ? "Edit Catch" : "New Catch"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Species</label>
              <select
                value={form.species_slug}
                onChange={(e) => setForm({ ...form, species_slug: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Not sure / other —</option>
                {species.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.common_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.catch_date}
                onChange={(e) => setForm({ ...form, catch_date: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <div className="flex gap-2">
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Pointe-du-Chêne Wharf"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locateState === "locating"}
                  title="Pin your current GPS coordinates to this catch"
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm hover:border-catches transition disabled:opacity-60"
                >
                  {locateState === "locating" ? "…" : "📍"}
                </button>
              </div>
              {form.lat !== null && form.lng !== null && (
                <p className="mt-1 text-xs text-muted">
                  Pinned: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}{" "}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, lat: null, lng: null }))}
                    className="text-danger hover:underline"
                  >
                    remove
                  </button>
                </p>
              )}
              {locateState === "denied" && (
                <p className="mt-1 text-xs text-danger">Couldn&apos;t get your location — check permissions.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tackle used</label>
              <select
                value={form.tackle_item_id}
                onChange={(e) => setForm({ ...form, tackle_item_id: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— None / not sure —</option>
                {tackle.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <input
                value={form.length_desc}
                onChange={(e) => setForm({ ...form, length_desc: e.target.value })}
                placeholder="e.g. 18 in"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input
                value={form.weight_desc}
                onChange={(e) => setForm({ ...form, weight_desc: e.target.value })}
                placeholder="e.g. 2.5 lb"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <PhotoUploadField
                folder="catches"
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
                onGpsDetected={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
              />
              <p className="mt-1 text-[11px] text-muted">
                If the photo has location data, we&apos;ll fill in the spot automatically — the
                📍 button above still works too.
              </p>
            </div>
            <div>
              <MultiPhotoField
                folder="catches"
                values={form.extra_photo_urls}
                onChange={(urls) => setForm({ ...form, extra_photo_urls: urls })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="kept"
                type="checkbox"
                checked={form.kept}
                onChange={(e) => setForm({ ...form, kept: e.target.checked })}
              />
              <label htmlFor="kept" className="text-sm font-medium">
                Kept (unchecked = released)
              </label>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Notes</label>
              {voiceSupported && (
                <button
                  type="button"
                  onClick={listening ? stopVoiceNote : startVoiceNote}
                  className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                    listening ? "bg-danger text-white" : "border border-border hover:border-catches"
                  }`}
                >
                  {listening ? "⏹ Stop" : "🎤 Dictate"}
                </button>
              )}
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Conditions, tide, what worked… or tap 🎤 Dictate to talk it out"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Save Changes" : "Log Catch"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : catches.length === 0 ? (
        <p className="text-muted text-sm">No catches logged yet — add your first one above.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-light">
              <tr>
                <th className="text-left px-3 py-2"></th>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Species</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-left px-3 py-2">Size</th>
                <th className="text-left px-3 py-2">Tackle</th>
                <th className="text-left px-3 py-2">Kept?</th>
                <th className="text-left px-3 py-2" title="Moon phase on the catch date">
                  Moon
                </th>
                <th className="text-left px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {catches.map((c) => {
                const moon = moonPhase(c.catch_date);
                return (
                  <tr key={c.id} className="border-t border-border align-top">
                    <td className="px-3 py-2">
                      {c.photo_url && (
                        <div className="relative inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo */}
                          <img
                            src={c.photo_url}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover border border-border"
                          />
                          {c.extra_photo_urls.length > 0 && (
                            <span className="absolute -right-1 -bottom-1 rounded-full bg-catches text-white text-[10px] font-bold px-1.5 py-0.5">
                              +{c.extra_photo_urls.length}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.catch_date}</td>
                    <td className="px-3 py-2">
                      {speciesName(c.species_slug) ?? "—"}
                      {personalBestIds.has(c.id) && (
                        <span
                          className="ml-1.5 rounded-full bg-accent-light px-1.5 py-0.5 text-[10px] font-bold text-accent-dark"
                          title="Personal best for this species"
                        >
                          🏆 PB
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {c.location ?? "—"}
                      {c.lat !== null && c.lng !== null && (
                        <>
                          {" "}
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=14/${c.lat}/${c.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline"
                          >
                            📍 map
                          </a>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {[c.length_desc, c.weight_desc].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-3 py-2">{tackleName(c.tackle_item_id) ?? "—"}</td>
                    <td className="px-3 py-2">{c.kept ? "Kept" : "Released"}</td>
                    <td className="px-3 py-2 text-lg" title={moon.name}>
                      {moon.emoji}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap no-print">
                      <button onClick={() => startEdit(c)} className="text-accent hover:underline mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
