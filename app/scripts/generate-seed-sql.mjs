// Converts ../../research/*.json (+ _image-credits.json) into a single, idempotent SQL
// script: app/supabase/seed.sql — paste-and-run in the Supabase SQL Editor (or `psql -f`).
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const researchDir = path.resolve(__dirname, "..", "..", "research");
const outPath = path.resolve(__dirname, "..", "supabase", "seed.sql");
const creditsPath = path.join(researchDir, "_image-credits.json");
const imageDir = path.resolve(__dirname, "..", "public", "species");

function q(value) {
  // SQL string literal, safely escaped. null/undefined -> NULL.
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function qJsonb(value) {
  return `${q(JSON.stringify(value ?? []))}::jsonb`;
}

function qTextArray(values) {
  const inner = (values ?? []).map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",");
  return `'{${inner}}'::text[]`;
}

function loadJsonFiles(locationOnly) {
  return readdirSync(researchDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .filter((f) => (locationOnly ? f.startsWith("location-") : !f.startsWith("location-")))
    .map((f) => JSON.parse(readFileSync(path.join(researchDir, f), "utf8")));
}

const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, "utf8")) : {};

/** Returns {path, credit, license, source_url} for a species slug or variant key, or all-null. */
function imageFor(key) {
  const hasFile = existsSync(path.join(imageDir, `${key}.jpg`));
  const credit = credits[key];
  if (!hasFile || !credit) {
    return { path: null, credit: null, license: null, source_url: null };
  }
  return {
    path: `/species/${key}.jpg`,
    credit: credit.credit ?? null,
    license: credit.license ?? null,
    source_url: credit.source_url ?? null,
  };
}

const speciesFiles = loadJsonFiles(false);
const locationFiles = loadJsonFiles(true);

let sql = `-- Generated seed data for Maritime Angler. Safe to re-run (upserts + delete/reinsert children).
-- Run this AFTER both migrations in supabase/migrations/ have been applied.
begin;
`;

for (const s of speciesFiles) {
  const img = imageFor(s.slug);
  sql += `\n-- ===== ${s.common_name} (${s.slug}) =====\n`;
  sql += `insert into species (slug, common_name, scientific_name, category, provinces, summary, image_path, image_credit, image_license, image_source_url, is_published, updated_at)
values (${q(s.slug)}, ${q(s.common_name)}, ${q(s.scientific_name)}, ${q(s.category)}, ${qTextArray(s.provinces)}, ${q(s.summary)}, ${q(img.path)}, ${q(img.credit)}, ${q(img.license)}, ${q(img.source_url)}, true, now())
on conflict (slug) do update set
  common_name = excluded.common_name,
  scientific_name = excluded.scientific_name,
  category = excluded.category,
  provinces = excluded.provinces,
  summary = excluded.summary,
  image_path = excluded.image_path,
  image_credit = excluded.image_credit,
  image_license = excluded.image_license,
  image_source_url = excluded.image_source_url,
  is_published = true,
  updated_at = now();
`;
  sql += `delete from guide_sections where species_id = (select id from species where slug = ${q(s.slug)});\n`;
  sql += `delete from regulations where species_id = (select id from species where slug = ${q(s.slug)});\n`;
  sql += `delete from quick_reference where species_id = (select id from species where slug = ${q(s.slug)});\n`;
  sql += `delete from species_sources where species_id = (select id from species where slug = ${q(s.slug)});\n`;
  sql += `delete from species_variants where species_id = (select id from species where slug = ${q(s.slug)});\n`;

  (s.sections ?? []).forEach((sec, i) => {
    sql += `insert into guide_sections (species_id, position, heading, body_md, sources) values ((select id from species where slug = ${q(s.slug)}), ${i}, ${q(sec.heading)}, ${q(sec.body_md)}, ${qJsonb(sec.sources)});\n`;
  });

  (s.regulations ?? []).forEach((r) => {
    sql += `insert into regulations (species_id, province, water_type, season, bag_limit, size_limit, notes, source_url, last_verified) values ((select id from species where slug = ${q(s.slug)}), ${q(r.province)}, ${q(r.water_type)}, ${q(r.season)}, ${q(r.bag_limit)}, ${q(r.size_limit)}, ${q(r.notes)}, ${q(r.source_url)}, ${q(r.last_verified)});\n`;
  });

  (s.quick_reference ?? []).forEach((qr, i) => {
    sql += `insert into quick_reference (species_id, position, label, value) values ((select id from species where slug = ${q(s.slug)}), ${i}, ${q(qr.label)}, ${q(qr.value)});\n`;
  });

  (s.sources ?? []).forEach((src) => {
    sql += `insert into species_sources (species_id, label, url) values ((select id from species where slug = ${q(s.slug)}), ${q(src.label)}, ${q(src.url)});\n`;
  });

  (s.variants ?? []).forEach((v, i) => {
    const vImg = imageFor(`${s.slug}--variant-${i}`);
    sql += `insert into species_variants (species_id, position, name, kind, scientific_name, how_to_tell, where_found, notes, image_path, image_credit, image_license, image_source_url) values ((select id from species where slug = ${q(s.slug)}), ${i}, ${q(v.name)}, ${q(v.kind)}, ${q(v.scientific_name)}, ${q(v.how_to_tell)}, ${q(v.where_found)}, ${q(v.notes)}, ${q(vImg.path)}, ${q(vImg.credit)}, ${q(vImg.license)}, ${q(vImg.source_url)});\n`;
  });
}

for (const g of locationFiles) {
  sql += `\n-- ===== Location guide: ${g.title} (${g.slug}) =====\n`;
  sql += `insert into location_guides (slug, title, province, region_name, intro_md, lat, lng, is_published, updated_at)
values (${q(g.slug)}, ${q(g.title)}, ${q(g.province)}, ${q(g.region_name)}, ${q(g.intro_md)}, ${g.lat ?? "NULL"}, ${g.lng ?? "NULL"}, true, now())
on conflict (slug) do update set
  title = excluded.title,
  province = excluded.province,
  region_name = excluded.region_name,
  intro_md = excluded.intro_md,
  lat = excluded.lat,
  lng = excluded.lng,
  is_published = true,
  updated_at = now();
`;
  sql += `delete from location_guide_sections where location_guide_id = (select id from location_guides where slug = ${q(g.slug)});\n`;
  sql += `delete from location_guide_spots where location_guide_id = (select id from location_guides where slug = ${q(g.slug)});\n`;
  sql += `delete from location_guide_sources where location_guide_id = (select id from location_guides where slug = ${q(g.slug)});\n`;

  (g.sections ?? []).forEach((sec, i) => {
    sql += `insert into location_guide_sections (location_guide_id, position, heading, body_md, species_slug, sources) values ((select id from location_guides where slug = ${q(g.slug)}), ${i}, ${q(sec.heading)}, ${q(sec.body_md)}, ${q(sec.species_slug)}, ${qJsonb(sec.sources)});\n`;
  });

  (g.spots ?? []).forEach((sp, i) => {
    sql += `insert into location_guide_spots (location_guide_id, position, name, description, map_url) values ((select id from location_guides where slug = ${q(g.slug)}), ${i}, ${q(sp.name)}, ${q(sp.description)}, ${q(sp.map_url)});\n`;
  });

  (g.sources ?? []).forEach((src) => {
    sql += `insert into location_guide_sources (location_guide_id, label, url) values ((select id from location_guides where slug = ${q(g.slug)}), ${q(src.label)}, ${q(src.url)});\n`;
  });
}

sql += `\ncommit;\n`;

writeFileSync(outPath, sql, "utf8");
const withImages = speciesFiles.filter((s) => imageFor(s.slug).path).length;
console.log(
  `Wrote ${outPath} (${speciesFiles.length} species [${withImages} with photos], ${locationFiles.length} location guides).`
);
