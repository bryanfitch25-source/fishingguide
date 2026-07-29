// Fetches freely-licensed fish photos from Wikimedia Commons, optimizes them, and
// records attribution. Writes:
//   app/public/species/<slug>.jpg          the optimized image
//   research/_image-credits.json           slug -> {credit, license, source_url, title}
//
// Usage:
//   node scripts/fetch-images.mjs              # only fetch what's missing
//   node scripts/fetch-images.mjs --force      # refetch everything
//   node scripts/fetch-images.mjs brook-trout  # just one slug
//
// Only licenses in ALLOWED_LICENSES are downloaded. Anything non-free, unknown, or
// missing license metadata is skipped and reported so it can be sourced by hand.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const researchDir = path.resolve(__dirname, "..", "..", "research");
const imageDir = path.resolve(__dirname, "..", "public", "species");
const creditsPath = path.join(researchDir, "_image-credits.json");

// Wikimedia asks for a descriptive User-Agent identifying the tool and a contact.
const USER_AGENT =
  "MaritimeAnglerGuide/1.0 (personal fishing reference app; contact via github.com/bryanfitch25-source/fishingguide)";

// Substrings that mark a license as free enough to redistribute with attribution.
const ALLOWED_LICENSES = [
  "public domain",
  "pd-",
  "cc0",
  "cc-zero",
  "cc by",
  "cc-by",
  "attribution",
];

// Licenses that look permissive but are not usable here.
const BLOCKED_LICENSES = ["non-commercial", "nc-", "-nc", "nd-", "-nd", "fair use", "gfdl-1.2"];

const MAX_WIDTH = 1400;
const JPEG_QUALITY = 82;

function isFreeLicense(licenseShortName, licenseName) {
  const hay = `${licenseShortName ?? ""} ${licenseName ?? ""}`.toLowerCase();
  if (!hay.trim()) return false;
  if (BLOCKED_LICENSES.some((b) => hay.includes(b))) return false;
  return ALLOWED_LICENSES.some((a) => hay.includes(a));
}

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

/** True if the candidate's title plausibly refers to the query (guards against
 * unrelated Commons matches, e.g. a scenic photo of a place called "Redfish Lake"
 * turning up for a search on the fish species "Sebastes fasciatus"). A single generic
 * word from the common name (e.g. just "redfish") is NOT enough on its own — that's how
 * "Boats in Redfish Lake.jpg" slipped through — so common-name terms must match as a
 * complete phrase, while individual scientific-name words (genus/species epithet) are
 * distinctive enough to match alone. */
function titleMatchesQuery(title, query, extraPhrases = []) {
  const t = title.toLowerCase();

  const sciWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w !== "spp." && w !== "spp")
    .map((w) => w.replace(/\.$/, ""));
  if (sciWords.some((w) => t.includes(w))) return true;

  return extraPhrases.some((phrase) => phrase.length >= 4 && t.includes(phrase.toLowerCase()));
}

/** Search Commons for candidate images, best-first. `extraTerms` (e.g. the common
 * name) also count toward title-relevance matching, without affecting the search query itself. */
async function searchImages(query, extraTerms = [], limit = 12) {
  const json = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
    iiurlwidth: "1400",
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
        description: stripHtml(meta.ImageDescription?.value),
        assessments: (meta.Assessments?.value ?? "").toLowerCase(),
      };
    })
    .filter(Boolean)
    .filter((c) => c.mime === "image/jpeg" || c.mime === "image/png")
    .filter((c) => c.width >= 500)
    // Skip obvious non-photos of the live animal: maps/diagrams, and prepared food
    // (a huge fraction of Commons fish photos are plated dishes, not the live animal).
    .filter(
      (c) =>
        !/\b(map|distribution|range|stamp|logo|diagram|chart|stuffed|cooked|dish|sauce|recipe|cuisine|plate|grilled|fried|fillet|market|frozen|canned|sushi|sashimi|egg|eggs|spawn)\b/i.test(
          c.title
        )
    )
    // "larv" as a substring, not a whole-word match — catches "larva", "larvae", "larval",
    // and French "larve(s)" (Ifremer/European Commons uploads title these in French).
    .filter((c) => !/larv/i.test(c.title))
    // Guard against unrelated matches (place names, boats, etc.) that share a word with the query.
    .filter((c) => titleMatchesQuery(c.title, query, extraTerms))
    .sort((a, b) => {
      // Prefer Commons quality/featured images, then search rank.
      const score = (x) =>
        (x.assessments.includes("featured") ? -2 : 0) +
        (x.assessments.includes("quality") ? -1 : 0);
      return score(a) - score(b) || a.index - b.index;
    });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadAndOptimize(candidate, destPath) {
  // Commons rate-limits bursts with 429; back off and retry rather than losing the image.
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
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(destPath);
}

function buildCredit(candidate) {
  const who = candidate.artist || candidate.credit || "Unknown author";
  return {
    credit: who,
    license: candidate.licenseShortName || candidate.licenseName || "See source page",
    source_url: candidate.descriptionUrl,
    title: candidate.title.replace(/^File:/, ""),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlySlugs = args.filter((a) => !a.startsWith("--"));

  if (!existsSync(imageDir)) mkdirSync(imageDir, { recursive: true });

  const credits = existsSync(creditsPath)
    ? JSON.parse(readFileSync(creditsPath, "utf8"))
    : {};

  const speciesFiles = readdirSync(researchDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_") && !f.startsWith("location-"))
    .map((f) => JSON.parse(readFileSync(path.join(researchDir, f), "utf8")));

  // Build the work list: one entry per species, plus one per variant that has an image_query.
  const targets = [];
  for (const s of speciesFiles) {
    // A compound scientific_name like "Sebastes fasciatus / Sebastes mentella" doesn't
    // match anything on Commons as a literal string — search on the first binomial only.
    const primaryName = (s.scientific_name || "").split("/")[0].trim();
    targets.push({
      key: s.slug,
      query: primaryName || s.common_name,
      label: s.common_name,
    });
    for (const [i, v] of (s.variants ?? []).entries()) {
      if (!v.image_query) continue;
      targets.push({
        key: `${s.slug}--variant-${i}`,
        query: v.image_query,
        label: `${s.common_name} → ${v.name}`,
      });
    }
  }

  const work = targets.filter((t) => {
    if (onlySlugs.length && !onlySlugs.some((s) => t.key.startsWith(s))) return false;
    if (force) return true;
    return !existsSync(path.join(imageDir, `${t.key}.jpg`));
  });

  console.log(`${targets.length} targets, ${work.length} to fetch.\n`);

  const failures = [];

  for (const target of work) {
    process.stdout.write(`${target.label} … `);
    try {
      const commonNamePhrases = target.label
        .split("→")
        .pop()
        .trim()
        .replace(/["()]/g, "")
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean);
      const candidates = await searchImages(target.query, commonNamePhrases);
      const free = candidates.filter((c) => isFreeLicense(c.licenseShortName, c.licenseName));

      if (!free.length) {
        console.log(`SKIP (no freely-licensed image among ${candidates.length} results)`);
        failures.push({ ...target, reason: "no free license" });
        continue;
      }

      // If the best candidate's file is stuck (persistent 429s), fall through to the
      // next freely-licensed candidate rather than giving up on the whole target.
      let lastErr;
      let done = false;
      for (const chosen of free.slice(0, 4)) {
        try {
          await downloadAndOptimize(chosen, path.join(imageDir, `${target.key}.jpg`));
          credits[target.key] = { ...buildCredit(chosen), query: target.query };
          // Persist after every success — if the run gets interrupted partway,
          // downloaded images shouldn't end up with no recorded credit.
          writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
          console.log(`ok  [${chosen.licenseShortName}]  ${chosen.title.replace(/^File:/, "")}`);
          done = true;
          break;
        } catch (err) {
          lastErr = err;
          await sleep(1500);
        }
      }
      if (!done) throw lastErr ?? new Error("all candidates failed");
    } catch (err) {
      console.log(`FAIL ${err.message}`);
      failures.push({ ...target, reason: err.message });
    }

    // Be polite to the Commons API.
    await sleep(1200);
  }

  writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  console.log(`\nWrote credits for ${Object.keys(credits).length} images to _image-credits.json`);

  if (failures.length) {
    console.log(`\n${failures.length} need manual sourcing:`);
    for (const f of failures) console.log(`  - ${f.label} (${f.reason})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
