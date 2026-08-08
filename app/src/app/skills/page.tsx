import { SkillsClient } from "@/components/SkillsClient";

export const metadata = {
  title: "Skills — Maritime Angler",
  description:
    "The physical craft: casting a spinning rod and a fly rod, reading rivers and lakes, retrieves and depth control, drag, hooksets, playing and landing, and releasing a fish that lives.",
};

export default function SkillsPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Skills</h1>
        <p className="max-w-2xl text-muted">
          The rest of this app answers what and where. This one answers how — casting,
          reading water, making a lure look alive, and the three minutes between the take and
          the net. Sixteen lessons, each with a drill you can actually go and do.
        </p>
      </div>
      <SkillsClient />
    </div>
  );
}
