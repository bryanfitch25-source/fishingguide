import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase-server";
import { moonPhase } from "@/lib/moonphase";

interface CatchRow {
  id: string;
  catch_date: string;
  location: string | null;
  length_desc: string | null;
  weight_desc: string | null;
  kept: boolean;
  photo_url: string | null;
}

export async function MyCatches({ speciesSlug }: { speciesSlug: string }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catches")
    .select("id, catch_date, location, length_desc, weight_desc, kept, photo_url")
    .eq("species_slug", speciesSlug)
    .order("catch_date", { ascending: false });

  if (error || !data?.length) return null;

  const catches = data as CatchRow[];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-brand-dark border-b border-border pb-2 mb-3">
        My Catches ({catches.length})
      </h2>
      <p className="text-sm text-muted mb-3">
        From your <Link href="/catches" className="text-accent hover:underline">Catch Log</Link>.
      </p>
      <ul className="space-y-2">
        {catches.map((c) => (
          <li key={c.id} className="flex items-center gap-3 text-sm rounded-lg border border-border p-2.5">
            {c.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
              <img
                src={c.photo_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
              />
            ) : (
              <span className="text-xl" aria-hidden>
                {moonPhase(c.catch_date).emoji}
              </span>
            )}
            <span className="flex-1">
              <span className="font-medium">{c.catch_date}</span>
              {c.location ? ` — ${c.location}` : ""}
              {[c.length_desc, c.weight_desc].filter(Boolean).length > 0 && (
                <span className="text-muted"> ({[c.length_desc, c.weight_desc].filter(Boolean).join(" / ")})</span>
              )}
            </span>
            <span className="shrink-0 text-xs text-muted">{c.kept ? "Kept" : "Released"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
