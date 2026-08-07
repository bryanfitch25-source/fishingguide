// Warranty tracking for anything in the tackle box.
//
// A warranty is worth nothing if you find out about it after it lapsed, and rods and
// reels are exactly the kind of purchase where the receipt goes in a drawer and the
// coverage quietly runs out. So this records the cover, warns before it ends, and hands
// the date to whatever calendar you actually look at.
//
// The date is stored, not derived. It would be tidier to keep only the purchase date and
// a term in months and compute the rest — but warranties are not arithmetic. They run
// from the shipping date sometimes and the purchase date others, they get extended when a
// unit is replaced, and registering a product often adds a year. The form computes a
// suggestion from purchase date + term; what gets saved is whatever the person accepted,
// because they are the one holding the paperwork.

/** Warning window before expiry, and the days a push reminder is sent. */
export const WARRANTY_WARNING_DAYS = 60;
export const WARRANTY_REMINDER_DAYS = [30, 7, 1, 0];

export type WarrantyStatus = "none" | "lifetime" | "active" | "expiring" | "expired";

export interface WarrantyFields {
  purchase_date?: string | null;
  warranty_expires_on?: string | null;
  warranty_lifetime?: boolean | null;
  warranty_provider?: string | null;
  warranty_reference?: string | null;
  warranty_notes?: string | null;
}

/**
 * Days from `today` until a date, counting whole days.
 *
 * Both sides are parsed at midday. A bare YYYY-MM-DD parses as UTC midnight, so anywhere
 * west of Greenwich it lands on the previous evening local time and every difference
 * comes out a day short — the same trap `lib/dates.ts` exists to close for catch dates.
 */
export function daysUntil(dateStr: string, today: string): number | null {
  const target = new Date(`${dateStr}T12:00:00`);
  const from = new Date(`${today}T12:00:00`);
  if (Number.isNaN(target.getTime()) || Number.isNaN(from.getTime())) return null;
  return Math.round((target.getTime() - from.getTime()) / 86400000);
}

export function warrantyStatus(item: WarrantyFields, today: string): WarrantyStatus {
  if (item.warranty_lifetime) return "lifetime";
  if (!item.warranty_expires_on) return "none";
  const days = daysUntil(item.warranty_expires_on, today);
  if (days === null) return "none";
  if (days < 0) return "expired";
  if (days <= WARRANTY_WARNING_DAYS) return "expiring";
  return "active";
}

export function warrantyLabel(item: WarrantyFields, today: string): string | null {
  const status = warrantyStatus(item, today);
  if (status === "none") return null;
  if (status === "lifetime") return "Lifetime warranty";
  const days = item.warranty_expires_on ? daysUntil(item.warranty_expires_on, today) : null;
  if (days === null) return null;
  if (days < 0) {
    const ago = Math.abs(days);
    // Past a few months, a day count stops being information. "Expired 2 years ago" is
    // what you actually want to know when deciding whether to bother looking for the receipt.
    if (ago >= 365) {
      const years = Math.floor(ago / 365);
      return `Warranty expired ${years} year${years === 1 ? "" : "s"} ago`;
    }
    if (ago >= 60) return `Warranty expired ${Math.floor(ago / 30)} months ago`;
    return `Warranty expired ${ago} day${ago === 1 ? "" : "s"} ago`;
  }
  if (days === 0) return "Warranty ends today";
  if (days <= WARRANTY_WARNING_DAYS) return `Warranty ends in ${days} day${days === 1 ? "" : "s"}`;
  if (days >= 365) {
    const years = Math.round((days / 365) * 10) / 10;
    return `Under warranty — ${years} year${years === 1 ? "" : "s"} left`;
  }
  return `Under warranty — ${Math.round(days / 30)} months left`;
}

/** The suggested expiry for a purchase date and a term, which the form pre-fills. */
export function computeExpiry(purchaseDate: string, months: number): string | null {
  if (!purchaseDate || !Number.isFinite(months) || months <= 0) return null;
  const d = new Date(`${purchaseDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // JavaScript rolls 31 January + 1 month into 3 March. A warranty bought on the 31st
  // should end on the last day of the target month, not skip into the next one.
  if (d.getDate() !== day) d.setDate(0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Common terms, offered as a shortcut rather than making people count months. */
export const WARRANTY_TERMS = [
  { months: 12, label: "1 year" },
  { months: 24, label: "2 years" },
  { months: 36, label: "3 years" },
  { months: 60, label: "5 years" },
  { months: 120, label: "10 years" },
];

// ---------------------------------------------------------------------------
// Calendar export
// ---------------------------------------------------------------------------

/**
 * Escapes a value for an iCalendar text property.
 *
 * RFC 5545 §3.3.11: backslash, semicolon and comma are escaped, and a newline becomes a
 * literal \n. Order matters — backslashes first, or the escapes added below get escaped
 * in turn.
 */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds a content line to 75 octets, per RFC 5545 §3.1.
 *
 * Counted in UTF-8 bytes rather than characters, and never split inside a multi-byte
 * sequence — a rod called "Pêcheur" would otherwise fold mid-ê and produce a file some
 * calendar apps reject outright. Continuation lines begin with a single space.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  // First line gets 75 octets; continuations get 74 plus the leading space.
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > limit) {
      out.push(current);
      current = "";
      currentBytes = 0;
      limit = 74;
    }
    current += char;
    currentBytes += size;
  }
  if (current) out.push(current);
  return out.join("\r\n ");
}

function icsDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function icsTimestamp(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** The day after, since DTEND on an all-day VEVENT is exclusive. */
function nextDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export interface CalendarEventInput {
  itemId: string;
  itemName: string;
  expiresOn: string;
  provider?: string | null;
  reference?: string | null;
  notes?: string | null;
  /** How many days before expiry the calendar itself should alert. */
  alarmDaysBefore?: number;
}

/**
 * An .ics file for a warranty expiry.
 *
 * A file rather than a deep link to one provider: an .ics opens in whatever the phone
 * treats as its calendar, which on an iPhone means the event lands in the same place as
 * everything else without an account or a permission grant. It also survives the app
 * being deleted, which is rather the point of putting it in a calendar.
 *
 * The event is all-day and carries a VALARM so the calendar warns independently of the
 * app's own push reminder. Two alerts from two systems is the correct amount for
 * something you get exactly one chance to act on.
 */
export function buildWarrantyIcs(input: CalendarEventInput, now = new Date()): string {
  const alarmDays = input.alarmDaysBefore ?? 14;
  const descriptionParts = [
    `Warranty on ${input.itemName} expires today.`,
    input.provider ? `Covered by: ${input.provider}` : "",
    input.reference ? `Reference: ${input.reference}` : "",
    input.notes ? `Notes: ${input.notes}` : "",
    "",
    "If it's faulty, claim before this date. Added from Maritime Angler.",
  ].filter(Boolean);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maritime Angler//Warranty//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    // Stable per item, so re-adding updates the existing event rather than duplicating it.
    `UID:warranty-${input.itemId}@maritime-angler`,
    `DTSTAMP:${icsTimestamp(now)}`,
    `DTSTART;VALUE=DATE:${icsDate(input.expiresOn)}`,
    `DTEND;VALUE=DATE:${nextDay(input.expiresOn)}`,
    `SUMMARY:${escapeText(`Warranty ends — ${input.itemName}`)}`,
    `DESCRIPTION:${escapeText(descriptionParts.join("\n"))}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `TRIGGER:-P${alarmDays}D`,
    `DESCRIPTION:${escapeText(`Warranty on ${input.itemName} ends in ${alarmDays} days`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // CRLF between lines is required by the spec, not a Windows habit.
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function warrantyIcsFilename(itemName: string): string {
  const slug =
    itemName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "item";
  return `warranty-${slug}.ics`;
}

/** Columns added by the warranty migration, for the schema-compat write fallback. */
export const WARRANTY_FIELDS = [
  "purchase_date",
  "warranty_expires_on",
  "warranty_lifetime",
  "warranty_provider",
  "warranty_reference",
  "warranty_notes",
] as const;
