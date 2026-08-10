"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { TripForm } from "@/components/TripForm";
import { TripChecklist } from "@/components/TripChecklist";
import { TripShareControl } from "@/components/TripShareControl";
import { PrintButton } from "@/components/PrintButton";
import { SEASONALITY, isInSeason } from "@/lib/seasonality";
import type { FavouriteStation, TackleItem } from "@/types/tackle";
import type { LocationGuide, Species } from "@/types/content";
import type { Trip } from "@/types/trips";

export function TripDetailClient({
  trip: initialTrip,
  guides,
  species,
  favourites,
  items,
  suggestFor,
  targetSpeciesObjs,
  otherInSeason,
  children,
}: {
  trip: Trip;
  guides: LocationGuide[];
  species: Species[];
  favourites: FavouriteStation[];
  items: TackleItem[];
  suggestFor: { slug: string; name: string }[];
  targetSpeciesObjs: Species[];
  otherInSeason: Species[];
  /** The server-rendered TripConditionsPanel (or a "no location" note) for this trip. */
  children: ReactNode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [trip, setTrip] = useState(initialTrip);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const month = trip.trip_date ? new Date(`${trip.trip_date}T12:00:00`).getMonth() + 1 : new Date().getMonth() + 1;

  async function handleDelete() {
    if (!confirm(`Delete "${trip.name}"? This can't be undone.`)) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.from("trips").delete().eq("id", trip.id);
    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }
    router.push("/trip-planner");
  }

  if (editing) {
    return (
      <div className="space-y-4 no-print">
        <Link href="/trip-planner" className="text-sm text-accent hover:underline">
          ← All trips
        </Link>
        <TripForm
          initial={trip}
          guides={guides}
          favourites={favourites}
          species={species}
          onSaved={(t) => {
            setTrip(t);
            setEditing(false);
            router.refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/trip-planner" className="no-print text-sm text-accent hover:underline">
        ← All trips
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{trip.name}</h1>
          <p className="text-muted">
            {trip.trip_date ?? "Not scheduled"}
            {trip.place_name && ` · ${trip.place_name}`}
            {trip.province && ` (${trip.province})`}
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <PrintButton />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-brand transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-danger px-3 py-2 text-sm font-medium text-danger hover:bg-danger-light transition disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="no-print">
        <TripShareControl trip={trip} onChange={(patch) => setTrip((t) => ({ ...t, ...patch }))} />
      </div>

      {deleteError && <p className="no-print text-sm text-danger">{deleteError}</p>}

      {trip.notes && (
        <p className="rounded-lg border border-border bg-surface p-3 text-sm whitespace-pre-wrap">{trip.notes}</p>
      )}

      <section>
        <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Conditions</h2>
        {children}
      </section>

      {targetSpeciesObjs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Target Species</h2>
          <ul className="space-y-2">
            {targetSpeciesObjs.map((s) => {
              const inSeason = isInSeason(s.slug, month);
              return (
                <li key={s.slug} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-2">
                  <span>
                    <Link href={`/species/${s.slug}`} className="font-semibold text-brand-dark hover:underline">
                      {s.common_name}
                    </Link>{" "}
                    <span className={inSeason ? "text-success" : "text-muted"}>
                      {inSeason ? "in season" : "out of season"}
                    </span>
                    {SEASONALITY[s.slug]?.note && <span className="text-muted"> — {SEASONALITY[s.slug].note}</span>}
                  </span>
                  <Link
                    href={`/species/${s.slug}#regulations`}
                    className="no-print text-xs text-accent hover:underline whitespace-nowrap"
                  >
                    Check regs →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {otherInSeason.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">
            Also In Season Nearby ({otherInSeason.length})
          </h2>
          <ul className="space-y-2">
            {otherInSeason.map((s) => (
              <li key={s.slug} className="flex items-center justify-between gap-3 text-sm border-b border-border pb-2">
                <span>
                  <Link href={`/species/${s.slug}`} className="font-semibold text-brand-dark hover:underline">
                    {s.common_name}
                  </Link>
                  {SEASONALITY[s.slug]?.note && <span className="text-muted"> — {SEASONALITY[s.slug].note}</span>}
                </span>
                <Link
                  href={`/species/${s.slug}#regulations`}
                  className="no-print text-xs text-accent hover:underline whitespace-nowrap"
                >
                  Check regs →
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Always confirm current bag limits, seasons and size limits on each species&apos;
            page before keeping anything — DFO variation orders can change these with
            little notice.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-brand-dark border-b border-border pb-2 mb-3">Trip Gear Checklist</h2>
        <TripChecklist items={items} suggestFor={suggestFor} />
      </section>
    </div>
  );
}
