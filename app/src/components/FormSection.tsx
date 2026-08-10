"use client";

import { useState, type ReactNode } from "react";

// A closed-by-default section for a form with more fields than any one entry needs —
// e.g. the tackle item form, where a lure and a rod share three fields and differ on
// the rest. Same interaction language as FilterDisclosure (closed until tapped, a badge
// carries what's inside so closing it doesn't hide that something's set), but a separate
// component: FilterDisclosure's activeCount always reflects the live URL/state and is
// meant to draw the eye when non-zero, while a form section's filledCount is just a
// summary of what's already been typed — worth showing, not worth alarming over — and
// its callers don't share a filter's "narrowing a list" semantics.

export function FormSection({
  label,
  filledCount,
  children,
}: {
  label: ReactNode;
  /** Fields already filled in this section, shown as a badge on the closed header. */
  filledCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
          {label}
          {!!filledCount && (
            <span className="rounded-full bg-brand-light px-1.5 py-0.5 text-[11px] font-bold text-brand">
              {filledCount}
            </span>
          )}
        </span>
        <span aria-hidden className="text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="space-y-3 border-t border-border p-3 pt-3">{children}</div>}
    </div>
  );
}
