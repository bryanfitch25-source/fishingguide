-- Web Push subscriptions (browser-native standard, free, no third-party push service)
-- and a small per-user settings row for reminder-relevant dates.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

create table if not exists angler_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  license_expiry date,
  last_license_reminder_sent date,
  updated_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
alter table angler_settings enable row level security;

create policy "Owner full access to own push_subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Owner full access to own angler_settings" on angler_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on push_subscriptions, angler_settings to authenticated;

create trigger angler_settings_set_updated_at
  before update on angler_settings
  for each row execute function set_updated_at();
