// Checks lib/species-tactics.ts against research/.
//
// Run: node scripts/validate-tactics.mjs   (from `app/`)
//
// The tactical layer is deliberately separate from the sourced regional research, which
// creates exactly one risk worth guarding: the two drifting apart, or a tactics entry
// existing for a fish the app doesn't cover. So:
//
//   1. every slug is one of the species in research/
//   2. every species either has tactics or is listed in NO_TACTICS with a reason
//   3. no field is empty or a stub
//   4. no duplicate slugs

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const researchDir = join(appDir, "..", "research");

const failures = [];
const fail = (m) => failures.push(m);

const species = new Set();
for (const f of readdirSync(researchDir)) {
  if (!f.endsWith(".json") || f.startsWith("_") || f.startsWith("location-")) continue;
  species.add(JSON.parse(readFileSync(join(researchDir, f), "utf8")).slug);
}

const src = readFileSync(join(appDir, "src/lib/species-tactics.ts"), "utf8");
const block = src.match(/export const SPECIES_TACTICS: SpeciesTactics\[\] = \[([\s\S]*?)\n\];/);
if (!block) {
  console.error("Could not find SPECIES_TACTICS.");
  process.exit(1);
}

const REQUIRED = ["season", "column", "retrieve", "hookset", "window", "mistake"];
const entries = block[1].split(/\n {2}\{/).slice(1);
const seen = new Set();

for (const raw of entries) {
  const get = (k) => {
    const m = raw.match(new RegExp(`\\b${k}:\\s*\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1] : null;
  };
  const slug = get("slug");
  if (!slug) {
    fail("an entry has no slug");
    continue;
  }
  if (!species.has(slug)) fail(`tactics for a species that isn't in research/: ${slug}`);
  if (seen.has(slug)) fail(`duplicate tactics entry: ${slug}`);
  seen.add(slug);

  for (const field of REQUIRED) {
    const v = get(field);
    if (!v) fail(`${slug}: missing ${field}`);
    else if (v.trim().length < 40) fail(`${slug}: ${field} is too thin to be useful (${v.length} chars)`);
  }
}

const noTactics = new Set(
  [...(src.match(/export const NO_TACTICS[\s\S]*?\n\};/) ?? [""])[0].matchAll(/^\s*"?([a-z-]+)"?:/gm)].map(
    (m) => m[1]
  )
);

for (const slug of species) {
  if (!seen.has(slug) && !noTactics.has(slug)) {
    fail(`species with no tactics and no stated reason: ${slug}`);
  }
}
for (const slug of noTactics) {
  if (seen.has(slug)) fail(`${slug} is both in SPECIES_TACTICS and NO_TACTICS`);
}

console.log(`${seen.size} species with tactics, ${species.size} species in research/`);
const fields = REQUIRED.length;
console.log(`${fields} required fields each, plus optional stepUp on ${(block[1].match(/stepUp:/g) ?? []).length}`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
