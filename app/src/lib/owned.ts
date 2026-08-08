// Loading what's actually in your boxes, for the matcher to match against.
//
// One query across both disciplines rather than two, because the matcher doesn't care
// which box a thing lives in — it cares whether you own something that will catch the
// fish. Which box it came from is carried along so the interface can say "in your Fly
// Box" rather than making you go and look.

import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { readWithSchemaFallback } from "@/lib/schema-compat";
import type { Discipline } from "@/types/tackle";

export interface OwnedGearItem {
  id: string;
  name: string;
  category: string;
  discipline: Discipline;
  specs?: Record<string, string | boolean>;
}

const FULL_SELECT = "id, name, category, specs, discipline";
const BASE_SELECT = "id, name, category";

/**
 * Every item in the Tackle Box and Fly Box, or an empty list when signed out.
 *
 * Signed-out is a normal state here, not an error: the matcher is public and useful
 * without an account — you just don't get the owned badges.
 */
export async function getOwnedGear(): Promise<OwnedGearItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  // The select list is a runtime string, so Supabase can't infer a row type from it —
  // same shape as getSpeciesBySlug in lib/data.ts, and cast the same way afterwards.
  const { data, error } = await readWithSchemaFallback(
    (select) => supabase.from("tackle_items").select(select).order("name"),
    FULL_SELECT,
    BASE_SELECT
  );
  if (error || !data) return [];

  const rows = data as unknown as Record<string, unknown>[];
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    category: String(row.category ?? "other"),
    // Pre-migration rows have no discipline column; everything then was conventional.
    discipline: (row.discipline as Discipline | undefined) ?? "conventional",
    specs: (row.specs as Record<string, string | boolean> | null) ?? undefined,
  }));
}
