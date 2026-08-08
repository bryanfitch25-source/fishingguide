import { TyingClient } from "@/components/TyingClient";

export const metadata = {
  title: "Fly Tying — Maritime Angler",
  description:
    "Learning to tie flies from the first thread wrap to Maritime salmon hairwings and saltwater patterns, with one checked video per lesson.",
};

export default function TyingPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10">
      <div className="mb-4 sm:mb-6 scene-panel rounded-2xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-extrabold text-brand-dark">Fly Tying</h1>
        <p className="max-w-2xl text-muted">
          Thirteen lessons in the order the skills actually stack — thread control, four trout
          flies, deer hair, the Miramichi bugs, and saltwater. Each one names the trap that
          catches people at that stage, and links one video worth watching.
        </p>
      </div>
      <TyingClient />
    </div>
  );
}
