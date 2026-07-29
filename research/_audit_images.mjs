// Flags suspicious image credits worth a manual look (place names, food, generic terms).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credits = JSON.parse(readFileSync(path.join(__dirname, "_image-credits.json"), "utf8"));

const SUSPICIOUS = /\b(lake|boat|harbou?r|dish|stuffed|cooked|sauce|recipe|plate|market|frozen|canned|sushi|festival|logo|map|people|person|man|woman|child|restaurant|store|shop)\b/i;

let flagged = 0;
for (const [key, info] of Object.entries(credits)) {
  const title = info.title ?? "";
  if (SUSPICIOUS.test(title)) {
    console.log(`SUSPECT  ${key.padEnd(35)} query="${info.query}"  title="${title}"`);
    flagged++;
  }
}
console.log(`\n${Object.keys(credits).length} images total, ${flagged} flagged for review.`);
