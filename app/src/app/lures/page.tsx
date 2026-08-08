import { LureMakingClient } from "@/components/LureMakingClient";

export const metadata = {
  title: "Making Lures — Maritime Angler",
  description:
    "Pouring and dressing jigs, and building spinners, spinnerbaits and spoons — safety first, then eleven lessons with a checked video each.",
};

export default function LureMakingPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Making Lures</h1>
        <p className="max-w-2xl text-muted">
          Jigs, spinners, spinnerbaits and spoons. Safety comes first and isn&apos;t a
          formality — melting metal is the one thing in this app that can hurt you. If
          you&apos;d rather not, the spinner and spoon lessons need no heat at all.
        </p>
      </div>
      <LureMakingClient />
    </div>
  );
}
