// Checks that every video linked from the lessons still exists.
//
// Run with `node scripts/verify-videos.mjs` from `app/`. With `--ids a,b,c` it checks an
// arbitrary list instead, which is how candidates get vetted before they're written into
// a lesson in the first place.
//
// Uses YouTube's oEmbed endpoint rather than fetching the watch page. It answers the exact
// question that matters — does this ID resolve to a public, embeddable video — and returns
// the real title and channel, so a link can be checked against what the lesson claims it
// shows rather than merely against a 200. A deleted, private or region-blocked video comes
// back 401/403/404 instead of a page that superficially looks fine.
//
// A link that passes today can still rot tomorrow. That is exactly why this is a script in
// the repo and not a one-time check: re-run it, and anything that has died shows up by name
// instead of quietly sending someone to a "Video unavailable" page from a wharf.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");

async function check(id) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return { id, ok: false, status: res.status };
    const json = await res.json();
    return { id, ok: true, title: json.title, author: json.author_name };
  } catch (err) {
    return { id, ok: false, status: err instanceof Error ? err.message : String(err) };
  }
}

const argIds = process.argv.find((a) => a.startsWith("--ids="));
let targets;

if (argIds) {
  targets = argIds
    .slice("--ids=".length)
    .split(",")
    .map((id) => ({ id: id.trim(), where: "(candidate)" }));
} else {
  // Pull every videoId out of the lesson libraries, along with the lesson that claims it,
  // so a failure names the lesson to fix rather than a bare eleven-character string.
  targets = [];
  for (const file of ["src/lib/tying.ts", "src/lib/lure-making.ts"]) {
    let src;
    try {
      src = readFileSync(join(appDir, file), "utf8");
    } catch {
      continue;
    }
    // Lessons are object literals with a title and, optionally, a video.
    const blocks = src.split(/\n {2}\{/);
    for (const b of blocks) {
      const vid = b.match(/videoId: "([A-Za-z0-9_-]{11})"/);
      if (!vid) continue;
      const title = b.match(/title: "((?:[^"\\]|\\.)*)"/);
      targets.push({ id: vid[1], where: `${file}: ${title ? title[1] : "?"}` });
    }
  }
}

if (targets.length === 0) {
  console.log("No video IDs found to check.");
  process.exit(0);
}

const results = [];
for (const t of targets) {
  const r = await check(t.id);
  results.push({ ...r, where: t.where });
  const label = r.ok ? "OK  " : "DEAD";
  const detail = r.ok ? `${r.author} — ${r.title}` : `http/err ${r.status}`;
  console.log(`${label} ${r.id}  ${detail}`);
  if (!r.ok) console.log(`      claimed by ${t.where}`);
}

const dead = results.filter((r) => !r.ok);
console.log(`\n${results.length - dead.length}/${results.length} videos resolve.`);
if (dead.length) {
  console.error(`${dead.length} dead link(s) — replace or drop them.`);
  process.exit(1);
}
