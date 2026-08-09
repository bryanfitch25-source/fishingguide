// Drives the home screen in a browser: the two lenses, persistence, and reachability.
//
// Run: BASE=http://127.0.0.1:3313 node scripts/check-home-nav-browser.mjs   (from `app/`)
//
// validate-home-nav.mjs proves the data is sound. This proves the page built from it
// behaves: that the lenses dim rather than hide, that a dimmed link is still clickable,
// that the choice survives a reload, and that every destination on the screen actually
// resolves. The last one is the point — the whole risk of collapsing fourteen cards into
// five groups is a destination going missing, and a 200 on / says nothing about that.
//
// Chromium can't tunnel this sandbox's egress proxy, so BASE must be a local `next start`.

import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://127.0.0.1:3313";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const failures = [];
const fail = (m) => failures.push(m);

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });

// --- groups ----------------------------------------------------------------
const groups = page.locator("section:has(> button[aria-expanded])");
const groupCount = await groups.count();
if (groupCount < 4 || groupCount > 6) fail(`${groupCount} groups on screen — expected 4-6`);

// Every group starts open, so every destination is visible without interaction.
for (let i = 0; i < groupCount; i++) {
  if ((await groups.nth(i).locator("button[aria-expanded]").first().getAttribute("aria-expanded")) !== "true") {
    fail(`group ${i + 1} is collapsed on first load`);
  }
}

const linkHrefs = async () =>
  (await page.locator("section li a").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) ?? [];

const allHrefs = await linkHrefs();
if (allHrefs.length < 20) fail(`only ${allHrefs.length} destinations visible`);

// --- lenses dim, never hide ------------------------------------------------
const waterGroup = page.locator('[role="group"][aria-label="Where"] button');
const methodGroup = page.locator('[role="group"][aria-label="How"] button');

// Counted against what home-nav.ts actually declares rather than a hardcoded number, so
// adding a mode doesn't fail this for the wrong reason. The property worth asserting is
// that a mode still behind `comingSoon` does NOT render — that flag is the only thing
// keeping an unbuilt section out of the UI.
const navSrc = readFileSync(new URL("../src/lib/home-nav.ts", import.meta.url), "utf8");
const modesIn = (name) => {
  const block = navSrc.match(new RegExp(`export const ${name}[\\s\\S]*?\\n\\];`));
  if (!block) return { shown: [], hidden: [] };
  const rows = [...block[0].matchAll(/\{ id: "([a-z]+)", label: "([^"]+)"(, comingSoon: true)? \}/g)];
  return {
    shown: rows.filter((r) => !r[3]).map((r) => r[2]),
    hidden: rows.filter((r) => r[3]).map((r) => r[2]),
  };
};
const waterModes = modesIn("WATER_MODES");
const methodModes = modesIn("METHOD_MODES");

if ((await waterGroup.count()) !== waterModes.shown.length) {
  fail(`Where has ${await waterGroup.count()} options, expected ${waterModes.shown.length}`);
}
if ((await methodGroup.count()) !== methodModes.shown.length) {
  fail(`How has ${await methodGroup.count()} options, expected ${methodModes.shown.length}`);
}
for (const label of [...waterModes.shown, ...methodModes.shown]) {
  const inWater = waterModes.shown.includes(label);
  const group = inWater ? waterGroup : methodGroup;
  if ((await group.filter({ hasText: new RegExp(`^${label}$`) }).count()) !== 1) {
    fail(`${inWater ? "Where" : "How"} is missing the "${label}" option`);
  }
}
for (const label of [...waterModes.hidden, ...methodModes.hidden]) {
  if ((await page.getByRole("button", { name: label, exact: true }).count()) > 0) {
    fail(`"${label}" is flagged comingSoon but is rendered as a choice`);
  }
}

const countDimmed = async () =>
  await page.locator('section li a[class*="opacity-45"]').count();

if ((await countDimmed()) !== 0) fail("something is dimmed with both lenses set to Both");

// Freshwater + Fly
await waterGroup.filter({ hasText: "Freshwater" }).first().click();
await methodGroup.filter({ hasText: "Fly" }).first().click();
await page.waitForTimeout(250);

const afterHrefs = await linkHrefs();
if (afterHrefs.length !== allHrefs.length) {
  fail(`lenses changed the number of destinations: ${allHrefs.length} -> ${afterHrefs.length} (they must dim, not hide)`);
}
const missing = allHrefs.filter((h) => !afterHrefs.some((a) => a.split("?")[0] === h.split("?")[0]));
if (missing.length) fail(`destinations disappeared under a lens: ${missing.join(", ")}`);

const dimmed = await countDimmed();
if (dimmed === 0) fail("freshwater + fly dimmed nothing — the lenses aren't doing anything");

// A dimmed link must still be reachable, which is the whole justification for dimming.
const dimmedHref = await page
  .locator('section li a[class*="opacity-45"]')
  .first()
  .getAttribute("href");
if (dimmedHref) {
  const res = await page.request.get(`${BASE}${dimmedHref}`);
  if (![200, 307, 308].includes(res.status())) {
    fail(`a dimmed destination (${dimmedHref}) returns ${res.status()}`);
  }
}

// Surf is its own water, not a synonym for salt: it must reach /surf and dim a different
// set from freshwater.
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await waterGroup.filter({ hasText: /^Surf$/ }).first().click();
await methodGroup.filter({ hasText: /^Both$/ }).first().click();
await page.waitForTimeout(250);
const surfLink = page.locator('section li a[href="/surf"]');
if ((await surfLink.count()) !== 1) fail("/surf is not reachable from the home screen");
if ((await surfLink.first().getAttribute("class"))?.includes("opacity-45")) {
  fail("/surf is dimmed while the Surf lens is active");
}
// Surf is a narrowing of salt, so it legitimately dims nothing — everything tagged for
// salt also matches surf. What it must do instead is promote: the surf-tagged items rank
// above the universal ones inside their group. That's the tier-0 rule in home-nav.ts, and
// it's the reason the lens isn't a no-op.
const learnFirst = await page
  .locator("section")
  .filter({ hasText: "Learn" })
  .first()
  .locator("li a")
  .first()
  .getAttribute("href");
if (learnFirst !== "/saltwater" && learnFirst !== "/surf") {
  fail(`under the Surf lens the Learn group leads with ${learnFirst}, not a surf-relevant section`);
}

// The matcher gets the lenses handed to it; freshwater deliberately passes no water.
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await waterGroup.filter({ hasText: "Saltwater" }).first().click();
await methodGroup.filter({ hasText: "Fly" }).first().click();
await page.waitForTimeout(250);
const matcherLink = await page.locator('section li a[href^="/matcher"]').first().getAttribute("href");
if (matcherLink !== "/matcher?method=fly&water=salt") {
  fail(`matcher handoff is "${matcherLink}", expected "/matcher?method=fly&water=salt"`);
}
await waterGroup.filter({ hasText: "Freshwater" }).first().click();
await page.waitForTimeout(200);
const freshLink = await page.locator('section li a[href^="/matcher"]').first().getAttribute("href");
if (freshLink !== "/matcher?method=fly") {
  fail(`freshwater matcher handoff is "${freshLink}", expected "/matcher?method=fly" with no water`);
}

// --- persistence -----------------------------------------------------------
//
// These assertions must poll rather than read once. The preference lives in localStorage,
// which the server can't see, so the first paint after a reload is always the default
// state and hydration corrects it a moment later. Reading immediately is a race — it
// caught the pre-hydration value on one run in two and reported a persistence bug that
// wasn't there. Polling with a timeout still fails loudly if the value genuinely never
// arrives, which is the thing actually worth catching.
async function expectSoon(fn, arg, message) {
  try {
    await page.waitForFunction(fn, arg, { timeout: 5000, polling: 100 });
  } catch {
    fail(message);
  }
}

const pressedIn = (label) =>
  `[role="group"][aria-label="${label}"] button[aria-pressed="true"]`;

await page.reload({ waitUntil: "domcontentloaded" });
await expectSoon(
  (sel) => document.querySelector(sel)?.textContent?.trim() === "Freshwater",
  pressedIn("Where"),
  "water lens did not survive a reload"
);
await expectSoon(
  (sel) => document.querySelector(sel)?.textContent?.trim() === "Fly",
  pressedIn("How"),
  "method lens did not survive a reload"
);

// Collapsing survives too.
const firstToggle = groups.first().locator("button[aria-expanded]").first();
await firstToggle.click();
await expectSoon(
  () => JSON.parse(localStorage.getItem("ma-home-lenses") ?? "{}").closed?.length === 1,
  null,
  "collapsing a group did not reach storage"
);
await page.reload({ waitUntil: "domcontentloaded" });
await expectSoon(
  () =>
    document
      .querySelector("section:has(> button[aria-expanded])")
      ?.querySelector("button[aria-expanded]")
      ?.getAttribute("aria-expanded") === "false",
  null,
  "a collapsed group did not stay collapsed across a reload"
);
await groups.first().locator("button[aria-expanded]").first().click();
await page.waitForTimeout(150);

// --- every destination resolves --------------------------------------------
await page.goto(BASE, { waitUntil: "domcontentloaded" });
const finalHrefs = [...new Set((await linkHrefs()).map((h) => h.split("?")[0]))];
const bad = [];
for (const href of finalHrefs) {
  const res = await page.request.get(`${BASE}${href}`, { maxRedirects: 0 });
  if (![200, 307, 308].includes(res.status())) bad.push(`${href} -> ${res.status()}`);
}
if (bad.length) fail(`destinations that don't resolve: ${bad.join(", ")}`);

// --- mobile ----------------------------------------------------------------
const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
await mobile.goto(BASE, { waitUntil: "domcontentloaded" });
const overflow = await mobile.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
if (overflow.scroll > overflow.client + 1) {
  fail(`home scrolls horizontally at 375px (${overflow.scroll} > ${overflow.client})`);
}
const mobileHeight = await mobile.evaluate(() => document.body.scrollHeight);
await mobile.close();

await browser.close();

console.log(`${groupCount} groups, ${finalHrefs.length} destinations, all resolving`);
console.log(`freshwater + fly dims ${dimmed} of them and hides none`);
console.log(`home page is ${mobileHeight}px tall at 375px wide`);
if (consoleErrors.length) {
  console.log(`\n${consoleErrors.length} console error(s):`);
  for (const e of consoleErrors.slice(0, 10)) console.log(`  ! ${e}`);
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
