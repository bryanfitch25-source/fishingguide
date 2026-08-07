"use client";

import { useState } from "react";
import {
  WARRANTY_TERMS,
  buildWarrantyIcs,
  computeExpiry,
  warrantyIcsFilename,
  warrantyLabel,
  warrantyStatus,
  type WarrantyStatus,
} from "@/lib/warranty";
import { localDate } from "@/lib/dates";

export interface WarrantyFormValues {
  purchase_date: string;
  warranty_expires_on: string;
  warranty_lifetime: boolean;
  warranty_provider: string;
  warranty_reference: string;
  warranty_notes: string;
}

export const EMPTY_WARRANTY: WarrantyFormValues = {
  purchase_date: "",
  warranty_expires_on: "",
  warranty_lifetime: false,
  warranty_provider: "",
  warranty_reference: "",
  warranty_notes: "",
};

const FIELD = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

const STATUS_STYLE: Record<WarrantyStatus, string> = {
  none: "text-muted",
  lifetime: "text-success",
  active: "text-success",
  expiring: "text-accent-dark font-semibold",
  expired: "text-danger",
};

/**
 * Downloads an .ics for this warranty.
 *
 * A file rather than a link to one provider's calendar: an .ics opens in whatever the
 * phone already treats as its calendar, with no account and no extra permission — and
 * the event outlives the app, which is the whole reason for putting it there.
 */
export function downloadWarrantyIcs(values: {
  itemId: string;
  itemName: string;
  expiresOn: string;
  provider?: string | null;
  reference?: string | null;
  notes?: string | null;
}) {
  const ics = buildWarrantyIcs(values);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = warrantyIcsFilename(values.itemName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoked on a delay rather than immediately: Safari has historically cancelled the
  // download if the object URL is released in the same tick as the click.
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function WarrantyFields({
  values,
  itemName,
  itemId,
  onChange,
}: {
  values: WarrantyFormValues;
  itemName: string;
  /** Null while the item is still being created — the calendar button needs a saved id. */
  itemId: string | null;
  onChange: (patch: Partial<WarrantyFormValues>) => void;
}) {
  const [term, setTerm] = useState<number | "">("");
  const today = localDate();
  const label = warrantyLabel(
    {
      warranty_expires_on: values.warranty_expires_on || null,
      warranty_lifetime: values.warranty_lifetime,
    },
    today
  );
  const status = warrantyStatus(
    {
      warranty_expires_on: values.warranty_expires_on || null,
      warranty_lifetime: values.warranty_lifetime,
    },
    today
  );

  function applyTerm(months: number) {
    setTerm(months);
    if (!values.purchase_date) return;
    const expiry = computeExpiry(values.purchase_date, months);
    if (expiry) onChange({ warranty_expires_on: expiry, warranty_lifetime: false });
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">🧾 Warranty</p>
      <p className="mt-0.5 text-xs text-muted">
        Optional, and it works on anything — a reel, a fishfinder, a pair of waders. Fill in an
        expiry and the app will remind you before it lapses.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Bought on</span>
          <input
            type="date"
            value={values.purchase_date}
            onChange={(e) => onChange({ purchase_date: e.target.value })}
            className={FIELD}
          />
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium">Cover length</span>
          <select
            value={term}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "lifetime") {
                setTerm("");
                // Mutually exclusive in the database as well — a lifetime warranty and an
                // end date are contradictory claims about the same cover.
                onChange({ warranty_lifetime: true, warranty_expires_on: "" });
                return;
              }
              if (!v) {
                setTerm("");
                return;
              }
              applyTerm(Number(v));
            }}
            className={FIELD}
          >
            <option value="">— pick to fill the date below —</option>
            {WARRANTY_TERMS.map((t) => (
              <option key={t.months} value={t.months}>
                {t.label}
              </option>
            ))}
            <option value="lifetime">Lifetime</option>
          </select>
          {!values.purchase_date && term !== "" && (
            <p className="mt-1 text-xs text-accent-dark">Add the purchase date and this will fill in.</p>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Cover ends</span>
          <input
            type="date"
            value={values.warranty_expires_on}
            disabled={values.warranty_lifetime}
            onChange={(e) => onChange({ warranty_expires_on: e.target.value, warranty_lifetime: false })}
            className={`${FIELD} disabled:opacity-50`}
          />
          {/* Always editable. The term above is a shortcut, not a rule — real warranties
              run from shipping dates, get extended on replacement, and gain a year when
              you register the product. */}
          <span className="mt-1 block text-xs text-muted">
            Adjust freely — registering a product often adds a year.
          </span>
        </label>

        <label className="flex items-center gap-2 self-end py-2 text-sm">
          <input
            type="checkbox"
            checked={values.warranty_lifetime}
            onChange={(e) =>
              onChange({
                warranty_lifetime: e.target.checked,
                warranty_expires_on: e.target.checked ? "" : values.warranty_expires_on,
              })
            }
            className="h-4 w-4"
          />
          <span className="font-medium">Lifetime warranty</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Covered by</span>
          <input
            value={values.warranty_provider}
            onChange={(e) => onChange({ warranty_provider: e.target.value })}
            placeholder="Manufacturer, or the shop"
            className={FIELD}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Order or serial number</span>
          <input
            value={values.warranty_reference}
            onChange={(e) => onChange({ warranty_reference: e.target.value })}
            className={FIELD}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Warranty notes</span>
          <textarea
            value={values.warranty_notes}
            onChange={(e) => onChange({ warranty_notes: e.target.value })}
            rows={2}
            placeholder="What's covered, where the receipt is, how to claim"
            className={FIELD}
          />
        </label>
      </div>

      {label && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={`text-sm ${STATUS_STYLE[status]}`}>{label}</span>
          {values.warranty_expires_on && (
            <button
              type="button"
              onClick={() =>
                downloadWarrantyIcs({
                  // Falls back to a temporary id so the button works before the item is
                  // saved; the UID only matters for updating an event added twice.
                  itemId: itemId ?? `draft-${Date.now()}`,
                  itemName: itemName.trim() || "Tackle item",
                  expiresOn: values.warranty_expires_on,
                  provider: values.warranty_provider,
                  reference: values.warranty_reference,
                  notes: values.warranty_notes,
                })
              }
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-brand"
            >
              📅 Add to calendar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
