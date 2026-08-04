"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { AnglerSettings, WaterPreference } from "@/types/tackle";
import { AccentCard } from "./AccentCard";

const WATER_OPTIONS: { value: WaterPreference; label: string }[] = [
  { value: "salt", label: "Saltwater" },
  { value: "fresh", label: "Freshwater" },
  { value: "both", label: "Both" },
];

// Slack Water's Fisherman Profile, folded into settings rather than given its own
// screen.
//
// Two deliberate changes from the original. The rod/reel/line/leader fields are gone:
// this app already has a tackle box that records those as real items with photos,
// trays, species tags and service history, so duplicating them as free text would give
// two places to look and no way to tell which is current. And favourite species is a
// picker over the guide content instead of a text field, so it can link somewhere.
export function AnglerProfileForm({
  initial,
  species,
}: {
  initial: Partial<AnglerSettings> | null;
  species: { slug: string; common_name: string }[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState({
    angler_name: initial?.angler_name ?? "",
    favourite_species_slug: initial?.favourite_species_slug ?? "",
    favourite_lure: initial?.favourite_lure ?? "",
    water_preference: (initial?.water_preference ?? "") as WaterPreference | "",
    profile_notes: initial?.profile_notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Sign in to save your profile.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("angler_settings").upsert(
      {
        user_id: user.id,
        angler_name: form.angler_name || null,
        favourite_species_slug: form.favourite_species_slug || null,
        favourite_lure: form.favourite_lure || null,
        water_preference: form.water_preference || null,
        profile_notes: form.profile_notes || null,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);
    setMessage(error ? `Couldn't save: ${error.message}` : "Profile saved.");
    if (!error) setTimeout(() => setMessage(null), 2500);
  }

  return (
    <AccentCard tone="neutral" title="🎣 Angler profile">
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="angler_name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input
              id="angler_name"
              value={form.angler_name}
              onChange={(e) => setForm({ ...form, angler_name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="favourite_species" className="mb-1 block text-sm font-medium">
              Favourite fish
            </label>
            <select
              id="favourite_species"
              value={form.favourite_species_slug}
              onChange={(e) => setForm({ ...form, favourite_species_slug: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— None chosen —</option>
              {species.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.common_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="favourite_lure" className="mb-1 block text-sm font-medium">
              Favourite lure
            </label>
            <input
              id="favourite_lure"
              value={form.favourite_lure}
              onChange={(e) => setForm({ ...form, favourite_lure: e.target.value })}
              placeholder="e.g. white bucktail jig"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="water_preference" className="mb-1 block text-sm font-medium">
              Water preference
            </label>
            <select
              id="water_preference"
              value={form.water_preference}
              onChange={(e) =>
                setForm({ ...form, water_preference: e.target.value as WaterPreference | "" })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— No preference —</option>
              {WATER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="profile_notes" className="mb-1 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="profile_notes"
            rows={3}
            value={form.profile_notes}
            onChange={(e) => setForm({ ...form, profile_notes: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          {message && <span className="text-sm text-muted">{message}</span>}
        </div>

        <p className="text-xs text-muted">
          Your rods, reels and line live in the{" "}
          <a href="/tackle" className="text-brand underline">
            Tackle Box
          </a>{" "}
          as real items with photos and service history — this is just the at-a-glance stuff.
        </p>
      </form>
    </AccentCard>
  );
}
