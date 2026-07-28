import { supabase, isSupabaseConfigured } from "./supabase";
import type {
  Species,
  SpeciesWithContent,
  LocationGuide,
  LocationGuideWithContent,
} from "@/types/content";

const SPECIES_LIST_SELECT = "id, slug, common_name, scientific_name, category, provinces, summary";

const SPECIES_DETAIL_SELECT = `
  id, slug, common_name, scientific_name, category, provinces, summary,
  guide_sections ( id, position, heading, body_md, sources ),
  regulations ( id, province, water_type, season, bag_limit, size_limit, notes, source_url, last_verified ),
  quick_reference ( id, position, label, value ),
  species_sources ( label, url )
`;

const LOCATION_LIST_SELECT = "id, slug, title, province, region_name, intro_md, lat, lng";

const LOCATION_DETAIL_SELECT = `
  id, slug, title, province, region_name, intro_md, lat, lng,
  location_guide_sections ( id, position, heading, body_md, species_slug, sources ),
  location_guide_spots ( id, position, name, description, map_url ),
  location_guide_sources ( label, url )
`;

export async function getAllSpecies(): Promise<Species[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("species")
    .select(SPECIES_LIST_SELECT)
    .eq("is_published", true)
    .order("common_name");
  if (error) {
    console.error("getAllSpecies error", error);
    return [];
  }
  return (data as unknown as Species[]) ?? [];
}

export async function getSpeciesBySlug(slug: string): Promise<SpeciesWithContent | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("species")
    .select(SPECIES_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) {
    console.error("getSpeciesBySlug error", error);
    return null;
  }
  if (!data) return null;
  const species = data as unknown as SpeciesWithContent;
  species.guide_sections = [...(species.guide_sections ?? [])].sort((a, b) => a.position - b.position);
  species.quick_reference = [...(species.quick_reference ?? [])].sort((a, b) => a.position - b.position);
  return species;
}

export interface RegulationOverviewRow {
  species_slug: string;
  species_name: string;
  province: import("@/types/content").Province;
  water_type: string | null;
  season: string | null;
  bag_limit: string | null;
  size_limit: string | null;
}

export async function getRegulationsOverview(): Promise<RegulationOverviewRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("species")
    .select(
      "slug, common_name, regulations ( province, water_type, season, bag_limit, size_limit )"
    )
    .eq("is_published", true)
    .order("common_name");
  if (error) {
    console.error("getRegulationsOverview error", error);
    return [];
  }
  const rows: RegulationOverviewRow[] = [];
  for (const species of data ?? []) {
    const regs = (species as { regulations?: unknown[] }).regulations ?? [];
    for (const reg of regs as {
      province: import("@/types/content").Province;
      water_type: string | null;
      season: string | null;
      bag_limit: string | null;
      size_limit: string | null;
    }[]) {
      rows.push({
        species_slug: (species as { slug: string }).slug,
        species_name: (species as { common_name: string }).common_name,
        province: reg.province,
        water_type: reg.water_type,
        season: reg.season,
        bag_limit: reg.bag_limit,
        size_limit: reg.size_limit,
      });
    }
  }
  return rows;
}

export async function getAllLocationGuides(): Promise<LocationGuide[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("location_guides")
    .select(LOCATION_LIST_SELECT)
    .eq("is_published", true)
    .order("title");
  if (error) {
    console.error("getAllLocationGuides error", error);
    return [];
  }
  return (data as unknown as LocationGuide[]) ?? [];
}

export async function getLocationGuideBySlug(slug: string): Promise<LocationGuideWithContent | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("location_guides")
    .select(LOCATION_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) {
    console.error("getLocationGuideBySlug error", error);
    return null;
  }
  if (!data) return null;
  const guide = data as unknown as LocationGuideWithContent;
  guide.location_guide_sections = [...(guide.location_guide_sections ?? [])].sort(
    (a, b) => a.position - b.position
  );
  guide.location_guide_spots = [...(guide.location_guide_spots ?? [])].sort(
    (a, b) => a.position - b.position
  );
  return guide;
}
