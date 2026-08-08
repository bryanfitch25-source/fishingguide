"use client";

import { useState } from "react";
import { TACTICS_BASIS_NOTE, tacticsFor } from "@/lib/species-tactics";

const ROWS: { key: "season" | "column" | "retrieve" | "hookset" | "window"; label: string; icon: string }[] = [
  { key: "season", label: "When they switch on", icon: "📅" },
  { key: "window", label: "The window", icon: "🕓" },
  { key: "column", label: "Where in the water", icon: "📏" },
  { key: "retrieve", label: "How to work it", icon: "🎣" },
  { key: "hookset", label: "Setting the hook", icon: "⚓" },
];

// Applied technique for one species, on that species' page.
//
// Collapsed by default below the first two rows. The guide sections above are already
// long, and someone who opens a species page mid-trip usually wants the window and the
// retrieve rather than an essay — the rest is a tap away.
export function SpeciesTactics({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const t = tacticsFor(slug);
  if (!t) return null;

  const shown = open ? ROWS : ROWS.slice(0, 2);

  return (
    <section className="mb-8">
      <h2 className="mb-1 border-b border-border pb-2 text-xl font-bold text-brand-dark">
        How to Actually Catch One
      </h2>
      <p className="mb-3 text-xs text-muted">{TACTICS_BASIS_NOTE}</p>

      <div className="space-y-2">
        {shown.map((r) => (
          <div key={r.key} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              <span aria-hidden>{r.icon}</span> {r.label}
            </p>
            <p className="mt-1 text-sm">{t[r.key]}</p>
          </div>
        ))}

        {open && (
          <>
            <div className="rounded-xl border border-accent bg-accent-light p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                What costs most people fish
              </p>
              <p className="mt-1 text-sm">{t.mistake}</p>
            </div>
            {t.stepUp && (
              <div className="rounded-xl border border-brand bg-brand-light p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Once that&apos;s working
                </p>
                <p className="mt-1 text-sm">{t.stepUp}</p>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition hover:border-brand"
      >
        {open ? "− Show less" : "+ Water column, retrieve, hookset and the common mistake"}
      </button>
    </section>
  );
}
