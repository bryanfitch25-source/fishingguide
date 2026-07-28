import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(__dirname).filter((f) => f.endsWith(".json"));

const VALID_PROVINCES = ["NB", "NS", "PEI"];
const VALID_CATEGORIES = ["freshwater", "saltwater", "anadromous"];

let errors = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(path.join(__dirname, file), "utf8"));
  const isLocation = file.startsWith("location-");
  const ctx = `[${file}]`;

  if (isLocation) {
    for (const req of ["slug", "title", "province", "sections"]) {
      if (!data[req]) {
        console.error(`${ctx} missing required field: ${req}`);
        errors++;
      }
    }
    if (data.province && !VALID_PROVINCES.includes(data.province)) {
      console.error(`${ctx} invalid province: ${data.province}`);
      errors++;
    }
    for (const s of data.sections ?? []) {
      if (!s.heading || !s.body_md) {
        console.error(`${ctx} section missing heading/body_md`);
        errors++;
      }
    }
  } else {
    for (const req of ["slug", "common_name", "category", "provinces", "sections", "regulations"]) {
      if (!data[req]) {
        console.error(`${ctx} missing required field: ${req}`);
        errors++;
      }
    }
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      console.error(`${ctx} invalid category: ${data.category}`);
      errors++;
    }
    for (const p of data.provinces ?? []) {
      if (!VALID_PROVINCES.includes(p)) {
        console.error(`${ctx} invalid province in provinces[]: ${p}`);
        errors++;
      }
    }
    for (const r of data.regulations ?? []) {
      if (!VALID_PROVINCES.includes(r.province)) {
        console.error(`${ctx} invalid province in regulations[]: ${r.province}`);
        errors++;
      }
    }
    if (file.replace(".json", "") !== data.slug) {
      console.error(`${ctx} filename/slug mismatch: file=${file} slug=${data.slug}`);
      errors++;
    }
    for (const s of data.sections ?? []) {
      if (!s.heading || !s.body_md) {
        console.error(`${ctx} section missing heading/body_md`);
        errors++;
      }
    }
  }
}

console.log(`\nChecked ${files.length} files, ${errors} error(s).`);
process.exit(errors > 0 ? 1 : 0);
