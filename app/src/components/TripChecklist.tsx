"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { TackleItem } from "@/types/tackle";

// Reuses the same `packed` flag from the Tackle Box's pack list (Update 2) — checking
// something off here checks it off there too, and vice versa, since it's the same trip.
export function TripChecklist({ items: initialItems }: { items: TackleItem[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(initialItems);

  async function toggle(item: TackleItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    const { error } = await supabase.from("tackle_items").update({ packed: !item.packed }).eq("id", item.id);
    if (error) {
      // Roll back the optimistic update so the checkbox doesn't silently drift from the DB.
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: item.packed } : i)));
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">No gear tagged for these species yet — tag some in your Tackle Box.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.packed}
            onChange={() => toggle(item)}
            className="no-print"
          />
          <span data-print-only>{item.packed ? "☑" : "☐"}</span>
          <span className={item.packed ? "line-through text-muted" : ""}>
            {item.name}
            {item.quantity !== 1 ? ` ×${item.quantity}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
