import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-server";
import { getAllSpecies } from "@/lib/data";
import { FlySectionClient } from "@/components/FlySectionClient";

export const metadata = {
  title: "Fly Box — Maritime Angler",
  description:
    "Fly gear kept separate from conventional tackle, with Maritime patterns, line weights, the tippet chart, fly knots and the salmon rules.",
};

export default async function FlyPage(props: {
  searchParams: Promise<{ pattern?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [species, params] = await Promise.all([getAllSpecies(), props.searchParams]);

  // ?pattern=Green+Machine opens the reference with that fly searched for. Capped, because
  // it's user-controllable text that seeds an input — it only ever filters a local array,
  // but there's no reason to accept a megabyte of it.
  const raw = Array.isArray(params.pattern) ? params.pattern[0] : params.pattern;
  const initialPattern = (raw ?? "").slice(0, 80);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Fly Box</h1>
        <p className="max-w-2xl text-muted">
          Rods, reels, lines, leaders and flies — kept entirely apart from the Tackle Box, because
          on Maritime salmon water the two aren&apos;t interchangeable and aren&apos;t even legal
          alternatives.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          This is your gear and the reference tables. If you want to be taught the sport itself,{" "}
          <Link href="/fly-fishing" className="text-accent-dark underline">
            Learn Fly Fishing
          </Link>{" "}
          is the course.
        </p>
      </div>
      <FlySectionClient
        species={species.map((s) => ({ slug: s.slug, common_name: s.common_name }))}
        initialPattern={initialPattern}
      />
    </div>
  );
}
