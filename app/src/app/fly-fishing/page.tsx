import { FlyCourseClient } from "@/components/FlyCourseClient";
import { FLY_LESSONS, FLY_STAGES } from "@/lib/fly-course";

// Public, unlike /fly. The Fly Box holds your gear and needs a session; learning to fly
// fish does not, and putting the course behind a login would be the wrong barrier.
export const metadata = {
  title: "Learn Fly Fishing — Maritime Angler",
  description:
    "A full fly fishing course for the Maritimes: gear and rigging, casting, entomology and hatch matching, dry fly, nymph and swung fly presentation, Atlantic salmon, stillwater, and playing and releasing a fish.",
};

export default function FlyFishingPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">
          Learn Fly Fishing
        </h1>
        <p className="max-w-2xl text-muted">
          {FLY_LESSONS.length} lessons across {FLY_STAGES.length} stages, from why the line is
          heavy through to swinging a fly for Atlantic salmon and releasing it well. Nearly every
          lesson has a drill you can go and do.
        </p>
      </div>
      <FlyCourseClient />
    </div>
  );
}
