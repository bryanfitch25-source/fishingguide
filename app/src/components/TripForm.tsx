"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { TripLocationPicker, type TripLocation } from "@/components/TripLocationPicker";
import type { FavouriteStation } from "@/types/tackle";
import type { LocationGuide, Species } from "@/types/content";
import type { Trip } from "@/types/trips";

export function TripForm({
  initial,
  prefillTargetSpecies,
  guides,
  favourites,
  species,
  onSaved,
  onCancel,
}: {
  /** Null for a new trip; an existing Trip to edit it in place. */
  initial: Trip | null;
  /** Species chosen via the "plan by species" flow, before a Trip row exists yet. Ignored when editing. */
  prefillTargetSpecies?: string[];
  guides: LocationGuide[];
  favourites: FavouriteStation[];
  species: Species[];
  onSaved: (trip: Trip) => void;
  onCancel: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.trip_date ?? "");
  const [location, setLocation] = useState<TripLocation | null>(
    initial && initial.lat !== null && initial.lng !== null
      ? {
          lat: initial.lat,
          lng: initial.lng,
          place_name: initial.place_name ?? "",
          province: initial.province,
          location_guide_slug: initial.location_guide_slug,
        }
      : null
  );
  const [targetSpecies, setTargetSpecies] = useState<string[]>(
    initial?.target_species ?? prefillTargetSpecies ?? []
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminder_enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSpecies(slug: string) {
    setTargetSpecies((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in to save a trip.");
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim() || "Untitled trip",
      trip_date: date || null,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      place_name: location?.place_name ?? null,
      province: location?.province ?? null,
      location_guide_slug: location?.location_guide_slug ?? null,
      target_species: targetSpecies,
      notes: notes.trim() || null,
      reminder_enabled: reminderEnabled,
    };

    const result = initial
      ? await supabase.from("trips").update(payload).eq("id", initial.id).select().single()
      : await supabase.from("trips").insert({ ...payload, user_id: user.id }).select().single();

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    onSaved(result.data as Trip);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div>
        <label className="block text-sm font-medium mb-1">Trip name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend at the Miramichi"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted">
          Leave blank if it isn&apos;t scheduled yet. Live weather only shows once your trip
          date is today — tide, sun and solunar work for any date.
        </p>
        {date && (
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            Remind me the morning of
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <TripLocationPicker value={location} onChange={setLocation} guides={guides} favourites={favourites} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target species (optional)</label>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {species.map((s) => (
            <label key={s.slug} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={targetSpecies.includes(s.slug)}
                onChange={() => toggleSpecies(s.slug)}
              />
              {s.common_name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything worth remembering — who's coming, access notes, gear to buy first"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand text-on-brand font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition disabled:opacity-60"
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Trip"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
