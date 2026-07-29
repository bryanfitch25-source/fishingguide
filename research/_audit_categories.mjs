// Re-checks every saved image credit against its live Commons category metadata,
// catching illustrations/drawings/renderings that a title-only check would miss
// (e.g. a USFWS staff illustration filed under an innocuous filename like "Salmo salar.jpg").
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credits = JSON.parse(readFileSync(path.join(__dirname, "_image-credits.json"), "utf8"));

const USER_AGENT = "MaritimeAnglerGuide/1.0 (personal fishing reference app; audit script)";
const BAD = /\billustration|drawing|clip ?art|line art|painting|engraving|lithograph|sketch|woodcut|etching|graphic novel|vector graphic/i;

function titleToFile(title) {
  return title.startsWith("File:") ? title : `File:${title}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function categoriesFor(title) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titleToFile(title));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "extmetadata");
  url.searchParams.set("format", "json");

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      const pages = Object.values(json?.query?.pages ?? {});
      const meta = pages[0]?.imageinfo?.[0]?.extmetadata ?? {};
      return (meta.Categories?.value ?? "").replace(/<[^>]+>/g, "");
    } catch {
      // Rate-limited (plain-text error response, not JSON) — back off and retry.
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error("rate-limited after retries");
}

async function main() {
  const entries = Object.entries(credits);
  console.log(`Checking categories for ${entries.length} saved images...\n`);
  let flagged = 0;
  let checked = 0;
  for (const [key, info] of entries) {
    try {
      const cats = await categoriesFor(info.title);
      checked++;
      if (BAD.test(cats)) {
        console.log(`SUSPECT  ${key.padEnd(35)} title="${info.title}"`);
        console.log(`         categories: ${cats}\n`);
        flagged++;
      }
    } catch (err) {
      console.log(`ERROR checking ${key}: ${err.message}`);
    }
    await sleep(800);
  }
  console.log(`\n${checked}/${entries.length} checked, ${flagged} flagged.`);
}

main();
