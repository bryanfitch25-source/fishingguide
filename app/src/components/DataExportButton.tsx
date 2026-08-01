"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

// One-click full backup — your tackle, trays, and catches never live only inside
// this app. Plain JSON, readable and re-importable by hand if ever needed.
export function DataExportButton() {
  const supabase = useMemo(() => createClient(), []);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const [items, trays, catches] = await Promise.all([
      supabase.from("tackle_items").select("*, tackle_item_species(species_slug)"),
      supabase.from("tackle_trays").select("*"),
      supabase.from("catches").select("*"),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      tackle_trays: trays.data ?? [],
      tackle_items: items.data ?? [],
      catches: catches.data ?? [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maritime-angler-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand transition disabled:opacity-60"
    >
      {exporting ? "Exporting…" : "⬇ Export All My Data (JSON)"}
    </button>
  );
}
