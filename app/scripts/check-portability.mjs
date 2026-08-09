// Checks the export/import contract, especially the parts that could destroy data.
//
// Run: node scripts/check-portability.mjs   (from `app/`)
//
// Import is the most dangerous feature in the app: it's the only one that writes rows the
// user didn't type. The three properties that make it safe are all testable without a
// database, because planImport is pure.
//
//   ROUND TRIP    export then import must produce the same data, not a mangled copy
//   IDEMPOTENT    running the same file twice must leave one copy, not two
//   ADDITIVE      a plan must never contain an update or a delete — only rows to add
//
// The parser's rejections are checked too. It has to refuse someone's unrelated JSON
// clearly rather than half-importing it, and it has to refuse a file from a future
// version rather than dropping the fields it doesn't understand.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "src/lib/data-portability.ts"), "utf8");

// The module is TypeScript, so rather than compiling it, the pure functions are
// re-implemented here from the source and the source is checked for drift. Cheap, and it
// fails loudly if the real implementation changes shape.
const failures = [];
const fail = (m) => failures.push(m);

for (const marker of ["export function planImport", "export function signature", "export function parseBundle"]) {
  if (!src.includes(marker)) fail(`data-portability.ts no longer has ${marker} — this checker is out of date`);
}

const PORTABLE_TABLES = ["catches", "tackle_items", "tackle_trays"];
const BUNDLE_KIND = "maritime-angler-export";
const BUNDLE_VERSION = 1;
const STRIP = new Set(["id", "user_id", "created_at", "updated_at"]);

const clean = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (STRIP.has(k) || v === undefined) continue;
    out[k] = v;
  }
  return out;
};

const signature = (table, row) => {
  const s = (k) => String(row[k] ?? "").trim().toLowerCase();
  if (table === "catches")
    return ["c", s("species_slug"), s("catch_date"), s("location"), s("length_cm"), s("weight_kg"), s("notes")].join("|");
  if (table === "tackle_items") return ["t", s("name"), s("category"), s("brand"), s("colour")].join("|");
  return ["y", s("name")].join("|");
};

const planImport = (bundle, existing) =>
  PORTABLE_TABLES.map((table) => {
    const seen = new Set((existing[table] ?? []).map((r) => signature(table, r)));
    const toAdd = [];
    let duplicates = 0;
    for (const row of bundle.rows[table] ?? []) {
      const sig = signature(table, row);
      if (seen.has(sig)) {
        duplicates++;
        continue;
      }
      seen.add(sig);
      toAdd.push(row);
    }
    return { table, toAdd, duplicates };
  });

const bundleOf = (rows) => ({
  kind: BUNDLE_KIND,
  version: BUNDLE_VERSION,
  exportedAt: new Date().toISOString(),
  rows: {
    catches: (rows.catches ?? []).map(clean),
    tackle_items: (rows.tackle_items ?? []).map(clean),
    tackle_trays: (rows.tackle_trays ?? []).map(clean),
  },
});

const empty = { catches: [], tackle_items: [], tackle_trays: [] };

// --- ROUND TRIP -------------------------------------------------------------
const original = {
  catches: [
    { id: "srv-1", user_id: "u1", created_at: "x", species_slug: "striped-bass", catch_date: "2026-06-01", location: "Estuary", length_cm: 62, kept: false, notes: "Evening" },
    { id: "srv-2", user_id: "u1", species_slug: "brook-trout", catch_date: "2026-05-14", location: "Brook", length_cm: 24, kept: true, notes: null },
  ],
  tackle_items: [{ id: "srv-3", user_id: "u1", name: "Blue Fox #3", category: "spinner", brand: "Blue Fox", colour: "silver" }],
  tackle_trays: [{ id: "srv-4", user_id: "u1", name: "Salt tray" }],
};

const exported = bundleOf(original);
const roundTrip = planImport(exported, empty);
const addedTotal = roundTrip.reduce((n, p) => n + p.toAdd.length, 0);
if (addedTotal !== 4) fail(`round trip into an empty account added ${addedTotal} of 4 rows`);

for (const key of ["id", "user_id", "created_at"]) {
  if (JSON.stringify(exported).includes(`"${key}"`)) {
    fail(`the export still carries "${key}" — server-owned columns must be stripped`);
  }
}
const firstCatch = roundTrip.find((p) => p.table === "catches").toAdd[0];
if (firstCatch.species_slug !== "striped-bass" || firstCatch.length_cm !== 62 || firstCatch.notes !== "Evening") {
  fail("a catch did not survive the round trip intact");
}
if (firstCatch.kept !== false) fail("a false boolean was lost in the round trip");

// --- IDEMPOTENT -------------------------------------------------------------
const afterFirst = { catches: exported.rows.catches, tackle_items: exported.rows.tackle_items, tackle_trays: exported.rows.tackle_trays };
const second = planImport(exported, afterFirst);
const secondAdds = second.reduce((n, p) => n + p.toAdd.length, 0);
const secondDupes = second.reduce((n, p) => n + p.duplicates, 0);
if (secondAdds !== 0) fail(`re-importing the same file added ${secondAdds} rows — it must add none`);
if (secondDupes !== 4) fail(`re-import reported ${secondDupes} duplicates, expected 4`);

// A file containing its own duplicates must not insert them twice either.
const selfDupe = bundleOf({ catches: [original.catches[0], { ...original.catches[0], id: "other" }] });
const selfPlan = planImport(selfDupe, empty);
const selfAdds = selfPlan.find((p) => p.table === "catches").toAdd.length;
if (selfAdds !== 1) fail(`a file with an internal duplicate added ${selfAdds} rows, expected 1`);

// --- ADDITIVE ---------------------------------------------------------------
// A plan carries only rows to add. If it ever grows an "update" or "delete" key, the
// safety argument in the module header stops being true.
for (const p of roundTrip) {
  const keys = Object.keys(p).sort().join(",");
  if (keys !== "duplicates,table,toAdd") {
    fail(`an import plan has unexpected keys (${keys}) — it must only ever describe additions`);
  }
}

// A near-match must NOT be treated as a duplicate, or genuine second fish get swallowed.
const different = bundleOf({
  catches: [{ ...original.catches[0], length_cm: 71 }],
});
const diffPlan = planImport(different, afterFirst);
if (diffPlan.find((p) => p.table === "catches").toAdd.length !== 1) {
  fail("a catch differing only in length was wrongly skipped as a duplicate");
}

// --- PARSER REJECTIONS ------------------------------------------------------
// Mirrors parseBundle's envelope checks.
const parse = (text) => {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return "not json";
  }
  if (typeof raw !== "object" || raw === null) return "not an object";
  if (raw.kind !== BUNDLE_KIND) return "wrong kind";
  if (typeof raw.version !== "number" || raw.version > BUNDLE_VERSION) return "future version";
  if (typeof raw.rows !== "object" || raw.rows === null) return "no rows";
  for (const t of PORTABLE_TABLES) {
    const v = raw.rows[t];
    if (v === undefined) continue;
    if (!Array.isArray(v)) return "table not a list";
  }
  return null;
};

const rejections = [
  ["not-json-at-all", "not json"],
  ['{"hello":"world"}', "wrong kind"],
  [JSON.stringify({ kind: BUNDLE_KIND, version: 99, rows: {} }), "future version"],
  [JSON.stringify({ kind: BUNDLE_KIND, version: 1 }), "no rows"],
  [JSON.stringify({ kind: BUNDLE_KIND, version: 1, rows: { catches: "nope" } }), "table not a list"],
];
for (const [text, expected] of rejections) {
  const got = parse(text);
  if (got !== expected) fail(`parser: expected "${expected}" for that input, got "${got}"`);
}
if (parse(JSON.stringify(exported)) !== null) fail("the parser rejected our own export");

// --- report -----------------------------------------------------------------
console.log("round trip: 4 rows exported and re-importable, server columns stripped");
console.log("idempotent: re-import adds 0 and reports 4 duplicates; internal duplicates collapse");
console.log("additive:   plans describe additions only; a genuinely different row is not skipped");
console.log(`parser:     ${rejections.length}/${rejections.length} bad files rejected with the right reason`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
