"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Catch } from "@/types/tackle";
import { PhotoUploadField } from "./PhotoUploadField";
import { MultiPhotoField } from "./MultiPhotoField";
import { moonPhase } from "@/lib/moonphase";
import { downloadCSV } from "@/lib/csv";
import { LocationsMapLoader } from "./LocationsMapLoader";
import { CatchInsights } from "./CatchInsights";
import { CatchCard } from "./CatchCard";
import { localDate } from "@/lib/dates";
import {
  cmToLengthInput,
  formatHeight,
  formatLength,
  formatPressure,
  formatSpeed,
  formatTemperature,
  formatWeight,
  kgToWeightInput,
  lengthInputToCm,
  lengthUnitLabel,
  weightInputToKg,
  weightUnitLabel,
  type UnitSystem,
} from "@/lib/units";
import {
  writeWithSchemaFallback,
  CATCH_MIGRATION_FIELDS,
  MIGRATION_PENDING_NOTICE,
} from "@/lib/schema-compat";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

// Conditions at the selected station, fetched once when the page opens and held so a
// quick-log tap can stamp them onto a catch with no network wait. See /api/conditions.
interface ConditionsSnapshot {
  stationName: string | null;
  tideState: "rising" | "falling" | "unknown" | null;
  tideHeightM: number | null;
  weatherCondition: string | null;
  temperatureC: number | null;
  pressureKPa: number | null;
  windKmh: number | null;
}

interface SpeciesOption {
  slug: string;
  common_name: string;
}

interface TackleOption {
  id: string;
  name: string;
}

function today() {
  return localDate();
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
  length_value: "", // entered in the display unit; converted to cm on save
  weight_value: "",
  kept: false,
  notes: "",
  photo_url: "",
  extra_photo_urls: [] as string[],
  lat: null as number | null,
  lng: null as number | null,
  // Carried through from a quick-log tap so the conditions saved are the ones at the
  // moment of the catch, not at the moment the form was submitted.
  snapshot: null as ConditionsSnapshot | null,
  caught_at: null as string | null,
};

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

export function CatchLogClient({
  species,
  units = "metric",
}: {
  species: SpeciesOption[];
  units?: UnitSystem;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [tackle, setTackle] = useState<TackleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  // Whether the angler has set the date themselves. A photo's own timestamp is a better
  // guess than today, but only a guess — once someone types a date it stands.
  const [dateTouched, setDateTouched] = useState(false);
  // The date a photo supplied, kept only so the form can say where it came from.
  const [dateFromPhoto, setDateFromPhoto] = useState<string | null>(null);
  // One Insights panel, three tabs. There used to be two independent toggles — "Year in
  // Review & Life List" and "Patterns" — that could both be open at once, stacking two
  // full-width analysis panels above the catches they were analysing, and neither of
  // which mentioned the other existed. They are the same kind of thing: looking back at
  // what you have already logged. So they share one button and one open/closed state.
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsTab, setInsightsTab] = useState<"review" | "patterns" | "lifelist">("review");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locateState, setLocateState] = useState<LocateState>("idle");
  const [conditions, setConditions] = useState<ConditionsSnapshot | null>(null);
  const [toast, setToast] = useState<string | null>(null);
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

  // Warm the conditions snapshot as soon as the page opens, so the quick-log button is
  // instant when it's tapped. Failing here is harmless — the button still logs the
  // catch, just without the conditions attached.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/conditions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ConditionsSnapshot | null) => {
        if (!cancelled && data) setConditions(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  }

  function startAdd() {
    setForm(emptyForm);
    setDateTouched(false);
    setDateFromPhoto(null);
    setShowForm(true);
  }

  /**
   * One-touch logging: freeze the conditions and the clock right now, then open the
   * form for just a species and a photo.
   *
   * The snapshot is taken at the tap rather than at submit because that's the moment
   * being recorded — picking a photo can take a minute, and by then the tide has moved
   * and the whole point of capturing it is lost. GPS is requested in parallel and never
   * blocks: if it hasn't arrived by the time the catch is saved, the catch saves
   * without coordinates rather than making someone wait at the water.
   */
  function startQuickLog() {
    const now = new Date();
    setDateTouched(false);
    setDateFromPhoto(null);
    setForm({
      ...emptyForm,
      catch_date: localDate(now),
      caught_at: now.toISOString(),
      snapshot: conditions,
      location: conditions?.stationName ?? "",
    });
    setShowForm(true);

    if ("geolocation" in navigator) {
      setLocateState("locating");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
          setLocateState("idle");
        },
        () => setLocateState("denied"),
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  }

  function startEdit(c: Catch) {
    // Editing an existing catch: its date is already a decision, so a photo added later
    // must not quietly move it.
    setDateTouched(true);
    setDateFromPhoto(null);
    setForm({
      id: c.id,
      species_slug: c.species_slug ?? "",
      catch_date: c.catch_date,
      location: c.location ?? "",
      tackle_item_id: c.tackle_item_id ?? "",
      length_desc: c.length_desc ?? "",
      weight_desc: c.weight_desc ?? "",
      // Numeric values are stored metric; show them in whichever units are selected.
      length_value:
        c.length_cm == null ? "" : String(Number(cmToLengthInput(c.length_cm, units).toFixed(1))),
      weight_value:
        c.weight_kg == null ? "" : String(Number(kgToWeightInput(c.weight_kg, units).toFixed(2))),
      kept: c.kept,
      notes: c.notes ?? "",
      photo_url: c.photo_url ?? "",
      extra_photo_urls: c.extra_photo_urls ?? [],
      lat: c.lat,
      lng: c.lng,
      // Editing must not restamp a catch with today's conditions — keep whatever was
      // recorded when it was caught, including nothing.
      snapshot: {
        stationName: c.tide_station_name,
        tideState: c.tide_state,
        tideHeightM: c.tide_height_m,
        weatherCondition: c.weather_condition,
        temperatureC: c.temperature_c,
        pressureKPa: c.pressure_kpa,
        windKmh: c.wind_kmh,
      },
      caught_at: c.caught_at,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const c = catches.find((x) => x.id === id);
    const label = c ? speciesName(c.species_slug) ?? "this catch" : "this catch";
    if (!confirm(`Delete ${label} from ${c?.catch_date ?? "your log"}? This can't be undone.`)) {
      return;
    }
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

    const lengthNumber = parseFloat(form.length_value);
    const weightNumber = parseFloat(form.weight_value);

    const payload = {
      user_id: user.id,
      species_slug: form.species_slug || null,
      catch_date: form.catch_date,
      location: form.location.trim() || null,
      tackle_item_id: form.tackle_item_id || null,
      length_desc: form.length_desc.trim() || null,
      weight_desc: form.weight_desc.trim() || null,
      length_cm: Number.isFinite(lengthNumber) ? lengthInputToCm(lengthNumber, units) : null,
      weight_kg: Number.isFinite(weightNumber) ? weightInputToKg(weightNumber, units) : null,
      kept: form.kept,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
      extra_photo_urls: form.extra_photo_urls,
      lat: form.lat,
      lng: form.lng,
      caught_at: form.caught_at,
      tide_state: form.snapshot?.tideState ?? null,
      tide_height_m: form.snapshot?.tideHeightM ?? null,
      tide_station_name: form.snapshot?.stationName ?? null,
      weather_condition: form.snapshot?.weatherCondition ?? null,
      temperature_c: form.snapshot?.temperatureC ?? null,
      pressure_kpa: form.snapshot?.pressureKPa ?? null,
      wind_kmh: form.snapshot?.windKmh ?? null,
    };

    // Goes through the schema-compat path so logging a catch keeps working in the window
    // between this code deploying and the migration being applied — see lib/schema-compat.
    const { error, degraded } = await writeWithSchemaFallback(
      payload,
      CATCH_MIGRATION_FIELDS,
      (p) =>
        form.id
          ? supabase.from("catches").update(p).eq("id", form.id)
          : supabase.from("catches").insert(p)
    );

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    showToast(degraded ? MIGRATION_PENDING_NOTICE : form.id ? "Catch updated." : "Catch logged.");
    loadAll();
  }

  const speciesName = (slug: string | null) =>
    slug ? species.find((s) => s.slug === slug)?.common_name ?? slug : null;
  const tackleName = (id: string | null) => (id ? tackle.find((t) => t.id === id)?.name ?? null : null);

  // Personal best per species, by length. Now reads the numeric column the migration
  // backfilled, so historical free-text entries compete too — anything the parser
  // couldn't read simply doesn't contend for the badge.
  const personalBestIds = useMemo(() => {
    const bestBySpecies = new Map<string, { id: string; cm: number }>();
    for (const c of catches) {
      if (!c.species_slug || c.length_cm == null) continue;
      const current = bestBySpecies.get(c.species_slug);
      if (!current || c.length_cm > current.cm) {
        bestBySpecies.set(c.species_slug, { id: c.id, cm: c.length_cm });
      }
    }
    return new Set([...bestBySpecies.values()].map((v) => v.id));
  }, [catches]);

  // Catches arrive newest-first from the query, so walking them in order yields the
  // months in order too — no second sort needed.
  const catchesByMonth = useMemo(() => {
    const groups = new Map<string, Catch[]>();
    for (const c of catches) {
      const key = (c.catch_date ?? "").slice(0, 7); // YYYY-MM
      const list = groups.get(key);
      if (list) list.push(c);
      else groups.set(key, [c]);
    }
    return [...groups.entries()].map(([key, items]) => ({
      key,
      label: key
        ? new Date(`${key}-01T12:00:00`).toLocaleDateString("en-CA", {
            month: "long",
            year: "numeric",
          })
        : "Undated",
      items,
    }));
  }, [catches]);

  // Prefers the numeric value (unit-aware) and falls back to whatever free text was
  // originally typed, so a catch recorded as "about a footer" still shows something.
  function sizeLabel(c: Catch): string {
    const parts = [
      c.length_cm != null ? formatLength(c.length_cm, units) : c.length_desc,
      c.weight_kg != null ? formatWeight(c.weight_kg, units) : c.weight_desc,
    ].filter(Boolean);
    return parts.length ? parts.join(" / ") : "—";
  }

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
    if (catches.length === 0) {
      showToast("Nothing to export yet.");
      return;
    }
    // Exports in the units currently selected, same as everything on screen.
    downloadCSV(
      "catch-log.csv",
      [
        "Date",
        "Time",
        "Species",
        "Location",
        "Length",
        "Weight",
        "Tackle",
        "Kept",
        "Tide",
        "Tide Height",
        "Weather",
        "Temperature",
        "Wind",
        "Pressure",
        "Moon Phase",
        "Latitude",
        "Longitude",
        "Notes",
      ],
      catches.map((c) => [
        c.catch_date,
        c.caught_at
          ? new Date(c.caught_at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })
          : "",
        speciesName(c.species_slug) ?? "",
        c.location ?? "",
        c.length_cm != null ? formatLength(c.length_cm, units) : c.length_desc ?? "",
        c.weight_kg != null ? formatWeight(c.weight_kg, units) : c.weight_desc ?? "",
        tackleName(c.tackle_item_id) ?? "",
        c.kept ? "Kept" : "Released",
        c.tide_state ?? "",
        c.tide_height_m != null ? formatHeight(c.tide_height_m, units) : "",
        c.weather_condition ?? "",
        c.temperature_c != null ? formatTemperature(c.temperature_c, units) : "",
        c.wind_kmh != null ? formatSpeed(c.wind_kmh, units) : "",
        c.pressure_kpa != null ? formatPressure(c.pressure_kpa, units) : "",
        moonPhase(c.catch_date).name,
        c.lat ?? "",
        c.lng ?? "",
        c.notes ?? "",
      ])
    );
  }

  return (
    <div>
      {catches.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-border bg-surface card-lift p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.total}</p>
            <p className="text-xs text-muted">Total Catches</p>
          </div>
          <div className="rounded-xl border border-border bg-surface card-lift p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.uniqueSpecies}</p>
            <p className="text-xs text-muted">Species Caught</p>
          </div>
          <div className="rounded-xl border border-border bg-surface card-lift p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.thisYear}</p>
            <p className="text-xs text-muted">This Year ({thisYear})</p>
          </div>
          <div className="rounded-xl border border-border bg-surface card-lift p-3 text-center">
            <p className="text-2xl font-extrabold text-catches">{stats.kept}</p>
            <p className="text-xs text-muted">Kept</p>
          </div>
          <div className="rounded-xl border border-border bg-surface card-lift p-3 text-center">
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
              onClick={() => setInsightsOpen((v) => !v)}
              aria-expanded={insightsOpen}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-catches transition"
            >
              📊 {insightsOpen ? "Hide insights" : "Insights"}
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

      {insightsOpen && (
        <div className="mb-6 rounded-xl border border-border bg-surface card-lift p-5 no-print">
          <div role="tablist" aria-label="Insights" className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["review", `📅 ${thisYear} in Review`],
                ["patterns", "📊 Patterns"],
                ["lifelist", `🏅 Life List (${caughtSlugs.size}/${species.length})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={insightsTab === id}
                onClick={() => setInsightsTab(id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  insightsTab === id
                    ? "bg-catches text-on-brand"
                    : "border border-border text-muted hover:border-catches"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {insightsTab === "review" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
          )}

          {insightsTab === "patterns" && (
            <CatchInsights catches={catches} units={units} species={species} />
          )}

          {insightsTab === "lifelist" && (
            <div className="flex flex-wrap gap-1.5">
              {lifeList.map((s) => (
                <span
                  key={s.slug}
                  title={s.caught ? `First caught ${s.firstCatchDate}` : "Not caught yet"}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.caught ? "bg-catches-light text-catches" : "bg-background text-muted"
                  }`}
                >
                  {s.caught ? "🏅" : "⚪"} {s.common_name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mb-4 rounded bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-surface card-lift p-5 space-y-4 no-print"
        >
          <h2 className="font-bold text-brand-dark">{form.id ? "Edit Catch" : "New Catch"}</h2>

          {form.snapshot?.tideState && (
            <div className="rounded-lg border border-brand-light bg-brand-light/40 px-3 py-2 text-xs text-brand-dark">
              <span className="font-semibold">Conditions captured:</span>{" "}
              {form.snapshot.tideState === "rising" ? "↑ Rising" : form.snapshot.tideState === "falling" ? "↓ Falling" : "Tide unknown"}
              {form.snapshot.tideHeightM != null && ` ${formatHeight(form.snapshot.tideHeightM, units)}`}
              {form.snapshot.stationName && ` at ${form.snapshot.stationName}`}
              {form.snapshot.weatherCondition && ` · ${form.snapshot.weatherCondition}`}
              {form.snapshot.temperatureC != null &&
                ` · ${formatTemperature(form.snapshot.temperatureC, units)}`}
              {form.snapshot.windKmh != null && ` · wind ${formatSpeed(form.snapshot.windKmh, units)}`}
              <span className="mt-0.5 block text-muted">
                Recorded at the moment you tapped Quick Log — saved with this catch.
              </span>
            </div>
          )}
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
                onChange={(e) => {
                  setDateTouched(true);
                  setForm({ ...form, catch_date: e.target.value });
                }}
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
              <label className="block text-sm font-medium mb-1">
                Length ({lengthUnitLabel(units)})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={form.length_value}
                onChange={(e) => setForm({ ...form, length_value: e.target.value })}
                placeholder={units === "imperial" ? "18" : "45"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {form.length_desc && !form.length_value && (
                <p className="mt-1 text-[11px] text-muted">
                  Originally recorded as &ldquo;{form.length_desc}&rdquo; — enter a number to make
                  it convert and count for personal bests.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Weight ({weightUnitLabel(units)})
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.weight_value}
                onChange={(e) => setForm({ ...form, weight_value: e.target.value })}
                placeholder={units === "imperial" ? "2.5" : "1.1"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {form.weight_desc && !form.weight_value && (
                <p className="mt-1 text-[11px] text-muted">
                  Originally recorded as &ldquo;{form.weight_desc}&rdquo;.
                </p>
              )}
            </div>
            <div>
              <PhotoUploadField
                folder="catches"
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
                onGpsDetected={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
                onDateDetected={(d) => {
                  if (dateTouched) return;
                  setForm((f) => ({ ...f, catch_date: d }));
                  setDateFromPhoto(d);
                }}
              />
              <p className="mt-1 text-[11px] text-muted">
                If the photo has location data, we&apos;ll fill in the spot automatically — the
                📍 button above still works too.
              </p>
              {dateFromPhoto && dateFromPhoto === form.catch_date && (
                <p className="mt-1 text-[11px] text-muted">
                  Date set to {dateFromPhoto} from the photo&apos;s own timestamp. Change it
                  above if that&apos;s not right.
                </p>
              )}
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
        <p className="text-muted text-sm">
          No catches logged yet — tap the 🎣 button to log one with the tide and weather
          captured automatically, or use &ldquo;Log a Catch&rdquo; above to fill in the details
          yourself.
        </p>
      ) : (
        <>
          {/* Grouped by month so the log stays navigable as it grows, and so the passage
              of a season is visible rather than implied by a date column. */}
          {catchesByMonth.map(({ key, label, items }) => (
            <section key={key} className="mb-6">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                {label} · {items.length} catch{items.length === 1 ? "" : "es"}
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {items.map((c) => (
                  <CatchCard
                    key={c.id}
                    c={c}
                    speciesName={speciesName}
                    tackleName={tackleName}
                    isPersonalBest={personalBestIds.has(c.id)}
                    units={units}
                    onEdit={() => startEdit(c)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* A photo grid prints badly — four tiles a page and the numbers scattered.
              The Print button still exists, so the old tabular view survives as a
              print-only sheet rather than being lost with the table. */}
          <table data-print-only className="hidden w-full text-sm print:table">
            <thead>
              <tr>
                {["Date", "Species", "Location", "Size", "Tackle", "Kept?", "Moon"].map((h) => (
                  <th key={h} className="border-b border-border px-2 py-1 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catches.map((c) => (
                <tr key={c.id}>
                  <td className="border-b border-border px-2 py-1">{c.catch_date}</td>
                  <td className="border-b border-border px-2 py-1">{speciesName(c.species_slug) ?? "—"}</td>
                  <td className="border-b border-border px-2 py-1">{c.location ?? "—"}</td>
                  <td className="border-b border-border px-2 py-1">{sizeLabel(c)}</td>
                  <td className="border-b border-border px-2 py-1">{tackleName(c.tackle_item_id) ?? "—"}</td>
                  <td className="border-b border-border px-2 py-1">{c.kept ? "Kept" : "Released"}</td>
                  <td className="border-b border-border px-2 py-1">{moonPhase(c.catch_date).name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white shadow-lg no-print"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}
        >
          {toast}
        </div>
      )}

      {/* One-touch logging. Fixed to the corner so it's reachable at any scroll
          position, and inset for the iPhone home indicator since this runs as a
          Home Screen app. */}
      {!showForm && (
        <button
          onClick={startQuickLog}
          title={
            conditions
              ? `Quick log — captures the tide and weather at ${conditions.stationName ?? "your station"} right now`
              : "Quick log a catch"
          }
          aria-label="Quick log a catch"
          className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-lg transition hover:bg-accent-dark no-print"
          style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          🎣
        </button>
      )}
    </div>
  );
}
