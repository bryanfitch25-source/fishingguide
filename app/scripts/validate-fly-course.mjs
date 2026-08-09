// Structural checks on the fly fishing course and its reference modules.
//
// Run: node scripts/validate-fly-course.mjs   (from `app/`)
//
// The course is 55 lessons of hand-written prose across three files, which creates a
// specific set of ways for it to quietly rot:
//
//   1. a lesson numbered wrong, duplicated, or out of order — the numbers are the
//      reader's sense of progress, and LessonList renders them verbatim
//   2. a lesson whose stage isn't a real stage, so it renders under no tab at all
//   3. a stage with no lessons, which shows an empty tab
//   4. a stub field — a lesson written as a placeholder and never filled in
//   5. a video with no title or channel, so it renders as an uncredited bare link
//   6. a duplicated video across two lessons, which reads as padding
//   7. cross-references to app routes that don't exist
//
// It deliberately does NOT check prose quality or factual accuracy — no script can. What
// it can do is guarantee the shape is sound so that reading the content is the only
// review left to do by hand.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");

const failures = [];
const fail = (m) => failures.push(m);

const src = readFileSync(join(appDir, "src/lib/fly-course.ts"), "utf8");

// --- stages ----------------------------------------------------------------
const stageBlock = src.match(/export const FLY_STAGES: FlyStageInfo\[\] = \[([\s\S]*?)\n\];/);
if (!stageBlock) {
  console.error("Could not find FLY_STAGES.");
  process.exit(1);
}
const stages = [...stageBlock[1].matchAll(/id: "([a-z]+)"/g)].map((m) => m[1]);
const stageTitles = [...stageBlock[1].matchAll(/title: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
if (stages.length !== stageTitles.length) fail("a stage is missing an id or a title");

// The union type must list exactly the stages that exist, or a typo compiles fine and
// renders nothing.
const unionBlock = src.match(/export type FlyStage =([\s\S]*?);/);
const union = unionBlock ? [...unionBlock[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]) : [];
for (const s of stages) if (!union.includes(s)) fail(`stage "${s}" is not in the FlyStage union`);
for (const s of union) if (!stages.includes(s)) fail(`FlyStage union has "${s}" with no stage entry`);

// --- lessons ---------------------------------------------------------------
const lessonBlock = src.match(/export const FLY_LESSONS: FlyLesson\[\] = \[([\s\S]*?)\n\];/);
if (!lessonBlock) {
  console.error("Could not find FLY_LESSONS.");
  process.exit(1);
}

const entries = lessonBlock[1].split(/\n {2}\{/).slice(1);
const seenN = new Set();
const perStage = new Map(stages.map((s) => [s, 0]));
const videoIds = new Map();
let expected = 1;
let withVideo = 0;
let withDrill = 0;

for (const raw of entries) {
  const get = (k) => {
    const m = raw.match(new RegExp(`\\b${k}:\\s*\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1] : null;
  };

  const head = raw.match(/stage: "([a-z]+)", n: (\d+),/);
  if (!head) {
    fail("a lesson has no stage/number header");
    continue;
  }
  const [, stage, nStr] = head;
  const n = Number(nStr);
  const title = get("title") ?? `#${n}`;

  if (!stages.includes(stage)) fail(`${title}: stage "${stage}" is not a declared stage`);
  else perStage.set(stage, perStage.get(stage) + 1);

  if (seenN.has(n)) fail(`lesson number ${n} is used twice`);
  seenN.add(n);
  if (n !== expected) fail(`lesson numbering jumps: expected ${expected}, got ${n} (${title})`);
  expected = n + 1;

  // Titles are headings and are allowed to be short — "Wind" and "Mending" are good
  // titles, not stubs. Only the prose fields get a length floor.
  if (!get("title")) fail(`lesson ${n}: missing title`);
  for (const field of ["skill", "watchOut"]) {
    const v = get(field);
    if (!v) fail(`${title}: missing ${field}`);
    else if (v.trim().length < 25) fail(`${title}: ${field} is a stub (${v.length} chars)`);
  }

  const steps = raw.match(/steps: \[([\s\S]*?)\n {4}\]/);
  if (!steps) fail(`${title}: no steps`);
  else {
    const items = [...steps[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
    if (items.length < 3) fail(`${title}: only ${items.length} step(s)`);
    for (const s of items) {
      if (s.trim().length < 30) fail(`${title}: a step is a stub (${s.length} chars)`);
    }
  }

  const drill = get("drill");
  if (drill) {
    withDrill++;
    if (drill.trim().length < 40) fail(`${title}: drill is a stub (${drill.length} chars)`);
  }

  const vid = raw.match(/videoId: "([A-Za-z0-9_-]{11})"/);
  if (vid) {
    withVideo++;
    if (!get("videoTitle")) fail(`${title}: has a videoId but no videoTitle`);
    if (!get("videoChannel")) fail(`${title}: has a videoId but no videoChannel`);
    if (videoIds.has(vid[1])) fail(`${title}: reuses the video already on "${videoIds.get(vid[1])}"`);
    else videoIds.set(vid[1], title);
  }
}

for (const [stage, count] of perStage) {
  if (count === 0) fail(`stage "${stage}" has no lessons and would render an empty tab`);
}

// --- cross-references ------------------------------------------------------
const related = [...src.matchAll(/href: "(\/[a-z-]+)"/g)].map((m) => m[1]);
for (const href of new Set(related)) {
  const seg = href.slice(1);
  if (!existsSync(join(appDir, "src/app", seg, "page.tsx"))) {
    fail(`FLY_RELATED points at ${href}, which has no page.tsx`);
  }
}

// --- entomology ------------------------------------------------------------
const ent = readFileSync(join(appDir, "src/lib/entomology.ts"), "utf8");
const groups = [...ent.matchAll(/^ {4}slug: "([a-z-]+)",/gm)].map((m) => m[1]);
if (groups.length < 4) fail(`only ${groups.length} insect groups — the four orders are the minimum`);
if (new Set(groups).size !== groups.length) fail("duplicate insect group slug");
for (const need of ["mayfly", "caddis", "stonefly", "midge"]) {
  if (!groups.includes(need)) fail(`entomology is missing the ${need} group`);
}
// Scoped to the RISE_FORMS block — INSECT_GROUPS entries also have a `name:` at the same
// indent, and counting both silently doubled this.
const riseBlock = ent.match(/export const RISE_FORMS: RiseForm\[\] = \[([\s\S]*?)\n\];/);
if (!riseBlock) fail("could not find RISE_FORMS");
const riseCount = riseBlock ? (riseBlock[1].match(/^ {4}name: "/gm) ?? []).length : 0;
if (riseCount < 5) fail(`only ${riseCount} rise forms`);
if (!/HATCH_CAVEAT/.test(ent)) fail("HATCH_CAVEAT is missing — the calendar must ship with its caveat");

// The calendar must not harden into dates. This is the guard against the exact failure
// mode the module's header warns about.
const monthNames =
  /\b(January|February|March|April|June|July|August|September|October|November|December)\s+\d{1,2}\b/;
const windows = ent.match(/export const HATCH_WINDOWS[\s\S]*?\n\];/);
if (windows && monthNames.test(windows[0])) {
  fail("HATCH_WINDOWS contains a specific calendar date — it is meant to give sequence, not dates");
}

// --- faults and glossary ---------------------------------------------------
const faults = readFileSync(join(appDir, "src/lib/casting-faults.ts"), "utf8");
const faultRows = (faults.match(/^ {4}fault: "/gm) ?? []).length;
if (faultRows < 8) fail(`only ${faultRows} casting faults`);

const terms = [...faults.matchAll(/\{ term: "([^"]+)", group: "([^"]+)"/g)];
if (terms.length < 50) fail(`glossary has only ${terms.length} terms`);
const termNames = terms.map((t) => t[1]);
if (new Set(termNames).size !== termNames.length) {
  const dupes = termNames.filter((t, i) => termNames.indexOf(t) !== i);
  fail(`duplicate glossary term(s): ${[...new Set(dupes)].join(", ")}`);
}
const groupsDeclared = (faults.match(/export const GLOSSARY_GROUPS[\s\S]*?\n\];/) ?? [""])[0];
for (const [, , g] of terms.map((t) => [null, null, t[2]])) {
  if (!groupsDeclared.includes(`"${g}"`)) fail(`glossary group "${g}" is not in GLOSSARY_GROUPS`);
}

// Every fault routes to a real lesson title, or the table sends people nowhere.
const lessonTitles = new Set(
  [...lessonBlock[1].matchAll(/\n {4}title: "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1])
);
for (const m of faults.matchAll(/lesson: "((?:[^"\\]|\\.)*)"/g)) {
  if (!lessonTitles.has(m[1])) fail(`fault table points at a lesson that doesn't exist: "${m[1]}"`);
}

// --- report ----------------------------------------------------------------
console.log(`${seenN.size} lessons across ${stages.length} stages`);
for (const [stage, count] of perStage) console.log(`  ${String(count).padStart(2)} — ${stage}`);
console.log(
  `${withDrill} lessons with a drill, ${withVideo} with a video (${seenN.size - withVideo} without)`
);
console.log(`${groups.length} insect groups, ${riseCount} rise forms`);
console.log(`${faultRows} casting faults, ${terms.length} glossary terms`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
