export const metadata = {
  title: "Knots & Rigging — Maritime Angler",
  description: "A quick reference for the fishing knots and basic rigs that cover most Maritimes shore fishing situations.",
};

interface Knot {
  name: string;
  useCase: string;
  steps: string[];
}

const KNOTS: Knot[] = [
  {
    name: "Improved Clinch Knot",
    useCase: "The all-purpose knot for tying a hook, lure, or swivel directly to monofilament or fluorocarbon leader.",
    steps: [
      "Thread the line through the eye and wrap the tag end around the standing line 5-7 times.",
      "Bring the tag end back through the small loop just above the eye.",
      "Pass it through the large loop you just created.",
      "Wet the knot and pull it snug, then trim the tag end close.",
    ],
  },
  {
    name: "Palomar Knot",
    useCase: "Stronger and more foolproof than the clinch knot, especially with braided line — the standard choice for tying on a hook or lure with braid.",
    steps: [
      "Double about 6 inches of line and pass the loop through the eye.",
      "Tie an overhand knot with the doubled line, letting the hook hang loose in the loop.",
      "Pass the hook/lure through the big loop at the end.",
      "Wet the knot, pull both the standing line and tag end to snug it down, then trim.",
    ],
  },
  {
    name: "Uni Knot",
    useCase: "Very versatile — works for tying to a hook or swivel, and also for joining two lines of similar diameter (as a double uni).",
    steps: [
      "Run the tag end through the eye and back alongside the standing line, forming a loop.",
      "Wrap the tag end around both lines 5-6 times inside the loop.",
      "Moisten and pull the tag end to snug the wraps, then slide the knot down to the eye and pull tight.",
      "Trim the tag end.",
    ],
  },
  {
    name: "Dropper Loop",
    useCase: "Creates a loop mid-line for a bottom rig with multiple hooks (e.g. a hi-lo rig for flounder or mackerel).",
    steps: [
      "Form a loop in the line where you want the dropper.",
      "Twist the loop around the standing line 6-8 times.",
      "Reach through the center twist and pull a bight of line through to form the dropper loop.",
      "Wet and pull both ends of the standing line to lock the twists in place.",
    ],
  },
  {
    name: "Double Surgeon's Knot",
    useCase: "The quickest reliable way to join two lines of different diameter — e.g. attaching a fluorocarbon leader to your main braid.",
    steps: [
      "Lay the two lines side by side, overlapping several inches, running in opposite directions.",
      "Tie an overhand knot with both lines treated as one, but pass the ends through the loop twice instead of once.",
      "Moisten and pull all four ends evenly to snug the knot down.",
      "Trim both tag ends close.",
    ],
  },
  {
    name: "Snell Knot",
    useCase: "Ties a hook so the pull comes straight off the shank — good for bait rigs (e.g. cut bait for striped bass) where you want the hook to rotate and set cleanly.",
    steps: [
      "Pass the line through the hook eye, then lay several inches of tag end alongside the shank.",
      "Wrap the tag end around both the shank and the standing line 5-7 times, working down toward the bend.",
      "Pass the tag end back through the eye from the same side it first entered.",
      "Wet the knot and pull the standing line to snug the wraps down the shank, then trim.",
    ],
  },
];

export default function KnotsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="mb-8 scene-panel rounded-2xl p-5 sm:p-6">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Knots &amp; Rigging</h1>
        <p className="text-muted max-w-2xl">
          Six knots cover almost everything you&apos;ll need for shore fishing in the Maritimes.
          Practice them at home before you need them on the water — every one of these ties
          faster with wet line.
        </p>
      </div>
      <div className="space-y-6">
        {KNOTS.map((k) => (
          <section key={k.name} className="rounded-xl border border-border bg-surface card-lift p-5">
            <h2 className="text-lg font-bold text-brand-dark mb-1">{k.name}</h2>
            <p className="text-sm text-muted mb-3">{k.useCase}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {k.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
