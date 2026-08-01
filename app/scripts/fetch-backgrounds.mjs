// Fetches freely-licensed, bright DAYTIME outdoor/fishing/sunset photos from Wikimedia
// Commons for use as page background scenery. Explicitly excludes night/dusk/astro shots —
// the brief is "never night, always light and bright." Writes:
//   app/public/backgrounds/<key>.jpg
//   app/public/backgrounds/_credits.json
//
// Usage: node scripts/fetch-backgrounds.mjs [--force]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.resolve(__dirname, "..", "public", "backgrounds");
const creditsPath = path.join(imageDir, "_credits.json");

const USER_AGENT =
  "MaritimeAnglerGuide/1.0 (personal fishing reference app; contact via github.com/bryanfitch25-source/fishingguide)";

const ALLOWED_LICENSES = ["public domain", "pd-", "cc0", "cc-zero", "cc by", "cc-by", "attribution"];
const BLOCKED_LICENSES = ["non-commercial", "nc-", "-nc", "nd-", "-nd", "fair use", "gfdl-1.2"];

// Anything suggesting the scene is NOT bright daytime gets excluded outright.
const NIGHT_TERMS =
  /\b(night|nighttime|nocturnal|dusk|twilight|moon|moonlit|moonlight|stars|starry|astrophotography|dark sky|milky way|silhouette against|lantern|campfire|bonfire|fire at)\b/i;

const MAX_WIDTH = 2400;
const JPEG_QUALITY = 80;

function stripHtml(s) {
  if (!s) return null;
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function api(params) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function isFreeLicense(licenseShortName, licenseName) {
  const hay = `${licenseShortName ?? ""} ${licenseName ?? ""}`.toLowerCase();
  if (!hay.trim()) return false;
  if (BLOCKED_LICENSES.some((b) => hay.includes(b))) return false;
  return ALLOWED_LICENSES.some((a) => hay.includes(a));
}

async function searchImages(query, limit = 15) {
  const json = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: String(MAX_WIDTH),
    format: "json",
  });

  const pages = json?.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: p.title,
        index: p.index ?? 999,
        mime: info.mime,
        width: info.width,
        height: info.height,
        downloadUrl: info.thumburl || info.url,
        descriptionUrl: info.descriptionurl,
        licenseShortName: stripHtml(meta.LicenseShortName?.value),
        licenseName: stripHtml(meta.UsageTerms?.value),
        artist: stripHtml(meta.Artist?.value),
        credit: stripHtml(meta.Credit?.value),
        categories: (stripHtml(meta.Categories?.value) ?? "").toLowerCase(),
      };
    })
    .filter(Boolean)
    .filter((c) => c.mime === "image/jpeg" || c.mime === "image/png")
    .filter((c) => c.width >= 1200 && c.width > c.height) // landscape only, wide enough for a hero background
    .filter((c) => !NIGHT_TERMS.test(c.title) && !NIGHT_TERMS.test(c.categories))
    .filter((c) => !/\b(illustration|drawing|clip ?art|line art|graphic|map|logo|diagram)\b/i.test(c.categories))
    .filter((c) => !/\bsilhouette[ds]?\b/i.test(c.title))
    .filter((c) => !/\b(skyline|skyscraper|city|cityscape|downtown|manhattan|urban)\b/i.test(c.title))
    // Avoid photos where people (especially children) are the subject — this is
    // decorative scenery, not a photo of anyone in particular.
    .filter((c) => !/\b(boy|boys|girl|girls|kid|kids|child|children|swimming|swim|portrait|selfie)\b/i.test(c.title))
    // Flickr-imported photos often carry a visible platform watermark baked into the pixels.
    .filter((c) => !/500px|shutterstock|istock|gettyimages|watermark/i.test(`${c.title} ${c.artist ?? ""} ${c.credit ?? ""}`))
    .sort((a, b) => a.index - b.index);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadAndOptimize(candidate, destPath) {
  let res;
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch(candidate.downloadUrl, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) break;
    if (res.status !== 429 && res.status < 500) throw new Error(`download ${res.status}`);
    await sleep(2000 * (attempt + 1));
  }
  if (!res.ok) throw new Error(`download ${res.status} after retries`);
  const buf = Buffer.from(await res.arrayBuffer());

  await sharp(buf)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    // Brighten and lightly desaturate slightly toward pastel so the fixed overlay
    // (see globals.css) can sit on top and keep body text readable everywhere.
    .modulate({ brightness: 1.05 })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(destPath);
}

function buildCredit(candidate) {
  return {
    credit: candidate.artist || candidate.credit || "Unknown author",
    license: candidate.licenseShortName || candidate.licenseName || "See source page",
    source_url: candidate.descriptionUrl,
    title: candidate.title.replace(/^File:/, ""),
  };
}

// One target per app section — each gets its own bright, daytime scene.
const TARGETS = [
  { key: "home", query: "lake fishing boat blue sky sunny" },
  { key: "guide", query: "river fly fishing sunny day" },
  { key: "tackle", query: "lake dock summer" },
  { key: "catches", query: "vibrant orange sunset lake water" },
];

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyKeys = args.filter((a) => !a.startsWith("--"));
  if (!existsSync(imageDir)) mkdirSync(imageDir, { recursive: true });

  const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : {};

  for (const target of TARGETS) {
    if (onlyKeys.length && !onlyKeys.includes(target.key)) continue;
    const destPath = path.join(imageDir, `${target.key}.jpg`);
    if (!force && existsSync(destPath)) {
      console.log(`${target.key}: already have it, skipping`);
      continue;
    }
    process.stdout.write(`${target.key} ("${target.query}") … `);
    try {
      const candidates = await searchImages(target.query);
      const free = candidates.filter((c) => isFreeLicense(c.licenseShortName, c.licenseName));
      if (!free.length) {
        console.log(`SKIP (no freely-licensed bright/daytime landscape among ${candidates.length} results)`);
        continue;
      }
      let done = false;
      for (const chosen of free.slice(0, 4)) {
        try {
          await downloadAndOptimize(chosen, destPath);
          credits[target.key] = { ...buildCredit(chosen), query: target.query };
          writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
          console.log(`ok  [${chosen.licenseShortName}]  ${chosen.title.replace(/^File:/, "")}`);
          done = true;
          break;
        } catch {
          await sleep(1500);
        }
      }
      if (!done) console.log("FAIL (all candidates errored)");
    } catch (err) {
      console.log(`FAIL ${err.message}`);
    }
    await sleep(1200);
  }

  writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  console.log(`\nWrote credits for ${Object.keys(credits).length} backgrounds to _credits.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
