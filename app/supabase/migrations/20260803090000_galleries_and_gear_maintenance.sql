-- Multi-photo galleries (beyond the single primary photo_url) for both tackle items
-- and catches, plus a lightweight gear-maintenance log on tackle items.

alter table tackle_items add column if not exists extra_photo_urls text[] not null default '{}';
alter table catches add column if not exists extra_photo_urls text[] not null default '{}';

alter table tackle_items add column if not exists last_serviced_on date;
alter table tackle_items add column if not exists maintenance_interval_days int;
alter table tackle_items add column if not exists maintenance_notes text;
alter table tackle_items add column if not exists last_maintenance_reminder_sent date;
