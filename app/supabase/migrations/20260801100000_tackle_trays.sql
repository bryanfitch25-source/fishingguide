-- Tackle trays: a proper entity instead of a free-text "storage location" string, so
-- items can be filtered/browsed by tray the same way they're filtered by category.

create table if not exists tackle_trays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tackle_trays_user_idx on tackle_trays (user_id, position);

alter table tackle_items add column if not exists tray_id uuid references tackle_trays(id) on delete set null;
create index if not exists tackle_items_tray_idx on tackle_items (tray_id);

alter table tackle_trays enable row level security;

create policy "Owner full access to own tackle_trays" on tackle_trays
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on tackle_trays to authenticated;

create trigger tackle_trays_set_updated_at
  before update on tackle_trays
  for each row execute function set_updated_at();
