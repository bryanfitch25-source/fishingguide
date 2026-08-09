// Verifies every role="tablist" row in the app renders as a single horizontally-scrollable
// line at phone width, instead of wrapping into a wall of pills.
//
// Run: BASE=http://127.0.0.1:3330 node scripts/check-tablist-scroll.mjs   (from `app/`)
//
// This is the check the earlier "consolidate the filter bubbles" pass didn't have: that
// pass measured whether the *page* overflowed horizontally, which a wrapped tablist never
// does — wrapping keeps everything inside the viewport, it just does it by stacking rows.
// A screenshot from an actual phone caught what check-filter-disclosures.mjs couldn't: the
// /fly-fishing view tabs (4 items) and the course stage tabs (12 items, shared by every
// course via LessonList) wrapped into two and six rows respectively before any lesson
// content was visible. The fix (the .scroll-tabs utility in globals.css) turns each
// tablist into one row that scrolls sideways; this script proves that by asserting every
// role="tab" inside a given role="tablist" shares the same vertical position.

import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://127.0.0.1:3330";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const failures = [];
const fail = (m) => failures.push(m);

async function checkTablistsSingleRow(page, path) {
  const tablists = page.locator('[role="tablist"]');
  const count = await tablists.count();
  if (count === 0) return 0;

  for (let i = 0; i < count; i++) {
    const tablist = tablists.nth(i);
    const label = (await tablist.getAttribute("aria-label")) ?? `tablist #${i}`;
    const tabs = tablist.locator('[role="tab"]');
    const tabCount = await tabs.count();
    if (tabCount === 0) continue;

    const tops = [];
    for (let j = 0; j < tabCount; j++) {
      const box = await tabs.nth(j).boundingBox();
      if (box) tops.push(Math.round(box.y));
    }
    const rows = new Set(tops.map((t) => Math.round(t / 4) * 4)).size;
    if (rows > 1) {
      fail(`${path} "${label}": ${tabCount} tabs span ${rows} rows at 375px (expected 1)`);
    }
  }
  return count;
}

const mobile = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
let totalTablists = 0;

const pages = [
  { path: "/fly-fishing", clickTabs: ["The course", "What they eat", "What's going wrong", "Glossary"] },
  { path: "/skills" },
  { path: "/tying" },
  { path: "/lures" },
  { path: "/safety" },
  { path: "/surf" },
  { path: "/saltwater" },
  { path: "/matcher" },
];

for (const { path, clickTabs } of pages) {
  for (const theme of ["light", "dark"]) {
    const p = await mobile.newPage({ viewport: { width: 375, height: 812 } });
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);

    totalTablists += await checkTablistsSingleRow(p, `${path} (${theme})`);

    // /fly-fishing swaps its whole body per view — check each view's stage tablist too,
    // since "The course" is only the default.
    if (clickTabs) {
      for (const name of clickTabs) {
        const tab = p.getByRole("tab", { name });
        if ((await tab.count()) > 0) {
          await tab.click();
          await p.waitForTimeout(150);
          await checkTablistsSingleRow(p, `${path} > ${name} (${theme})`);
        }
      }
    }

    const overflow = await p.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    if (overflow.scroll > overflow.client + 1) {
      fail(`${path} (${theme}): page overflows horizontally, ${overflow.scroll} > ${overflow.client}`);
    }

    await p.close();
  }
}

await mobile.close();

console.log(`Checked ${pages.length} pages across 2 themes at 375px, ${totalTablists} tablist row(s) total.`);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
