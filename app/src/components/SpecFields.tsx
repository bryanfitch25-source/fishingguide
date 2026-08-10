"use client";

import { TACKLE_SPECS, fieldsFor, summarise, cleanSpecs, type SpecField, type SpecValues } from "@/lib/tackle-specs";
import type { TackleCategory } from "@/types/tackle";

// The part of the tackle form that differs by category.
//
// Its own file rather than another block inside TackleBoxClient, which is already long
// enough that adding fifty more fields to it would make the thing unreadable — and
// because a component that can be rendered on its own can be checked on its own, against
// every category, without a database.

const INPUT_CLASS = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

/**
 * One field, rendered from its definition.
 *
 * Driven off the schema rather than written out by hand nine times: there are fifty-odd
 * fields across the categories, and hand-writing each would guarantee they drift apart in
 * spacing, in how a unit is shown, and in which ones remembered to handle an empty value.
 */
export function SpecInput({
  field,
  value,
  onChange,
}: {
  field: SpecField;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  if (field.type === "toggle") {
    return (
      <label className="flex items-center gap-2 self-end py-2 text-sm">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="font-medium">{field.label}</span>
      </label>
    );
  }

  const str = typeof value === "string" ? value : "";

  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <label className="mb-1 block text-sm font-medium">
        {field.label}
        {field.unit && <span className="ml-1 font-normal text-muted">({field.unit})</span>}
      </label>
      {field.type === "select" ? (
        <select value={str} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={INPUT_CLASS}
        />
      )}
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
    </div>
  );
}

/**
 * The whole category block: heading, fields, and a live preview of the summary line.
 *
 * The preview is there because the summary is derived rather than typed — without it,
 * nothing on screen would connect these fields to the text that ends up on the list row,
 * and the old hand-written "Color / Size" box at least made that obvious.
 */
export function SpecFieldGrid({
  category,
  specs,
  legacySummary,
  onChange,
  bare = false,
}: {
  category: TackleCategory;
  specs: SpecValues;
  /** Free text from before these fields existed, so an old item's description is visible. */
  legacySummary?: string;
  onChange: (id: string, value: string | boolean) => void;
  /** Skips the outer border and the title/blurb — for a caller (FormSection) that
      already supplies both, so the category name doesn't appear as a heading twice. */
  bare?: boolean;
}) {
  const spec = TACKLE_SPECS[category];
  const preview = summarise(category, cleanSpecs(specs));

  const body = (
    <>
      <div className={bare ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"}>
        {fieldsFor(category).map((field) => (
          <SpecInput
            key={field.id}
            field={field}
            value={specs[field.id]}
            onChange={(v) => onChange(field.id, v)}
          />
        ))}
      </div>
      {preview && (
        <p className="mt-3 text-xs text-muted">
          Shows in your list as <strong className="text-brand-dark">{preview}</strong>
        </p>
      )}
      {!preview && legacySummary && (
        <p className="mt-3 text-xs text-muted">
          Currently shows as <strong className="text-brand-dark">{legacySummary}</strong>, from
          before these fields existed. Fill any of them in and that takes over.
        </p>
      )}
    </>
  );

  if (bare) return body;

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">{spec.title}</p>
      {spec.blurb && <p className="mt-0.5 text-xs text-muted">{spec.blurb}</p>}
      {body}
    </div>
  );
}
