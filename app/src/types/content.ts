export type Province = "NB" | "NS" | "PEI";
export type SpeciesCategory = "freshwater" | "saltwater" | "anadromous";

export interface SourceLink {
  label: string;
  url: string;
}

export interface GuideSection {
  id: string;
  position: number;
  heading: string;
  body_md: string;
  sources: SourceLink[];
}

export interface Regulation {
  id: string;
  province: Province;
  water_type: string | null;
  season: string | null;
  bag_limit: string | null;
  size_limit: string | null;
  notes: string | null;
  source_url: string | null;
  last_verified: string | null;

  // Whether a human has checked this against the official source. The research flagged
  // several items as unresolved; carrying that on the row lets the species page say so
  // rather than leaving it in a developer file nobody reading the guide will open.
  verification_status?: "verified" | "unverified" | "disputed" | null;
  verification_note?: string | null;
}

export interface QuickReferenceItem {
  id: string;
  position: number;
  label: string;
  value: string;
}

export interface ImageInfo {
  path: string | null;
  credit: string | null;
  license: string | null;
  source_url: string | null;
}

export type VariantKind = "form" | "stock" | "life-stage" | "lookalike" | "related-species";

export interface SpeciesVariant {
  id: string;
  position: number;
  name: string;
  kind: VariantKind;
  scientific_name: string | null;
  how_to_tell: string;
  where_found: string | null;
  notes: string | null;
  image: ImageInfo;
}

export interface Species {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string | null;
  category: SpeciesCategory;
  provinces: Province[];
  summary: string | null;
  image: ImageInfo;
}

export interface SpeciesWithContent extends Species {
  guide_sections: GuideSection[];
  regulations: Regulation[];
  quick_reference: QuickReferenceItem[];
  species_sources: SourceLink[];
  variants: SpeciesVariant[];
}

export interface LocationGuideSection {
  id: string;
  position: number;
  heading: string;
  body_md: string;
  species_slug: string | null;
  sources: SourceLink[];
}

export interface LocationGuideSpot {
  id: string;
  position: number;
  name: string;
  description: string | null;
  map_url: string | null;
}

export interface LocationGuide {
  id: string;
  slug: string;
  title: string;
  province: Province;
  region_name: string | null;
  intro_md: string | null;
  lat: number | null;
  lng: number | null;
}

export interface LocationGuideWithContent extends LocationGuide {
  location_guide_sections: LocationGuideSection[];
  location_guide_spots: LocationGuideSpot[];
  location_guide_sources: SourceLink[];
}
