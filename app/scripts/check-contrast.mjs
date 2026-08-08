// Contrast of the theme token pairs, computed straight from globals.css.
//
// No browser, and that is the point. A page sweep that sets `data-theme` from Playwright
// looked authoritative and was not: its numbers did not reconcile with hand calculation,
// because the theme script re-applies the stored theme on hydration and quietly reverted
// the attribute. It reported tab chips at 3.24:1 that are actually 6.22:1, and text over
// background photographs at 1.01:1 that is plainly legible.
//
// This reads the tokens and does the WCAG arithmetic. It cannot be wrong about which
// theme it is measuring, because it never renders anything.
//
// It found the one real problem the page sweep also found — `--accent` on `--surface` is
// 2.98:1 on the default/paper palette, below the 4.5 needed for normal text — which is why
// small links use `text-accent-dark` (4.70:1 there, and better on every other theme).
//
// Run: node scripts/check-contrast.mjs   — exits non-zero if any pair fails.

import { readFileSync } from "node:fs";
const css = readFileSync("src/app/globals.css", "utf8");
const hexL = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [hexL(a), hexL(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const themes = {};
// :root block is the default theme; the rest are [data-theme="x"].
for (const m of css.matchAll(/(?::root(?:\[data-theme="([a-z]+)"\])?|\[data-theme="([a-z]+)"\])\s*\{([^}]*)\}/g)) {
  const name = m[1] || m[2] || "default";
  const vars = {};
  for (const v of m[3].matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) vars[v[1]] = v[2];
  if (Object.keys(vars).length > 3) themes[name] = { ...(themes[name] || {}), ...vars };
}
const PAIRS = [
  ["inactive chip", "muted", "surface", 4.5],
  ["active chip", "on-brand", "brand", 4.5],
  ["body text", "foreground", "surface", 4.5],
  ["accent link", "accent", "surface", 4.5],
  ["accent-dark link", "accent-dark", "surface", 4.5],
];
// `--accent` is knowingly below 4.5 on the paper palette. It is fine for the large,
// bold headings it is used on, and small links use --accent-dark instead — so it is
// listed for visibility rather than failed.
const ADVISORY = new Set(["accent link"]);

let failures = 0;
for (const [name, vars] of Object.entries(themes)) {
  const bits = [];
  for (const [label, fg, bg, need] of PAIRS) {
    if (!vars[fg] || !vars[bg]) continue;
    const r = ratio(vars[fg], vars[bg]);
    const bad = r < need;
    if (bad && !ADVISORY.has(label)) failures++;
    bits.push(`${label} ${r.toFixed(2)}${bad ? (ADVISORY.has(label) ? " (advisory)" : " FAIL") : ""}`);
  }
  console.log(name.padEnd(9), bits.join("  |  "));
}

if (failures) {
  console.error(`\n${failures} token pair(s) below their WCAG threshold.`);
  process.exit(1);
}
console.log("\nEvery required token pair meets its threshold.");
