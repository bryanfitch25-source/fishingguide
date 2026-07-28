-- Grant read access to the API roles (RLS policies from the init migration still
-- restrict rows to published content; these grants just allow SELECT at all).
grant usage on schema public to anon, authenticated;
grant select on
  species,
  guide_sections,
  regulations,
  quick_reference,
  species_sources,
  location_guides,
  location_guide_sections,
  location_guide_spots,
  location_guide_sources
to anon, authenticated;
