"use client";

import { useRouter } from "next/navigation";
import type { LocationGuide } from "@/types/content";

export function TripPlannerControls({
  locations,
  selectedSlug,
}: {
  locations: LocationGuide[];
  selectedSlug: string | null;
}) {
  const router = useRouter();

  return (
    <div className="no-print mb-6">
      <label className="block text-sm font-medium mb-1">Pick a trip location</label>
      <select
        value={selectedSlug ?? ""}
        onChange={(e) => router.push(e.target.value ? `/trip-planner?location=${e.target.value}` : "/trip-planner")}
        className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">— Choose a trip guide —</option>
        {locations.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.title}
          </option>
        ))}
      </select>
    </div>
  );
}
