-- Personal tackle inventory and catch log. Unlike the species/regulations/location-guide
-- content (public, read-only), this data belongs to whoever is signed in and is never
-- visible to anonymous visitors — RLS restricts every row to auth.uid() = user_id.

create table if not exists tackle_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (
    category in ('rod', 'reel', 'lure', 'line', 'terminal_tackle', 'net', 'electronics', 'apparel', 'other')
  ),
  brand text,
  model text,
  color_size text, -- free-form: "1/2 oz, chartreuse", "6'6\" ML", "20 lb braid", etc.
  quantity int not null default 1 check (quantity >= 0),
  storage_location text, -- e.g. "Tackle bag, top tray"
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tackle_items_user_idx on tackle_items (user_id);
create index if not exists tackle_items_category_idx on tackle_items (user_id, category);

-- Links a tackle item to species it's good for, pulled from the existing guide content
-- (powers the "gear you own" indicator on a species page).
create table if not exists tackle_item_species (
  tackle_item_id uuid not null references tackle_items(id) on delete cascade,
  species_slug text not null references species(slug) on delete cascade,
  primary key (tackle_item_id, species_slug)
);

create index if not exists tackle_item_species_slug_idx on tackle_item_species (species_slug);

create table if not exists catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  species_slug text references species(slug),
  catch_date date not null default current_date,
  location text, -- free-form: "Pointe-du-Chene Wharf" or a location_guides slug/title
  tackle_item_id uuid references tackle_items(id) on delete set null,
  length_desc text, -- free-form: "18 in" — keeping units flexible rather than forcing cm
  weight_desc text, -- free-form: "2.5 lb"
  kept boolean not null default false, -- false = released
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catches_user_idx on catches (user_id, catch_date desc);
create index if not exists catches_species_idx on catches (species_slug);

alter table tackle_items enable row level security;
alter table tackle_item_species enable row level security;
alter table catches enable row level security;

create policy "Owner full access to own tackle_items" on tackle_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Owner full access to own tackle_item_species" on tackle_item_species
  for all using (
    exists (select 1 from tackle_items t where t.id = tackle_item_species.tackle_item_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from tackle_items t where t.id = tackle_item_species.tackle_item_id and t.user_id = auth.uid())
  );

create policy "Owner full access to own catches" on catches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on tackle_items, tackle_item_species, catches to authenticated;

-- Keeps updated_at current without needing app-side bookkeeping.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tackle_items_set_updated_at
  before update on tackle_items
  for each row execute function set_updated_at();

create trigger catches_set_updated_at
  before update on catches
  for each row execute function set_updated_at();
