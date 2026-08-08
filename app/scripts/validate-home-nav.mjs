// Checks that the home screen still reaches everything.
//
// Run: node scripts/validate-home-nav.mjs   (from `app/`)
//
// Collapsing fourteen top-level cards into five groups has exactly one dangerous failure
// mode: a route quietly stops being reachable. Nothing breaks, nothing errors, the page
// looks tidier than before — and a section of the app has silently become unreachable
// except by typing the URL.
//
// So this asserts both directions:
//
//   1. every href in NAV_GROUPS resolves to a real page.tsx      (no dead links)
//   2. every public page.tsx appears in NAV_GROUPS               (nothing orphaned)
//
// Direction 2 is the one that matters here, and it's the one a human reviewer will not
// catch by reading the diff. Routes that legitimately aren't linked from home are listed
// in NOT_LINKED with a reason, so the exception is visible rather than assumed.
//
// It also checks the accent tokens, because those are written out per group in HomeNav
// and Tailwind cannot see a class built at runtime — a typo'd accent renders unstyled
// rather than failing.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const appRoot = join(appDir, "src/app");

const failures = [];
const fail = (m) => failures.push(m);

// Routes that exist but deliberately aren't on the home screen. Both directions are
// checked below, so an entry here that gets linked, or one whose route is deleted, fails
// rather than sitting stale.
const NOT_LINKED = {
  "/": "the home screen itself",
  "/login": "reached when a gated page redirects, not chosen from a menu",
};

const nav = readFileSync(join(appDir, "src/lib/home-nav.ts"), "utf8");
const groupsBlock = nav.match(/export const NAV_GROUPS: NavGroup\[\] = \[([\s\S]*?)\n\];/);
if (!groupsBlock) {
  console.error("Could not find NAV_GROUPS.");
  process.exit(1);
}

const hrefs = [...groupsBlock[1].matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
const titles = [...groupsBlock[1].matchAll(/\n {8}title: "([^"]+)"/g)].map((m) => m[1]);
const groupIds = [...groupsBlock[1].matchAll(/\n {4}id: "([a-z]+)"/g)].map((m) => m[1]);
const accents = [...groupsBlock[1].matchAll(/accent: "([a-z]+)"/g)].map((m) => m[1]);

if (groupIds.length < 4 || groupIds.length > 6) {
  fail(`${groupIds.length} groups — the home screen is meant to be 4-6 headings`);
}
if (new Set(groupIds).size !== groupIds.length) fail("duplicate group id");
if (new Set(hrefs).size !== hrefs.length) {
  const dupes = hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
  fail(`the same destination appears twice: ${[...new Set(dupes)].join(", ")}`);
}
if (titles.length !== hrefs.length) fail("an item is missing a title or an href");

// --- 1. every href resolves ------------------------------------------------
const pageFor = (route) => join(appRoot, route === "/" ? "" : route.slice(1), "page.tsx");
for (const href of hrefs) {
  if (!existsSync(pageFor(href))) fail(`nav points at ${href}, which has no page.tsx`);
}

// --- 2. nothing orphaned ---------------------------------------------------
// Walk src/app for page.tsx, skipping dynamic segments — those are reached from their
// index page, not from a menu.
const routes = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry.startsWith("[") || entry.startsWith("(") || entry.startsWith("_")) continue;
    if (existsSync(join(full, "page.tsx"))) {
      routes.push("/" + relative(appRoot, full).split("/").join("/"));
    }
    walk(full);
  }
})(appRoot);
if (existsSync(join(appRoot, "page.tsx"))) routes.push("/");

const linked = new Set(hrefs);
for (const route of routes) {
  if (linked.has(route)) continue;
  if (route in NOT_LINKED) continue;
  fail(`${route} exists but nothing on the home screen links to it`);
}

// Flag stale exemptions too, or NOT_LINKED rots into a list of routes that no longer exist.
for (const route of Object.keys(NOT_LINKED)) {
  if (!routes.includes(route)) fail(`NOT_LINKED lists ${route}, which no longer exists`);
  if (linked.has(route)) fail(`${route} is in NOT_LINKED but is linked from the home screen`);
}

// --- accents ---------------------------------------------------------------
const home = readFileSync(join(appDir, "src/components/HomeNav.tsx"), "utf8");
const accentMap = home.match(/const ACCENT: Record<NavGroup\["accent"\][\s\S]*?\n\};/);
for (const a of new Set(accents)) {
  if (!accentMap || !accentMap[0].includes(`${a}:`)) {
    fail(`accent "${a}" has no entry in the ACCENT map, so it would render unstyled`);
  }
}

// --- lens tags -------------------------------------------------------------
// A tag naming a mode that doesn't exist silently means "never matches", which reads as
// an item that is permanently dimmed for no visible reason.
const waterIds = [...nav.matchAll(/\{ id: "([a-z]+)", label: "[^"]*" \}/g)].map((m) => m[1]);
const validWater = new Set(["salt", "fresh", "surf"]);
const validMethod = new Set(["fly", "spin"]);
for (const m of groupsBlock[1].matchAll(/water: \[([^\]]*)\]/g)) {
  for (const t of m[1].matchAll(/"([a-z]+)"/g)) {
    if (!validWater.has(t[1])) fail(`unknown water tag "${t[1]}"`);
  }
}
for (const m of groupsBlock[1].matchAll(/method: \[([^\]]*)\]/g)) {
  for (const t of m[1].matchAll(/"([a-z]+)"/g)) {
    if (!validMethod.has(t[1])) fail(`unknown method tag "${t[1]}"`);
  }
}
void waterIds;

// --- report ----------------------------------------------------------------
console.log(`${groupIds.length} groups, ${hrefs.length} destinations`);
console.log(`${routes.length} routes with a page.tsx, ${Object.keys(NOT_LINKED).length} deliberately unlinked`);
const tagged = (groupsBlock[1].match(/water: \[|method: \[/g) ?? []).length;
console.log(`${tagged} items carry a lens tag, ${hrefs.length - tagged} are universal`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
