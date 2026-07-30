import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { TACKLE_CATEGORIES, type TackleCategory } from "@/types/tackle";

interface OwnedItem {
  id: string;
  name: string;
  category: TackleCategory;
  brand: string | null;
  color_size: string | null;
  quantity: number;
}

export async function OwnedGear({ speciesSlug }: { speciesSlug: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tackle_item_species")
    .select("tackle_items(id, name, category, brand, color_size, quantity)")
    .eq("species_slug", speciesSlug);

  if (error || !data?.length) return null;

  const items = data
    .map((row) => (row as unknown as { tackle_items: OwnedItem | null }).tackle_items)
    .filter((i): i is OwnedItem => i !== null);

  if (!items.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
        Gear You Own
      </h2>
      <p className="text-sm text-muted mb-3">
        Tagged in your <Link href="/tackle" className="text-accent hover:underline">Tackle Box</Link> as
        good for this species.
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="text-sm flex items-center gap-2">
            <span className="text-brand">✓</span>
            <span className="font-medium">{item.name}</span>
            <span className="text-muted">
              ({TACKLE_CATEGORIES.find((c) => c.value === item.category)?.label}
              {item.brand ? `, ${item.brand}` : ""}
              {item.color_size ? `, ${item.color_size}` : ""}) × {item.quantity}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
