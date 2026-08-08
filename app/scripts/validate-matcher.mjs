// Checks lib/matcher.ts against the things it claims to agree with.
//
// There is no test runner in this project, so this is a plain script: `node
// scripts/validate-matcher.mjs` from `app/`. It reads the TypeScript sources as text and
// parses the literals out of them rather than importing, because matcher.ts imports a
// path-aliased type and fly-patterns.ts is 100 KB of object literals — both fine to read,
// neither worth a build step to check.
//
// What it enforces:
//   1. every speciesSlug is one of the 27 species in research/
//   2. every `regions` entry is a province that species guide actually lists
//   3. every patternRef names a real pattern in lib/fly-patterns.ts
//   4. no empty `when` or `note`
//   5. every NOT_LURE_FISHERIES key is a real species, and has bait recommendations
//   6. every species is accounted for — recommended for, or explained

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const researchDir = join(appDir, "..", "research");

const failures = [];
const fail = (msg) => failures.push(msg);

// --- research -------------------------------------------------------------
const speciesProvinces = new Map();
for (const file of readdirSync(researchDir)) {
  if (!file.endsWith(".json") || file.startsWith("_") || file.startsWith("location-")) continue;
  const json = JSON.parse(readFileSync(join(researchDir, file), "utf8"));
  speciesProvinces.set(json.slug, json.provinces ?? []);
}

// --- fly patterns ---------------------------------------------------------
const patternSrc = readFileSync(join(appDir, "src/lib/fly-patterns.ts"), "utf8");
// Patterns are written both one-per-line and one-field-per-line, so match the field
// wherever it sits rather than anchoring to the end of a line.
const patternNames = new Set(
  [...patternSrc.matchAll(/[{\s]name: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1].replace(/\\"/g, '"'))
);

// --- matcher --------------------------------------------------------------
const matcherSrc = readFileSync(join(appDir, "src/lib/matcher.ts"), "utf8");

const recsBlock = matcherSrc.match(
  /export const RECOMMENDATIONS: Recommendation\[\] = \[([\s\S]*?)\n\];/
);
if (!recsBlock) {
  console.error("Could not find RECOMMENDATIONS in matcher.ts");
  process.exit(1);
}

// Split on top-level `{ ... },` entries. Every entry starts with `speciesSlug:`.
const entries = recsBlock[1].split(/\n  \{/).slice(1);
const recs = entries.map((raw) => {
  const str = (key) => {
    const m = raw.match(new RegExp(`${key}: "((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1] : null;
  };
  const arr = (key) => {
    const m = raw.match(new RegExp(`${key}: \\[([^\\]]*)\\]`));
    if (!m) return null;
    return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
  };
  return {
    raw,
    speciesSlug: str("speciesSlug"),
    method: str("method"),
    kind: str("kind"),
    name: str("name"),
    when: str("when"),
    note: str("note"),
    certainty: str("certainty"),
    patternRef: str("patternRef"),
    waters: arr("waters"),
    // `regions: ALL` is a shared constant rather than a literal.
    regions: /regions: ALL/.test(raw) ? ["NB", "NS", "PEI"] : arr("regions"),
    namedWaters: arr("namedWaters"),
  };
});

const METHODS = new Set(["spin", "fly", "bait"]);
const KINDS = new Set(["lure", "fly", "bait"]);
const WATERS = new Set(["salt", "estuary", "river", "lake"]);
const CERTAINTY = new Set(["established", "local"]);

for (const r of recs) {
  const id = `${r.speciesSlug ?? "?"} / ${r.name ?? "?"}`;
  if (!r.speciesSlug || !speciesProvinces.has(r.speciesSlug)) {
    fail(`unknown speciesSlug: ${id}`);
    continue;
  }
  if (!METHODS.has(r.method)) fail(`bad method on ${id}: ${r.method}`);
  if (!KINDS.has(r.kind)) fail(`bad kind on ${id}: ${r.kind}`);
  if (!CERTAINTY.has(r.certainty)) fail(`bad certainty on ${id}: ${r.certainty}`);
  if (!r.when || !r.when.trim()) fail(`empty when on ${id}`);
  if (!r.note || r.note.trim().length < 20) fail(`missing or thin note on ${id}`);
  if (!r.waters || r.waters.length === 0) fail(`no waters on ${id}`);
  for (const w of r.waters ?? []) if (!WATERS.has(w)) fail(`bad water on ${id}: ${w}`);

  const allowed = speciesProvinces.get(r.speciesSlug);
  if (!r.regions || r.regions.length === 0) fail(`no regions on ${id}`);
  for (const p of r.regions ?? []) {
    if (!allowed.includes(p)) {
      fail(`${id}: region ${p} is not in the species guide's provinces (${allowed.join("/")})`);
    }
  }

  if (r.patternRef && !patternNames.has(r.patternRef)) {
    fail(`${id}: patternRef "${r.patternRef}" is not a pattern in fly-patterns.ts`);
  }
  // A fly recommendation whose name matches a real pattern should say so, so the UI can
  // link it. Catches a pattern added to the library later than the recommendation.
  if (r.kind === "fly" && !r.patternRef && patternNames.has(r.name)) {
    fail(`${id}: name matches a real pattern but has no patternRef`);
  }
}

// --- NOT_LURE_FISHERIES ---------------------------------------------------
const notLureBlock = matcherSrc.match(
  /export const NOT_LURE_FISHERIES: Record<string, string> = \{([\s\S]*?)\n\};/
);
const notLureKeys = notLureBlock
  ? [...notLureBlock[1].matchAll(/^\s*"?([a-z-]+)"?:/gm)].map((m) => m[1])
  : [];
for (const slug of notLureKeys) {
  if (!speciesProvinces.has(slug)) fail(`NOT_LURE_FISHERIES key is not a species: ${slug}`);
  if (!recs.some((r) => r.speciesSlug === slug)) {
    fail(`${slug} is flagged as not-a-lure-fishery but has no bait recommendation either`);
  }
}

// --- GEAR_ALIASES ---------------------------------------------------------
const aliasBlock = matcherSrc.match(
  /export const GEAR_ALIASES: Record<string, string\[\]> = \{([\s\S]*?)\n\};/
);
if (!aliasBlock) fail("could not find GEAR_ALIASES in matcher.ts");
const aliasKeys = new Set(
  aliasBlock
    ? [...aliasBlock[1].matchAll(/^\s*(?:"((?:[^"\\]|\\.)*)"|([A-Za-z][A-Za-z0-9]*)): \[/gm)].map(
        (m) => m[1] ?? m[2]
      )
    : []
);
const recNames = new Set(recs.map((r) => r.name));
for (const key of aliasKeys) {
  if (!recNames.has(key)) fail(`GEAR_ALIASES key matches no recommendation: "${key}"`);
}
for (const r of recs) {
  if (r.patternRef) continue;
  if (!aliasKeys.has(r.name)) {
    fail(`no GEAR_ALIASES entry for "${r.name}" (${r.speciesSlug}) — it can never match owned gear`);
  }
}

// --- WATER_PROVINCE -------------------------------------------------------
const waterBlock = matcherSrc.match(
  /export const WATER_PROVINCE: Record<string, Province\[\]> = \{([\s\S]*?)\n\};/
);
if (!waterBlock) fail("could not find WATER_PROVINCE in matcher.ts");
const placed = new Map();
if (waterBlock) {
  for (const m of waterBlock[1].matchAll(/^\s*"((?:[^"\\]|\\.)*)": \[([^\]]*)\],$/gm)) {
    placed.set(
      m[1],
      [...m[2].matchAll(/"([A-Z]+)"/g)].map((p) => p[1])
    );
  }
}
const usedWaters = new Set(recs.flatMap((r) => r.namedWaters ?? []));
for (const w of usedWaters) {
  if (!placed.has(w)) fail(`named water with no province in WATER_PROVINCE: "${w}"`);
}
for (const w of placed.keys()) {
  if (!usedWaters.has(w)) fail(`WATER_PROVINCE entry no recommendation uses: "${w}"`);
}
for (const [w, provs] of placed) {
  if (provs.length === 0) fail(`WATER_PROVINCE has no province for "${w}"`);
  for (const p of provs) {
    if (!["NB", "NS", "PEI"].includes(p)) fail(`WATER_PROVINCE has a bad province for "${w}": ${p}`);
  }
}
// A named water on a recommendation whose species doesn't occur in that province is a
// contradiction between the two datasets — catch it here rather than on screen.
for (const r of recs) {
  if (!r.namedWaters) continue;
  const allowed = speciesProvinces.get(r.speciesSlug) ?? [];
  for (const w of r.namedWaters) {
    const provs = placed.get(w);
    if (!provs) continue;
    if (!provs.some((p) => allowed.includes(p))) {
      fail(
        `${r.speciesSlug} / ${r.name}: named water "${w}" is in ${provs.join("/")}, but that species is only listed for ${allowed.join("/")}`
      );
    }
  }
}

// --- claims about the species guides --------------------------------------
//
// Several notes say things like "named in the guide's own gear table" or "the guide is
// blunt about this". Those are checkable, and a note that cites the guide while the guide
// says otherwise is exactly the kind of quiet fabrication this script exists to prevent.
// Each pair below is (species, a phrase that must appear in that species' research).
const GUIDE_CLAIMS = [
  ["atlantic-salmon", "Undertaker"],
  ["atlantic-salmon", "Butterfly"],
  ["atlantic-salmon", "Green Machine"],
  ["striped-bass", "paddletail"],
  ["striped-bass", "bottom rig"],
  ["brook-trout", "worm"],
  ["chain-pickerel", "red/white"],
  ["chain-pickerel", "yellow"],
  ["atlantic-mackerel", "carry both"],
  ["pollock", "8-9 weight"],
  ["pollock", "sandeel"],
  ["atlantic-cod", "fresh bait outfishes stale"],
  ["rainbow-smelt", "small streamer fly"],
  ["white-perch", "bobber rig"],
  ["rainbow-trout", "Pheasant Tail"],
  ["rainbow-trout", "Hare"],
];
const researchText = new Map();
for (const file of readdirSync(researchDir)) {
  if (!file.endsWith(".json") || file.startsWith("_") || file.startsWith("location-")) continue;
  const json = JSON.parse(readFileSync(join(researchDir, file), "utf8"));
  researchText.set(
    json.slug,
    (json.sections ?? []).map((s) => `${s.heading}\n${s.body_md ?? ""}`).join("\n").toLowerCase()
  );
}
for (const [slug, phrase] of GUIDE_CLAIMS) {
  const hay = researchText.get(slug);
  if (!hay) {
    fail(`guide-claim check names a species with no research file: ${slug}`);
    continue;
  }
  if (!hay.includes(phrase.toLowerCase())) {
    fail(`matcher cites the ${slug} guide for "${phrase}", but the guide doesn't say it`);
  }
}

// --- the fly pattern library ----------------------------------------------
//
// Guards the honesty framing rather than the content: no fly listed twice inside the same
// group (which would inflate a count), and no entry that is a bare colour restatement of
// another in the same group.
const patternGroupBlocks = [
  ...patternSrc.matchAll(/const ([A-Z_]+): FlyPattern\[\] = \[([\s\S]*?)\n\];/g),
];
for (const [, groupName, body] of patternGroupBlocks) {
  const names = [...body.matchAll(/[{\s]name: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const n of names) {
    if (seen.has(n)) fail(`${groupName} lists "${n}" twice`);
    seen.add(n);
  }
  // Names that look like a colour variant but are separately documented patterns in their
  // own right. Kept as an explicit list with a reason rather than by loosening the test.
  const REAL_VARIANTS = new Set([
    // Ray Bergman's Trout (1938) carries it as its own dressing, and it long outgrew the
    // Montreal it was named after — the Montreal itself goes back to Peter Cowen in the
    // 1830s. Not padding.
    "Dark Montreal",
  ]);
  for (const n of names) {
    if (REAL_VARIANTS.has(n)) continue;
    for (const other of names) {
      if (n === other) continue;
      // "Chartreuse and White Clouser" vs "Clouser Deep Minnow": one name wholly contains
      // a distinctive word of the other and adds only colour words.
      const colourOnly = n
        .toLowerCase()
        .replace(other.toLowerCase(), "")
        .replace(/\b(and|the|small|large|deep|minnow|\(|\))\b/g, "")
        .trim();
      if (n.toLowerCase().includes(other.toLowerCase()) && colourOnly.length > 0 && colourOnly.length < 24) {
        fail(`${groupName}: "${n}" reads as a colour variant of "${other}" already in the same group`);
      }
    }
  }
}

// --- coverage -------------------------------------------------------------
const covered = new Set(recs.map((r) => r.speciesSlug));
for (const slug of speciesProvinces.keys()) {
  if (!covered.has(slug)) fail(`species with no recommendation at all: ${slug}`);
}

// --- report ---------------------------------------------------------------
const bySpecies = new Map();
for (const r of recs) bySpecies.set(r.speciesSlug, (bySpecies.get(r.speciesSlug) ?? 0) + 1);

console.log(`${recs.length} recommendations across ${bySpecies.size} species`);
console.log(`  ${recs.filter((r) => r.method === "spin").length} spinning`);
console.log(`  ${recs.filter((r) => r.method === "fly").length} fly`);
console.log(`  ${recs.filter((r) => r.method === "bait").length} bait`);
console.log(`  ${recs.filter((r) => r.patternRef).length} linked to the pattern library`);
const waters = new Set(recs.flatMap((r) => r.namedWaters ?? []));
console.log(`  ${waters.size} distinct named waters`);
const thin = [...bySpecies.entries()].filter(([, n]) => n < 2).map(([s]) => s);
if (thin.length) console.log(`  only one entry: ${thin.join(", ")}`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
