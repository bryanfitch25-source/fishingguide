import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { TackleBoxClient } from "@/components/TackleBoxClient";

export const metadata = {
  title: "Tackle Box — Maritime Angler",
};

export default async function TackleBoxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const species = await getAllSpecies();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Tackle Box</h1>
      <p className="text-muted mb-8 max-w-2xl">
        Your personal tackle inventory. Tag an item with the species it&apos;s good for and
        it&apos;ll show up as owned gear on that species&apos; guide page.
      </p>
      <TackleBoxClient species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))} />
    </div>
  );
}
