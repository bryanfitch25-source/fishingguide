"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// One browser client per page load, used by client components for auth
// (sign in/up/out) and for any authenticated read/write of the signed-in
// user's own data (tackle items, catches) — RLS enforces the rest.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
