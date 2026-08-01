import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Server-only (no NEXT_PUBLIC_ prefix on the key),
// used exclusively by the reminders cron route to read across all users' subscriptions
// and settings, which a per-user RLS-scoped client can't do.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
