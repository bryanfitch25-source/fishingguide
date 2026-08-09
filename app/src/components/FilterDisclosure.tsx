"use client";

import { useState, type ReactNode } from "react";

// A closed-by-default panel for secondary filters, and a matching compact select.
//
// WHY THIS EXISTS
//
// Several screens filter the same list along more than one dimension — Matcher by method,
// water and province; the Fly Box reference by quarry and fly type. Each dimension used to
// be its own row of pill buttons, so a page could show three or four stacked rows of
// bubbles before any actual content appeared. That's what "too many bubble menus" means in
// practice: not that any one row is wrong, but that they pile up.
//
// A `<select>` already carries exactly the behaviour being asked for elsewhere in the app
// — closed until you interact with it, one visible line, standard and familiar — so rather
// than inventing a bespoke toggle per filter, multi-choice filters become selects, and
// selects with more than one dimension are grouped behind a single disclosure that itself
// starts closed. The primary content tabs (which section of a page you're looking at) are
// deliberately left alone: those are navigation, not filtering, and collapsing them behind
// another toggle would cost more than it saves.
//
// The badge on the toggle carries the state that used to be visible in the open pill rows
// — "how many filters are active" — so closing the panel doesn't hide the fact that a
// filter is narrowing what's shown.

export function FilterDisclosure({
  activeCount,
  children,
  label = "Filters",
}: {
  activeCount: number;
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-muted">
          {label}
          {activeCount > 0 && (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-on-brand">
              {activeCount}
            </span>
          )}
        </span>
        <span aria-hidden className="text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="space-y-2.5 border-t border-border p-3">{children}</div>}
    </div>
  );
}

export function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
