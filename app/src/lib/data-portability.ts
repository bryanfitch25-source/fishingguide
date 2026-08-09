// Getting your data out, and back in again.
//
// WHY IMPORT AND NOT JUST EXPORT
//
// CSV export already existed on both the catch log and the tackle box, which is half the
// promise. The other half is that the data can come back — a one-way export is a
// consolation prize, not portability. Without import, "your data is never trapped in the
// app" is only true if you never intend to use it again.
//
// WHAT THIS IS FOR, CONCRETELY
//
// Moving to a new account, restoring after something went wrong, and keeping a backup you
// can actually act on. CSV stays for spreadsheets; this is the round-trippable format.
//
// THE RULES IT WORKS UNDER
//
// 1. Import ADDS. It never updates and never deletes. An import that could overwrite is
//    an import that can destroy a season's records because someone picked the wrong file,
//    and no confirmation dialog is worth that risk.
//
// 2. Duplicates are skipped, not merged. Re-importing the same file twice must leave you
//    with one copy, so the operation is safe to retry — which matters, because a partial
//    import is exactly the situation where someone runs it again.
//
// 3. Nothing is written until a preview has been shown. The user sees what will be added
//    and what will be skipped, and confirms.
//
// 4. Ids are dropped on import. Rows get new ones, and user_id comes from the current
//    session — never from the file. Honouring a user_id out of a file would be a way to
//    write into someone else's rows, and RLS would reject it anyway; better to be clear
//    about it here than to send a confusing error.

export const BUNDLE_VERSION = 1;
export const BUNDLE_KIND = "maritime-angler-export";

/** The tables worth carrying. Reference data is re-derived, so only personal rows travel. */
export const PORTABLE_TABLES = ["catches", "tackle_items", "tackle_trays"] as const;
export type PortableTable = (typeof PORTABLE_TABLES)[number];

export interface Bundle {
  kind: typeof BUNDLE_KIND;
  version: number;
  exportedAt: string;
  rows: Record<PortableTable, Record<string, unknown>[]>;
}

/** Columns stripped on the way out — server-owned, or meaningless in another account. */
const STRIP = new Set(["id", "user_id", "created_at", "updated_at"]);

function clean(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (STRIP.has(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function buildBundle(rows: Record<PortableTable, Record<string, unknown>[]>): Bundle {
  return {
    kind: BUNDLE_KIND,
    version: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    rows: {
      catches: rows.catches.map(clean),
      tackle_items: rows.tackle_items.map(clean),
      tackle_trays: rows.tackle_trays.map(clean),
    },
  };
}

export function bundleFilename(now = new Date()): string {
  return `maritime-angler-${now.toISOString().slice(0, 10)}.json`;
}

export function downloadBundle(bundle: Bundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = bundleFilename();
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Reading one back
// ---------------------------------------------------------------------------

export interface ParseResult {
  bundle: Bundle | null;
  error: string | null;
}

/**
 * Parse and check the shape before anything touches the database.
 *
 * Deliberately strict about the envelope and permissive about the rows. The envelope is
 * how we know this is our file rather than someone's tax return; the rows are checked at
 * the point they're inserted, where the database's own constraints are the real authority.
 */
export function parseBundle(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { bundle: null, error: "That isn't a JSON file — it couldn't be parsed at all." };
  }
  if (typeof raw !== "object" || raw === null) {
    return { bundle: null, error: "That file doesn't contain an object." };
  }
  const o = raw as Partial<Bundle>;
  if (o.kind !== BUNDLE_KIND) {
    return {
      bundle: null,
      error: "That doesn't look like a Maritime Angler export — it's missing the file marker.",
    };
  }
  if (typeof o.version !== "number" || o.version > BUNDLE_VERSION) {
    return {
      bundle: null,
      error: `That file is version ${String(o.version)}, and this app understands up to ${BUNDLE_VERSION}. Update the app first.`,
    };
  }
  if (typeof o.rows !== "object" || o.rows === null) {
    return { bundle: null, error: "The file has no rows in it." };
  }
  const rows = {} as Bundle["rows"];
  for (const table of PORTABLE_TABLES) {
    const v = (o.rows as Record<string, unknown>)[table];
    if (v === undefined) {
      rows[table] = [];
      continue;
    }
    if (!Array.isArray(v)) return { bundle: null, error: `"${table}" in that file isn't a list.` };
    if (!v.every((r) => typeof r === "object" && r !== null && !Array.isArray(r))) {
      return { bundle: null, error: `"${table}" contains something that isn't a row.` };
    }
    rows[table] = v.map((r) => clean(r as Record<string, unknown>));
  }
  return {
    bundle: { kind: BUNDLE_KIND, version: o.version, exportedAt: String(o.exportedAt ?? ""), rows },
    error: null,
  };
}

/**
 * A stable content signature, used to spot a row that's already here.
 *
 * Chosen per table from the fields a person would use to say "that's the same one". It
 * cannot be perfect — two identical mackerel caught in the same place on the same day are
 * genuinely indistinguishable — and it errs toward calling those a duplicate. Skipping a
 * real second fish is a smaller harm than silently doubling a whole catch log on a
 * re-import, and the skip is reported rather than hidden.
 */
export function signature(table: PortableTable, row: Record<string, unknown>): string {
  const s = (k: string) => String(row[k] ?? "").trim().toLowerCase();
  switch (table) {
    case "catches":
      return ["c", s("species_slug"), s("catch_date"), s("location"), s("length_cm"), s("weight_kg"), s("notes")].join("|");
    case "tackle_items":
      return ["t", s("name"), s("category"), s("brand"), s("colour")].join("|");
    case "tackle_trays":
      return ["y", s("name")].join("|");
  }
}

export interface ImportPlan {
  table: PortableTable;
  toAdd: Record<string, unknown>[];
  duplicates: number;
}

/** Work out what would be added, without adding it. */
export function planImport(
  bundle: Bundle,
  existing: Record<PortableTable, Record<string, unknown>[]>
): ImportPlan[] {
  return PORTABLE_TABLES.map((table) => {
    const seen = new Set((existing[table] ?? []).map((r) => signature(table, r)));
    const toAdd: Record<string, unknown>[] = [];
    let duplicates = 0;
    for (const row of bundle.rows[table] ?? []) {
      const sig = signature(table, row);
      // Checked against rows already accepted in this same run too, so a file containing
      // its own duplicates doesn't insert them twice.
      if (seen.has(sig)) {
        duplicates++;
        continue;
      }
      seen.add(sig);
      toAdd.push(row);
    }
    return { table, toAdd, duplicates };
  });
}

export const TABLE_LABEL: Record<PortableTable, string> = {
  catches: "catches",
  tackle_items: "tackle items",
  tackle_trays: "trays",
};

export const IMPORT_NOTE =
  "Import only ever adds. It never updates or deletes anything you already have, and anything that looks like a row you already have is skipped — so running the same file twice is safe. Photos aren't included: they live in storage rather than in the record, and the export carries their links rather than the images.";
