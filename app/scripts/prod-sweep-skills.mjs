// Post-deploy browser check of /skills and the per-species tactics block.
//
// Run against the deployed site:   node scripts/prod-sweep-skills.mjs
// Run against a local `next start`: BASE=http://127.0.0.1:3311 node scripts/prod-sweep-skills.mjs
//
// Both features are client components whose bodies render only when opened, so an HTTP
// fetch proves the route exists and nothing more. This drives the real page: every stage,
// every lesson in it, asserting each has steps, a pitfall, and either a video link or the
// explicit note saying none was found — the whole point of that note being that a missing
// video should read as "none found", not "forgot one".
//
// Note: this sandbox's egress proxy will not tunnel Chromium (the proxy logs no failure
// for the host; the browser just gets ERR_CONNECTION_RESET), so against the deployed
// origin this exits with a clear message. Point BASE at a local `next start` instead —
// the bundle under test is the same one that was built and deployed.

import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "https://fishingguide-ebon.vercel.app";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost)/.test(BASE);

const failures = [];
const fail = (m) => failures.push(m);

const proxy = LOCAL ? null : (process.env.HTTPS_PROXY ?? process.env.https_proxy);
const browser = await chromium.launch({
  executablePath: EXE,
  ...(proxy ? { proxy: { server: proxy } } : {}),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

try {
  await page.goto(`${BASE}/skills`, { waitUntil: "networkidle", timeout: 45000 });
} catch (e) {
  await browser.close();
  console.error(`Could not load ${BASE}/skills — ${e.message.split("\n")[0]}`);
  if (!LOCAL) console.error("Chromium can't reach the public internet here; retry with BASE=http://127.0.0.1:3311");
  process.exit(1);
}

const stageTabs = page.locator('[role="tablist"][aria-label="Course stages"] button[role="tab"]');
const stageCount = await stageTabs.count();
if (stageCount === 0) fail("no stage tabs on /skills");

let lessonsSeen = 0;
let drills = 0;
let videos = 0;
let noVideoNotes = 0;

for (let s = 0; s < stageCount; s++) {
  const stageName = (await stageTabs.nth(s).innerText()).trim();
  await stageTabs.nth(s).click();
  await page.waitForTimeout(200);

  // Each lesson is a bordered card whose header is the only aria-expanded button in it.
  const cards = page.locator("div.space-y-2 > div.rounded-xl");
  const n = await cards.count();
  if (n === 0) {
    fail(`${stageName}: no lessons rendered`);
    continue;
  }

  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const btn = card.locator("button[aria-expanded]").first();
    const title = (await btn.innerText()).split("\n").slice(0, 2).join(" — ").replace(/\s+/g, " ").trim();

    if ((await btn.getAttribute("aria-expanded")) !== "true") {
      await btn.click();
      await page.waitForTimeout(150);
    }

    const body = card.locator("div.border-t").first();
    if ((await body.count()) === 0) {
      fail(`${stageName} / ${title}: opened but rendered no body`);
      continue;
    }
    // CSS uppercase changes innerText, so compare case-insensitively.
    const text = (await body.innerText()).toLowerCase();

    const steps = await body.locator("ol > li").count();
    if (steps < 2) fail(`${stageName} / ${title}: only ${steps} step(s)`);

    if (!text.includes("where it goes wrong")) fail(`${stageName} / ${title}: no pitfall block`);
    if (text.includes("go and practise")) drills++;

    if ((await body.locator("a[href*='youtube.com/watch']").count()) > 0) videos++;
    else if (text.includes("no video on this one")) noVideoNotes++;
    else fail(`${stageName} / ${title}: neither a video nor the note explaining its absence`);

    lessonsSeen++;
  }
}

// The diagnosis table lives behind the second view tab.
const faultTab = page.locator('[role="tablist"][aria-label="Skills"] button[role="tab"]').nth(1);
if ((await faultTab.count()) === 0) fail("no view tabs on /skills");
else {
  await faultTab.click();
  await page.waitForTimeout(250);
  const rows = await page.locator("table tbody tr").count();
  if (rows < 5) fail(`diagnosis table has only ${rows} row(s)`);
  const t = (await page.locator("body").innerText()).toLowerCase();
  if (!t.includes("what you see")) fail("diagnosis table missing its header");
  if (!t.includes("water temperature, roughly")) fail("temperature bands missing");
}

// ---- /fly-fishing -----------------------------------------------------------
// Same shape as /skills — a LessonList behind stage tabs — plus three reference views.
await page.goto(`${BASE}/fly-fishing`, { waitUntil: "networkidle", timeout: 45000 });

const flyStageTabs = page.locator('[role="tablist"][aria-label="Course stages"] button[role="tab"]');
const flyStageCount = await flyStageTabs.count();
if (flyStageCount === 0) fail("no stage tabs on /fly-fishing");

let flyLessons = 0;
let flyDrills = 0;
let flyVideos = 0;
let flyNoVideo = 0;

for (let s = 0; s < flyStageCount; s++) {
  const stageName = (await flyStageTabs.nth(s).innerText()).trim();
  await flyStageTabs.nth(s).click();
  await page.waitForTimeout(200);

  const cards = page.locator("div.space-y-2 > div.rounded-xl");
  const n = await cards.count();
  if (n === 0) {
    fail(`fly-fishing / ${stageName}: no lessons rendered`);
    continue;
  }

  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const btn = card.locator("button[aria-expanded]").first();
    const title = (await btn.innerText()).split("\n").slice(0, 2).join(" — ").replace(/\s+/g, " ").trim();
    if ((await btn.getAttribute("aria-expanded")) !== "true") {
      await btn.click();
      await page.waitForTimeout(120);
    }
    const body = card.locator("div.border-t").first();
    if ((await body.count()) === 0) {
      fail(`fly-fishing / ${stageName} / ${title}: opened but rendered no body`);
      continue;
    }
    const text = (await body.innerText()).toLowerCase();
    if ((await body.locator("ol > li").count()) < 3) fail(`fly-fishing / ${title}: fewer than 3 steps`);
    if (!text.includes("where it goes wrong")) fail(`fly-fishing / ${title}: no pitfall block`);
    if (text.includes("go and practise")) flyDrills++;
    else fail(`fly-fishing / ${title}: no drill`);
    if ((await body.locator("a[href*='youtube.com/watch']").count()) > 0) flyVideos++;
    else if (text.includes("no video on this one")) flyNoVideo++;
    else fail(`fly-fishing / ${title}: neither a video nor the note explaining its absence`);
    flyLessons++;
  }
}

// The three reference views behind the top-level tabs.
const flyViews = page.locator('[role="tablist"][aria-label="Fly fishing"] button[role="tab"]');
if ((await flyViews.count()) !== 4) fail(`expected 4 view tabs on /fly-fishing, found ${await flyViews.count()}`);

await flyViews.nth(1).click(); // What they eat
await page.waitForTimeout(250);
// Scoped to the group cards, not `button[aria-expanded]` globally — the nav hamburger
// carries aria-expanded too, and clicking it opens a menu that covers the page.
const bugCards = page.locator("div.space-y-2 > div.rounded-xl");
const bugCount = await bugCards.count();
if (bugCount < 6) fail(`fewer than 6 insect groups on the bugs view (found ${bugCount})`);
for (let i = 0; i < bugCount; i++) {
  const b = bugCards.nth(i).locator("button[aria-expanded]").first();
  if ((await b.getAttribute("aria-expanded")) !== "true") await b.click();
  await page.waitForTimeout(100);
  const body = bugCards.nth(i).locator("div.border-t").first();
  if ((await body.count()) === 0) fail(`insect group ${i + 1}: opened but rendered no body`);
}
const bugsText = (await page.locator("body").innerText()).toLowerCase();
for (const need of ["reading the rise", "sampling the river", "the seasonal sequence", "how to spot it"]) {
  if (!bugsText.includes(need)) fail(`bugs view missing "${need}"`);
}
if (!bugsText.includes("sequence, not a calendar")) fail("bugs view is missing the hatch caveat");

await flyViews.nth(2).click(); // What's going wrong
await page.waitForTimeout(250);
const faultRows = await page.locator("table tbody tr").count();
if (faultRows < 8) fail(`fly fault table has only ${faultRows} row(s)`);

await flyViews.nth(3).click(); // Glossary
await page.waitForTimeout(250);
const search = page.locator("#glossary-search");
if ((await search.count()) === 0) fail("glossary has no search box");
else {
  const before = await page.locator("dl > div").count();
  await search.fill("tippet");
  await page.waitForTimeout(250);
  const after = await page.locator("dl > div").count();
  if (after === 0) fail("glossary search for 'tippet' matched nothing");
  if (after >= before) fail("glossary search did not narrow the list");
  await search.fill("zzzznotaterm");
  await page.waitForTimeout(250);
  if (!(await page.locator("body").innerText()).toLowerCase().includes("nothing matches")) {
    fail("glossary shows no empty state for a term that doesn't exist");
  }
  await search.fill("");
}

// ---- per-species tactics ----------------------------------------------------
const SPECIES = (process.env.SPECIES ?? "striped-bass,brook-trout,atlantic-mackerel").split(",");
for (const slug of SPECIES) {
  const res = await page.goto(`${BASE}/species/${slug}`, { waitUntil: "networkidle", timeout: 45000 });
  if (res && res.status() !== 200) {
    fail(`${slug}: HTTP ${res.status()}`);
    continue;
  }
  const section = page.locator("section").filter({ hasText: "How to Actually Catch One" }).first();
  if ((await section.count()) === 0) {
    fail(`${slug}: no tactics section`);
    continue;
  }
  const collapsed = (await section.innerText()).toLowerCase();
  for (const need of ["when they switch on", "the window"]) {
    if (!collapsed.includes(need)) fail(`${slug}: collapsed view missing "${need}"`);
  }
  if (collapsed.includes("how to work it")) fail(`${slug}: starts expanded, should be collapsed`);

  await section.locator("button[aria-expanded]").first().click();
  await page.waitForTimeout(200);
  const open = (await section.innerText()).toLowerCase();
  for (const need of ["where in the water", "how to work it", "setting the hook", "what costs most people fish"]) {
    if (!open.includes(need)) fail(`${slug}: expanded view missing "${need}"`);
  }
}

await browser.close();

console.log(`${BASE}`);
console.log(`/skills: ${lessonsSeen} lessons opened across ${stageCount} stages`);
console.log(`  ${drills} with a drill, ${videos} with a video, ${noVideoNotes} saying none was found`);
console.log(`/fly-fishing: ${flyLessons} lessons opened across ${flyStageCount} stages`);
console.log(`  ${flyDrills} with a drill, ${flyVideos} with a video, ${flyNoVideo} saying none was found`);
console.log(`${SPECIES.length} species pages checked for the tactics block`);
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
