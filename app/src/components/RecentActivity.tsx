import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { moonPhase } from "@/lib/moonphase";

const LOW_STOCK_THRESHOLD = 1;

interface RecentCatch {
  id: string;
  species_slug: string | null;
  catch_date: string;
  location: string | null;
}

export async function RecentActivity() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const [catchesRes, tackleRes, species] = await Promise.all([
    supabase
      .from("catches")
      .select("id, species_slug, catch_date, location")
      .order("catch_date", { ascending: false })
      .limit(5),
    supabase.from("tackle_items").select("quantity").lte("quantity", LOW_STOCK_THRESHOLD),
    getAllSpecies(),
  ]);

  const catches = (catchesRes.data as RecentCatch[] | null) ?? [];
  const lowStockCount = tackleRes.data?.length ?? 0;
  const speciesName = (slug: string | null) =>
    slug ? species.find((s) => s.slug === slug)?.common_name ?? slug : "Unknown species";

  if (catches.length === 0 && lowStockCount === 0) return null;

  return (
    <div className="mb-12 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-brand-dark mb-4">Recent Activity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-catches mb-2">🐟 Latest Catches</h3>
          {catches.length === 0 ? (
            <p className="text-sm text-muted">
              No catches logged yet —{" "}
              <Link href="/catches" className="text-accent hover:underline">
                log your first one
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {catches.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span aria-hidden>{moonPhase(c.catch_date).emoji}</span>
                  <span className="font-medium">{speciesName(c.species_slug)}</span>
                  <span className="text-muted">
                    {c.catch_date}
                    {c.location ? ` · ${c.location}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-tackle mb-2">🧰 Tackle Box</h3>
          {lowStockCount > 0 ? (
            <p className="text-sm">
              <Link href="/tackle" className="text-danger hover:underline font-medium">
                ⚠️ {lowStockCount} item{lowStockCount === 1 ? "" : "s"} running low
              </Link>{" "}
              <span className="text-muted">— worth restocking before your next trip.</span>
            </p>
          ) : (
            <p className="text-sm text-muted">Everything&apos;s stocked up.</p>
          )}
        </div>
      </div>
    </div>
  );
}
