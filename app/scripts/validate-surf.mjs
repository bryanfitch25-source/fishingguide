// Structural checks on the surf fishing module.
//
// Run: node scripts/validate-surf.mjs   (from `app/`)
//
// Two things here are worth a machine check rather than a careful read.
//
// SPECIES. SURF_TARGETS links to /species/<slug>, so a slug that doesn't exist in
// research/ renders a link to a 404. Saltwater has the same shape, so this checks both
// files rather than only the new one.
//
// NAMED BEACHES. The module's header commits to not naming specific beaches, because
// sandbars and cuts migrate between seasons and "fish the third cut at X" is wrong within
// a year. That commitment is only worth making if something enforces it, so this fails on
// a capitalised place name in the prose — the same shape of guard as the no-dates rule on
// the hatch calendar.

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

const src = readFileSync(join(appDir, "src/lib/surf.ts"), "utf8");

// --- sections vs the topic union -------------------------------------------
const union = (src.match(/export type SurfTopic =([\s\S]*?);/) ?? [""])[0];
const unionIds = [...union.matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
const sectionBlock = src.match(/export const SURF_SECTIONS: SurfSection\[\] = \[([\s\S]*?)\n\];/);
if (!sectionBlock) {
  console.error("Could not find SURF_SECTIONS.");
  process.exit(1);
}
const sectionIds = [...sectionBlock[1].matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);
for (const id of unionIds) {
  if (!sectionIds.includes(id)) fail(`SurfTopic has "${id}" with no section — it would render an empty tab`);
}
for (const id of sectionIds) {
  if (!unionIds.includes(id)) fail(`section "${id}" is not in the SurfTopic union`);
}
if (new Set(sectionIds).size !== sectionIds.length) fail("duplicate section id");

// --- targets ---------------------------------------------------------------
const targetBlock = src.match(/export const SURF_TARGETS: SurfTarget\[\] = \[([\s\S]*?)\n\];/);
if (!targetBlock) {
  console.error("Could not find SURF_TARGETS.");
  process.exit(1);
}
const targetSlugs = [...targetBlock[1].matchAll(/slug: "([a-z-]+)"/g)].map((m) => m[1]);
if (targetSlugs.length === 0) fail("no surf targets");
if (new Set(targetSlugs).size !== targetSlugs.length) fail("duplicate surf target");
for (const slug of targetSlugs) {
  if (!species.has(slug)) fail(`SURF_TARGETS links to /species/${slug}, which has no research entry`);
}

// Saltwater shares the shape, so check it here rather than leaving it unguarded.
const salt = readFileSync(join(appDir, "src/lib/saltwater.ts"), "utf8");
const saltBlock = salt.match(/export const SALT_TARGETS: SaltTarget\[\] = \[([\s\S]*?)\n\];/);
for (const m of (saltBlock?.[1] ?? "").matchAll(/slug: "([a-z-]+)"/g)) {
  if (!species.has(m[1])) fail(`SALT_TARGETS links to /species/${m[1]}, which has no research entry`);
}

// Every declared likelihood must be in the sort order, or it silently sorts to the front.
const orderBlock = src.match(/export const SURF_LIKELIHOOD_ORDER[\s\S]*?\n\];/);
for (const m of targetBlock[1].matchAll(/likelihood: "([^"]+)"/g)) {
  if (!orderBlock || !orderBlock[0].includes(`"${m[1]}"`)) {
    fail(`likelihood "${m[1]}" is not in SURF_LIKELIHOOD_ORDER`);
  }
}

// --- the no-named-beaches guard --------------------------------------------
//
// Looks for a capitalised word followed by a beach-ish noun. Province names, the region,
// and a handful of legitimate proper nouns are allowed through; anything else is either a
// named beach or a phrasing that reads like one, and both are worth a second look.
const ALLOWED = new Set([
  "Maritime", "Maritimes", "Atlantic", "New", "Brunswick", "Nova", "Scotia", "Prince",
  "Edward", "Island", "DFO", "Piping",
]);
const placeish = /\b([A-Z][a-z]{2,})\s+(Beach|Bar|Point|Head|Cove|Harbour|Harbor|Bay|Spit|Dunes)\b/g;
for (const m of src.matchAll(placeish)) {
  if (!ALLOWED.has(m[1])) {
    fail(`possible named beach in the prose: "${m[0]}" — the module commits to teaching how to read any beach, not where to stand on one`);
  }
}

// --- hazards ---------------------------------------------------------------
const hazardBlock = src.match(/export const SURF_HAZARDS: SurfHazard\[\] = \[([\s\S]*?)\n\];/);
const hazards = [...(hazardBlock?.[1] ?? "").matchAll(/hazard: "([^"]+)"/g)].map((m) => m[1]);
if (hazards.length < 5) fail(`only ${hazards.length} hazards listed`);
if (!/rip current/i.test(src)) fail("rip currents are not covered, and the reading section sends people to cuts");
// Every hazard needs an actionable response, not just a description of the danger.
const whats = [...(hazardBlock?.[1] ?? "").matchAll(/what: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
if (whats.length !== hazards.length) fail("a hazard has no `what to do`");
for (const w of whats) {
  if (w.trim().length < 40) fail(`a hazard's advice is too thin to act on (${w.length} chars)`);
}

// --- report ----------------------------------------------------------------
console.log(`${sectionIds.length} sections, ${targetSlugs.length} targets, ${hazards.length} hazards`);
const features = (src.match(/^ {4}name: "/gm) ?? []).length;
console.log(`${features} beach features and conditions described`);
console.log(`no named beaches found in the prose`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
