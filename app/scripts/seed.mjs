// Seeds Supabase with species guides and location (trip) guides from ../research/*.json
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
// or place NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in app/.env.local and run:
//   npm run seed

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "./load-env.mjs";

dotenv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const researchDir = path.resolve(__dirname, "..", "..", "research");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Set them in app/.env.local or the environment before running: npm run seed"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function loadJsonFiles(prefix) {
  return readdirSync(researchDir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .filter((f) => (prefix ? f.startsWith(prefix) : !f.startsWith("location-")))
    .map((f) => JSON.parse(readFileSync(path.join(researchDir, f), "utf8")));
}

async function seedSpecies(species) {
  console.log(`\n--- Seeding species: ${species.common_name} (${species.slug}) ---`);

  const { data: speciesRow, error: speciesErr } = await supabase
    .from("species")
    .upsert(
      {
        slug: species.slug,
        common_name: species.common_name,
        scientific_name: species.scientific_name ?? null,
        category: species.category,
        provinces: species.provinces,
        summary: species.summary ?? null,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (speciesErr) {
    console.error(`  FAILED species upsert:`, speciesErr.message);
    return;
  }
  const speciesId = speciesRow.id;

  // Clear existing children so re-running the seed script is idempotent
  await supabase.from("guide_sections").delete().eq("species_id", speciesId);
  await supabase.from("regulations").delete().eq("species_id", speciesId);
  await supabase.from("quick_reference").delete().eq("species_id", speciesId);
  await supabase.from("species_sources").delete().eq("species_id", speciesId);

  if (species.sections?.length) {
    const rows = species.sections.map((s, i) => ({
      species_id: speciesId,
      position: i,
      heading: s.heading,
      body_md: s.body_md,
      sources: s.sources ?? [],
    }));
    const { error } = await supabase.from("guide_sections").insert(rows);
    if (error) console.error("  guide_sections insert failed:", error.message);
    else console.log(`  + ${rows.length} guide sections`);
  }

  if (species.regulations?.length) {
    const rows = species.regulations.map((r) => ({
      species_id: speciesId,
      province: r.province,
      water_type: r.water_type ?? null,
      season: r.season ?? null,
      bag_limit: r.bag_limit ?? null,
      size_limit: r.size_limit ?? null,
      notes: r.notes ?? null,
      source_url: r.source_url ?? null,
      last_verified: r.last_verified ?? null,
    }));
    const { error } = await supabase.from("regulations").insert(rows);
    if (error) console.error("  regulations insert failed:", error.message);
    else console.log(`  + ${rows.length} regulation rows`);
  }

  if (species.quick_reference?.length) {
    const rows = species.quick_reference.map((qr, i) => ({
      species_id: speciesId,
      position: i,
      label: qr.label,
      value: qr.value,
    }));
    const { error } = await supabase.from("quick_reference").insert(rows);
    if (error) console.error("  quick_reference insert failed:", error.message);
    else console.log(`  + ${rows.length} quick reference rows`);
  }

  if (species.sources?.length) {
    const rows = species.sources.map((src) => ({
      species_id: speciesId,
      label: src.label,
      url: src.url,
    }));
    const { error } = await supabase.from("species_sources").insert(rows);
    if (error) console.error("  species_sources insert failed:", error.message);
    else console.log(`  + ${rows.length} master sources`);
  }
}

async function seedLocationGuide(guide) {
  console.log(`\n--- Seeding location guide: ${guide.title} (${guide.slug}) ---`);

  const { data: guideRow, error: guideErr } = await supabase
    .from("location_guides")
    .upsert(
      {
        slug: guide.slug,
        title: guide.title,
        province: guide.province,
        region_name: guide.region_name ?? null,
        intro_md: guide.intro_md ?? null,
        lat: guide.lat ?? null,
        lng: guide.lng ?? null,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (guideErr) {
    console.error(`  FAILED location_guides upsert:`, guideErr.message);
    return;
  }
  const guideId = guideRow.id;

  await supabase.from("location_guide_sections").delete().eq("location_guide_id", guideId);
  await supabase.from("location_guide_spots").delete().eq("location_guide_id", guideId);
  await supabase.from("location_guide_sources").delete().eq("location_guide_id", guideId);

  if (guide.sections?.length) {
    const rows = guide.sections.map((s, i) => ({
      location_guide_id: guideId,
      position: i,
      heading: s.heading,
      body_md: s.body_md,
      species_slug: s.species_slug ?? null,
      sources: s.sources ?? [],
    }));
    const { error } = await supabase.from("location_guide_sections").insert(rows);
    if (error) console.error("  location_guide_sections insert failed:", error.message);
    else console.log(`  + ${rows.length} sections`);
  }

  if (guide.spots?.length) {
    const rows = guide.spots.map((sp, i) => ({
      location_guide_id: guideId,
      position: i,
      name: sp.name,
      description: sp.description ?? null,
      map_url: sp.map_url ?? null,
    }));
    const { error } = await supabase.from("location_guide_spots").insert(rows);
    if (error) console.error("  location_guide_spots insert failed:", error.message);
    else console.log(`  + ${rows.length} spots`);
  }

  if (guide.sources?.length) {
    const rows = guide.sources.map((src) => ({
      location_guide_id: guideId,
      label: src.label,
      url: src.url,
    }));
    const { error } = await supabase.from("location_guide_sources").insert(rows);
    if (error) console.error("  location_guide_sources insert failed:", error.message);
    else console.log(`  + ${rows.length} sources`);
  }
}

async function main() {
  const speciesFiles = loadJsonFiles(null);
  const locationFiles = loadJsonFiles("location-");

  console.log(`Found ${speciesFiles.length} species files and ${locationFiles.length} location guide files.`);

  for (const species of speciesFiles) {
    await seedSpecies(species);
  }
  for (const guide of locationFiles) {
    await seedLocationGuide(guide);
  }

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
