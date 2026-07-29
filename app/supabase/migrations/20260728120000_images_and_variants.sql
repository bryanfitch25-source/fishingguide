-- Adds photo support and species variants (life-history forms, stocks, life stages,
-- and lookalike/related species anglers need to tell apart).

alter table species add column if not exists image_path text;      -- e.g. '/species/atlantic-mackerel.jpg'
alter table species add column if not exists image_credit text;    -- photographer / uploader
alter table species add column if not exists image_license text;   -- e.g. 'CC BY-SA 4.0'
alter table species add column if not exists image_source_url text; -- Commons file page

create table if not exists species_variants (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  position int not null,
  name text not null,
  kind text not null check (kind in ('form', 'stock', 'life-stage', 'lookalike', 'related-species')),
  scientific_name text,
  how_to_tell text not null,
  where_found text,
  notes text,
  image_path text,
  image_credit text,
  image_license text,
  image_source_url text
);

create index if not exists species_variants_species_idx on species_variants (species_id, position);

alter table species_variants enable row level security;

create policy "Public read species_variants" on species_variants for select using (
  exists (select 1 from species s where s.id = species_variants.species_id and s.is_published = true)
);

grant select on species_variants to anon, authenticated;
