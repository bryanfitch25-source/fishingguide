import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { CatchLogClient } from "@/components/CatchLogClient";

export const metadata = {
  title: "Catch Log — Maritime Angler",
};

export default async function CatchLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Catch Log</h1>
      <p className="text-muted mb-8 max-w-2xl">
        What you caught, where, and what you used — your own record of what actually works.
      </p>
      <CatchLogClient species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))} />
    </div>
  );
}
