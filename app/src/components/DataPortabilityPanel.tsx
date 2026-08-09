"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  IMPORT_NOTE,
  PORTABLE_TABLES,
  TABLE_LABEL,
  buildBundle,
  downloadBundle,
  parseBundle,
  planImport,
  type Bundle,
  type ImportPlan,
  type PortableTable,
} from "@/lib/data-portability";

type Phase = "idle" | "working" | "preview" | "done";

export function DataPortabilityPanel() {
  const supabase = useState(() => createClient())[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState<ImportPlan[] | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);

  async function fetchAll(): Promise<Record<PortableTable, Record<string, unknown>[]>> {
    const [catches, items, trays] = await Promise.all(
      PORTABLE_TABLES.map((t) => supabase.from(t).select("*"))
    );
    return {
      catches: (catches.data ?? []) as Record<string, unknown>[],
      tackle_items: (items.data ?? []) as Record<string, unknown>[],
      tackle_trays: (trays.data ?? []) as Record<string, unknown>[],
    };
  }

  async function handleExport() {
    setPhase("working");
    setError(null);
    setMessage(null);
    try {
      const rows = await fetchAll();
      const b = buildBundle(rows);
      downloadBundle(b);
      const total = PORTABLE_TABLES.reduce((n, t) => n + b.rows[t].length, 0);
      setMessage(`Exported ${total} ${total === 1 ? "row" : "rows"}.`);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
      setPhase("idle");
    }
  }

  async function handleFile(file: File) {
    setPhase("working");
    setError(null);
    setMessage(null);
    setPlan(null);

    const text = await file.text();
    const parsed = parseBundle(text);
    if (!parsed.bundle) {
      setError(parsed.error);
      setPhase("idle");
      return;
    }
    try {
      const existing = await fetchAll();
      setBundle(parsed.bundle);
      setPlan(planImport(parsed.bundle, existing));
      setPhase("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read your existing data to compare against.");
      setPhase("idle");
    }
  }

  async function confirmImport() {
    if (!plan || !bundle) return;
    setPhase("working");
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You've been signed out — please sign in again.");
      setPhase("preview");
      return;
    }

    let added = 0;
    for (const p of plan) {
      if (p.toAdd.length === 0) continue;
      // user_id comes from the session, never from the file. See the header note in
      // lib/data-portability.
      const rows = p.toAdd.map((r) => ({ ...r, user_id: user.id }));
      const { error: insertError } = await supabase.from(p.table).insert(rows);
      if (insertError) {
        setError(
          `Stopped while adding ${TABLE_LABEL[p.table]}: ${insertError.message}. ` +
            `${added} ${added === 1 ? "row was" : "rows were"} added before this — running the file again will skip those and retry the rest.`
        );
        setPhase("preview");
        return;
      }
      added += rows.length;
    }

    setMessage(`Added ${added} ${added === 1 ? "row" : "rows"}. Reload to see them.`);
    setPlan(null);
    setBundle(null);
    setPhase("done");
    if (fileRef.current) fileRef.current.value = "";
  }

  function cancel() {
    setPlan(null);
    setBundle(null);
    setPhase("idle");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const totalToAdd = plan?.reduce((n, p) => n + p.toAdd.length, 0) ?? 0;
  const totalDupes = plan?.reduce((n, p) => n + p.duplicates, 0) ?? 0;

  return (
    <section className="rounded-xl border border-border bg-surface card-lift p-5">
      <h2 className="mb-1 font-bold text-brand-dark">Your data</h2>
      <p className="mb-3 text-sm text-muted">
        A complete, re-importable copy of your catches, tackle and trays. The CSV buttons on
        the Catch Log and Tackle Box are still there for spreadsheets — this is the one that
        can come back in.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={phase === "working"}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-on-brand transition hover:opacity-90 disabled:opacity-50"
        >
          {phase === "working" ? "Working…" : "Export everything"}
        </button>

        <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:border-brand">
          Import a file
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {message && (
        <p className="mt-3 rounded-lg bg-success-light px-3 py-2 text-sm text-success">{message}</p>
      )}

      {phase === "preview" && plan && (
        <div className="mt-3 rounded-lg border border-accent bg-accent-light p-3">
          <p className="font-semibold text-accent-dark">
            {totalToAdd === 0
              ? "Nothing new in that file"
              : `${totalToAdd} ${totalToAdd === 1 ? "row" : "rows"} will be added`}
          </p>
          <ul className="mt-1.5 space-y-0.5 text-sm">
            {plan.map((p) => (
              <li key={p.table}>
                <span className="font-medium">{TABLE_LABEL[p.table]}:</span> {p.toAdd.length} to add
                {p.duplicates > 0 && (
                  <span className="text-muted"> · {p.duplicates} already here, skipping</span>
                )}
              </li>
            ))}
          </ul>
          {totalDupes > 0 && totalToAdd === 0 && (
            <p className="mt-1.5 text-sm text-muted">
              Everything in this file is already in your account. Nothing to do.
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmImport}
              disabled={totalToAdd === 0}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-on-brand transition hover:opacity-90 disabled:opacity-50"
            >
              Add {totalToAdd} {totalToAdd === 1 ? "row" : "rows"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-brand"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted">{IMPORT_NOTE}</p>
    </section>
  );
}
