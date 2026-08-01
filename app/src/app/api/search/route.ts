import { NextRequest, NextResponse } from "next/server";
import { getAllSpecies } from "@/lib/data";

// Public species search (name/scientific name) — used by the header search box.
// Signed-in-only content (tackle, catches) is searched client-side directly against
// Supabase from GlobalSearch.tsx, since that's RLS-scoped to the signed-in user anyway.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const species = await getAllSpecies();
  const results = species
    .filter(
      (s) =>
        s.common_name.toLowerCase().includes(q) ||
        (s.scientific_name ?? "").toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((s) => ({ type: "species", slug: s.slug, title: s.common_name, subtitle: s.category }));

  return NextResponse.json({ results });
}
