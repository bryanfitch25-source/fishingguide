"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { UNIT_SYSTEMS, type UnitSystem } from "@/lib/units";
import { isMissingSchemaError } from "@/lib/schema-compat";
import { AccentCard } from "./AccentCard";

// Metric/imperial, app-wide.
//
// Switching units never refetches anything and never rewrites stored data — everything
// in the database is metric and imperial is a display-time conversion (see lib/units.ts).
// So this saves the preference and refreshes the server components, which re-render the
// numbers they already had through the other formatter.
export function UnitsToggle({ initialUnits }: { initialUnits: UnitSystem }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [units, setUnits] = useState<UnitSystem>(initialUnits);
  const [message, setMessage] = useState<string | null>(null);

  async function choose(next: UnitSystem) {
    if (next === units) return;
    const previous = units;
    setUnits(next); // optimistic — the toggle should feel instant
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setUnits(previous);
      setMessage("Sign in to save a units preference.");
      return;
    }

    const { error } = await supabase
      .from("angler_settings")
      .upsert({ user_id: user.id, units: next }, { onConflict: "user_id" });

    if (error) {
      setUnits(previous);
      setMessage(
        isMissingSchemaError(error)
          ? "The units preference isn't in the database yet — run the pending migration (supabase db push) to enable it."
          : `Couldn't save that: ${error.message}`
      );
      return;
    }
    router.refresh();
  }

  return (
    <AccentCard tone="neutral" title="📏 Units">
      <div
        role="group"
        aria-label="Measurement units"
        className="inline-flex rounded-lg border border-border p-0.5"
      >
        {UNIT_SYSTEMS.map((u) => (
          <button
            key={u.value}
            onClick={() => choose(u.value)}
            aria-pressed={units === u.value}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              units === u.value ? "bg-brand text-white" : "text-muted hover:text-brand"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        {units === "imperial"
          ? "Heights in feet, wind in mph, temperature in °F, pressure in inHg."
          : "Heights in metres, wind in km/h, temperature in °C, pressure in kPa."}{" "}
        Applies everywhere, including catches you logged before switching.
      </p>
      {message && <p className="mt-2 text-sm text-danger">{message}</p>}
    </AccentCard>
  );
}
