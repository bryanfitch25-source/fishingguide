-- Fishing Guide schema: species guides, regulations, location guides
-- for New Brunswick, Nova Scotia, and Prince Edward Island recreational fishing.

create extension if not exists "pgcrypto";

-- Species: the core content unit (one page per fish species)
create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  common_name text not null,
  scientific_name text,
  category text not null check (category in ('freshwater', 'saltwater', 'anadromous')),
  provinces text[] not null default '{}', -- subset of ('NB','NS','PEI')
  summary text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists species_category_idx on species (category);
create index if not exists species_provinces_idx on species using gin (provinces);

-- Guide sections: ordered markdown content blocks per species
-- (e.g. "Know the Fish", "When to Go", "Gear", "Technique", "Handling & Release")
create table if not exists guide_sections (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  position int not null,
  heading text not null,
  body_md text not null,
  sources jsonb not null default '[]', -- [{label, url}]
  created_at timestamptz not null default now()
);

create index if not exists guide_sections_species_idx on guide_sections (species_id, position);

-- Regulations: structured, filterable by province, per species
create table if not exists regulations (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  province text not null check (province in ('NB', 'NS', 'PEI')),
  water_type text,
  season text,
  bag_limit text,
  size_limit text,
  notes text,
  source_url text,
  last_verified text, -- year or date string, e.g. "2026"
  created_at timestamptz not null default now()
);

create index if not exists regulations_species_idx on regulations (species_id);
create index if not exists regulations_province_idx on regulations (province);

-- Quick reference: short label/value pairs shown at the top of a guide
create table if not exists quick_reference (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  position int not null,
  label text not null,
  value text not null
);

create index if not exists quick_reference_species_idx on quick_reference (species_id, position);

-- Master source list per species (union of all section sources, for a "Sources" footer)
create table if not exists species_sources (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  label text not null,
  url text not null
);

create index if not exists species_sources_species_idx on species_sources (species_id);

-- Location guides: trip/region-specific guides referencing multiple species
-- (e.g. "Shore Fishing Around Shediac & Cocagne, NB", "Launching, PEI")
create table if not exists location_guides (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  province text not null check (province in ('NB', 'NS', 'PEI')),
  region_name text,
  intro_md text,
  lat numeric,
  lng numeric,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists location_guide_sections (
  id uuid primary key default gen_random_uuid(),
  location_guide_id uuid not null references location_guides(id) on delete cascade,
  position int not null,
  heading text not null,
  body_md text not null,
  species_slug text references species(slug), -- optional link to a full species guide
  sources jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists location_guide_sections_guide_idx on location_guide_sections (location_guide_id, position);

create table if not exists location_guide_spots (
  id uuid primary key default gen_random_uuid(),
  location_guide_id uuid not null references location_guides(id) on delete cascade,
  position int not null,
  name text not null,
  description text,
  map_url text
);

create table if not exists location_guide_sources (
  id uuid primary key default gen_random_uuid(),
  location_guide_id uuid not null references location_guides(id) on delete cascade,
  label text not null,
  url text not null
);

-- Row Level Security: content is public read-only; writes happen via service role (seed script) only.
alter table species enable row level security;
alter table guide_sections enable row level security;
alter table regulations enable row level security;
alter table quick_reference enable row level security;
alter table species_sources enable row level security;
alter table location_guides enable row level security;
alter table location_guide_sections enable row level security;
alter table location_guide_spots enable row level security;
alter table location_guide_sources enable row level security;

create policy "Public read published species" on species for select using (is_published = true);
create policy "Public read guide_sections" on guide_sections for select using (
  exists (select 1 from species s where s.id = guide_sections.species_id and s.is_published = true)
);
create policy "Public read regulations" on regulations for select using (
  exists (select 1 from species s where s.id = regulations.species_id and s.is_published = true)
);
create policy "Public read quick_reference" on quick_reference for select using (
  exists (select 1 from species s where s.id = quick_reference.species_id and s.is_published = true)
);
create policy "Public read species_sources" on species_sources for select using (
  exists (select 1 from species s where s.id = species_sources.species_id and s.is_published = true)
);
create policy "Public read published location_guides" on location_guides for select using (is_published = true);
create policy "Public read location_guide_sections" on location_guide_sections for select using (
  exists (select 1 from location_guides g where g.id = location_guide_sections.location_guide_id and g.is_published = true)
);
create policy "Public read location_guide_spots" on location_guide_spots for select using (
  exists (select 1 from location_guides g where g.id = location_guide_spots.location_guide_id and g.is_published = true)
);
create policy "Public read location_guide_sources" on location_guide_sources for select using (
  exists (select 1 from location_guides g where g.id = location_guide_sources.location_guide_id and g.is_published = true)
);
