// Casting diagnosis, and the jargon.
//
// The fault table exists because that's how the question actually arrives. Nobody thinks
// "I have an insufficiently abrupt stop on my back cast" — they think "my line keeps
// landing in a pile" or "why does it crack like a whip?". This maps the symptom you can
// observe to the cause and the fix, in that order.
//
// Nothing here is regional and none of it is contested: these are the standard faults of
// fly casting and they have standard causes. What matters is the routing, not novelty.
//
// The glossary exists because fly fishing has an unusually steep vocabulary barrier and
// most writing about it assumes you're already over the wall. A beginner reading "swing a
// size 10 hitched wet on a floating line with a long butt section" is reading four
// undefined terms in one sentence. Every term here appears somewhere in the app.

export interface CastingFault {
  fault: string;
  cause: string;
  fix: string;
  /** Which stage of the course covers this properly. */
  lesson: string;
}

export const CASTING_FAULTS: CastingFault[] = [
  {
    fault: "A loud crack, like a whip — and sometimes the fly is gone",
    cause:
      "You started the forward cast before the back cast had straightened. The leader is literally breaking the sound barrier, and that's what snaps flies off.",
    fix: "Wait longer on the back cast. Turn your head and watch it straighten before you come forward — the pause gets longer as you carry more line.",
    lesson: "The stroke: acceleration to a stop",
  },
  {
    fault: "The line piles up in a heap in front of you",
    cause:
      "Usually no stop on the forward cast, or the forward stop aimed down at the water instead of out above it. Sometimes a leader that's too heavy or badly tapered to turn over.",
    fix: "Stop the rod crisply at about 10 o'clock and aim the stop at a point roughly head height above the target. If it persists, check the leader — a leader cut back to a stub of heavy mono won't turn over however well you cast.",
    lesson: "The stroke: acceleration to a stop",
  },
  {
    fault: "Wide, open, slow loops that die in any wind",
    cause: "The rod tip travelled in an arc rather than a straight line. Almost always a breaking wrist.",
    fix: "Lock the wrist and drive from the forearm. Tuck the rod butt under your forearm with an elastic band — if the wrist breaks, the butt digs in and tells you instantly.",
    lesson: "Loop shape, and how to read it",
  },
  {
    fault: "Wind knots and tangles in the leader",
    cause:
      "A tailing loop: the top leg of the loop crossed under the bottom because the rod tip dipped and rose mid-stroke. Usually a shove of power applied in the middle of the cast.",
    fix: "Start the stroke slower and accelerate more evenly to the stop. Think smooth build, not punch. Also open your loop slightly if you're fishing two flies.",
    lesson: "Loop shape, and how to read it",
  },
  {
    fault: "The cast just feels heavy and won't go anywhere",
    cause:
      "Slack in the line before you start, so much of the stroke is spent picking it up instead of loading the rod. Or a dirty line that won't shoot.",
    fix: "Start with the rod tip low and the line straight on the water. Clean the line — a dirty line costs more distance than most casting faults.",
    lesson: "The stroke: acceleration to a stop",
  },
  {
    fault: "The fly hits the water behind you on the back cast",
    cause: "The back cast is travelling down rather than back, usually from too much wrist or too wide an arc.",
    fix: "Stop the rod higher on the back cast, around 1 o'clock, and think of throwing the line up and back rather than behind you.",
    lesson: "Grip, stance and what the rod is doing",
  },
  {
    fault: "The fly line lands before the leader, in a straight heap",
    cause: "The leader isn't turning over — too long, too fine at the butt, or badly stepped down.",
    fix: "Check the butt section is roughly two-thirds of the fly line tip's diameter, and that no join steps down more than about 0.002\". Shorten the leader in wind.",
    lesson: "Building and repairing a leader",
  },
  {
    fault: "Can't get past about twelve metres however hard you try",
    cause: "Distance comes from line speed and shooting line, not from force. Almost certainly not hauling, and probably not releasing line at the right moment.",
    fix: "Learn the single haul, then the double. Shoot line on the final forward stop with the rod aimed high. Effort is not the variable.",
    lesson: "The double haul",
  },
  {
    fault: "The fly keeps hitting you, or the rod",
    cause: "Wind coming from your casting-arm side, blowing the line into you.",
    fix: "Cast off the other shoulder, or tilt the rod across your body so the line travels downwind of you. Wear glasses and a hat regardless — this is the fault that causes injuries.",
    lesson: "Wind",
  },
  {
    fault: "Everything falls apart the moment there's a breeze",
    cause: "Loops too wide, line speed too low. Wind punishes both, and it's the cast rather than the wind that's the problem.",
    fix: "Narrow the loop and add line speed with a haul. Aim low into a headwind and high with a tailwind.",
    lesson: "Wind",
  },
  {
    fault: "The fly drags across the current the moment it lands",
    cause: "Not a casting fault at all — the current between you and the fly is pulling the line. This is drag, and it's the central problem of dry fly fishing.",
    fix: "Reach cast so the line lands upstream of the fly, mend as soon as it lands, or move so you aren't casting across conflicting current lanes.",
    lesson: "Drag, and why it beats you",
  },
  {
    fault: "Fish rise to the fly and turn away at the last moment",
    cause:
      "Micro-drag most of the time — the fly moving fractionally differently from the water it's sitting in. Occasionally too heavy a tippet.",
    fix: "Watch a bubble beside your fly; if they separate, you have drag. Fix the drift before you change the fly, then go one size finer on tippet.",
    lesson: "Drag, and why it beats you",
  },
  {
    fault: "Takes felt but no fish hooked",
    cause: "Slack in the system, a blunt hook, or the wrong strike for the method.",
    fix: "Sharpen the hook first — it's cheapest to eliminate. Then check you're using the right response: lift for dries and nymphs, strip-strike for streamers, and nothing at all for a swung fly.",
    lesson: "Slack, and the strip strike",
  },
  {
    fault: "Nymphing all day and catching nothing",
    cause: "Almost always fishing too shallow. If you never touch bottom, you're above the fish.",
    fix: "Add weight or lengthen the drop until you tick bottom occasionally. Then keep adjusting as the water depth changes every few metres.",
    lesson: "Depth and weight",
  },
];

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export interface GlossaryTerm {
  term: string;
  group: "Gear" | "Casting" | "Presentation" | "Insects" | "Fish and water";
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  // --- Gear -----------------------------------------------------------------
  { term: "Action", group: "Gear", definition: "Where a rod bends under load. Fast bends near the tip, slow bends into the butt, medium is between. Not the same as power — a fast rod can be light and a slow rod strong." },
  { term: "Arbor", group: "Gear", definition: "The centre spindle of a reel that the backing is wound onto. A large-arbor reel retrieves more line per turn and puts fewer kinks in the line." },
  { term: "Backing", group: "Gear", definition: "Thin braided line, usually 20 lb Dacron, filling the spool under the fly line. Reserve for a running fish, and padding so the fly line coils wider." },
  { term: "Butt section", group: "Gear", definition: "The thick end of a leader that attaches to the fly line. Should be roughly two-thirds the diameter of the fly line's tip, or the cast won't transfer." },
  { term: "Double taper (DT)", group: "Gear", definition: "A fly line thick in the middle and tapered at both ends. Lands delicately, mends well, and can be reversed when one end wears out." },
  { term: "Ferrule", group: "Gear", definition: "The joint where two rod sections meet. A partly seated ferrule is the most common way to break a fly rod." },
  { term: "Fluorocarbon", group: "Gear", definition: "Leader material that sinks and resists abrasion, with a refractive index closer to water than nylon. Good for nymphs and streamers; not actually invisible." },
  { term: "Intermediate line", group: "Gear", definition: "A line that sinks very slowly, around 1.5 inches per second. Superb in stillwater and salt because it stays straight under the surface chop." },
  { term: "Leader", group: "Gear", definition: "The tapered length of monofilament between the fly line and the fly. Transfers cast energy, and puts something near-invisible next to the fly." },
  { term: "Line weight", group: "Gear", definition: "The number from 1 to 12+ that sizes the whole system. Defined by the weight in grains of the first 30 feet of line, and rod, line and reel should all match." },
  { term: "Nail knot", group: "Gear", definition: "The classic knot joining leader butt to fly line. Lies flat and passes through the guides — largely optional now that most lines have welded loops." },
  { term: "Polyleader", group: "Gear", definition: "A tapered loop-on leader available in floating through fast-sinking. The cheapest way to convert a floating line into a sink-tip." },
  { term: "Shooting line", group: "Gear", definition: "The thin running line behind a weight-forward head — and also the act of releasing loose line so the unrolling loop drags it through the guides." },
  { term: "Sink tip", group: "Gear", definition: "A line with a floating body and a sinking front section. Gets a fly down while leaving most of the line mendable on the surface." },
  { term: "Tippet", group: "Gear", definition: "The fine level section at the end of the leader that the fly is tied to. Sized by the X system, and replaced as it gets shortened by fly changes." },
  { term: "Tippet ring", group: "Gear", definition: "A small steel ring at the end of the leader taper. You replace only the tippet below it, so the leader body lasts a whole season." },
  { term: "Weight-forward (WF)", group: "Gear", definition: "A fly line with its mass concentrated in the first 10 m or so. Casts further and turns over bigger flies — the default choice." },
  { term: "X system", group: "Gear", definition: "How tippet is sized, and it runs backwards: bigger X is thinner. Rule of 11 gives diameter (11 minus X, in thousandths of an inch); rule of 3 gives the size from the hook (hook size ÷ 3)." },

  // --- Casting --------------------------------------------------------------
  { term: "Anchor", group: "Casting", definition: "The length of line left on the water in a roll or spey cast. Its grip on the surface is what loads the rod — lift it and the cast collapses." },
  { term: "Back cast", group: "Casting", definition: "The half of the cast that goes behind you. Half your casting happens here and almost nobody watches it, which is why most faults start here." },
  { term: "Bow and arrow cast", group: "Casting", definition: "Holding the fly by the bend, bending the rod like a bow and releasing. Accurate to about two rod lengths and the only way into some alder tunnels." },
  { term: "Double haul", group: "Casting", definition: "A sharp pull on the line with the free hand on both back and forward casts. Adds line speed for wind and distance without adding rod-hand effort." },
  { term: "False cast", group: "Casting", definition: "A cast you don't let land. Legitimate for extending line, changing direction and drying a dry fly — and for nothing else." },
  { term: "Loading the rod", group: "Casting", definition: "Bending the rod against the weight of the line so it stores energy. Release it with a crisp stop and the stored energy throws the loop." },
  { term: "Loop", group: "Casting", definition: "The rolling U-shape the line makes in the air. Narrow loops cut wind and travel; wide loops are slow and wind-sensitive. Loop shape is the feedback that teaches you to cast." },
  { term: "Reach cast", group: "Casting", definition: "Leaning the rod upstream while the line is still unrolling, so the line lands up-current of the fly. The most useful and least-known cast in dry fly fishing." },
  { term: "Roll cast", group: "Casting", definition: "A cast using the water's grip on the line instead of a back cast. Essential on brushy Maritime rivers where there's no room behind you." },
  { term: "Shoot", group: "Casting", definition: "Releasing loose line on the final forward cast so the unrolling loop pulls it out through the guides. Where distance comes from, at no extra effort." },
  { term: "Stop", group: "Casting", definition: "The abrupt halt of the rod at the end of the stroke. The stop is the cast — the rod straightens, the tip flicks past the line, and a loop forms. No stop, no loop." },
  { term: "Tailing loop", group: "Casting", definition: "When the top leg of the loop crosses below the bottom, causing wind knots. Caused by the rod tip dipping mid-stroke, usually from a shove of power." },
  { term: "Tuck cast", group: "Casting", definition: "Overpowering and stopping high so the leader kicks down and the fly enters the water ahead of the line. Gets a nymph sinking immediately." },

  // --- Presentation ---------------------------------------------------------
  { term: "Dead drift", group: "Presentation", definition: "A fly travelling at exactly the speed of the current, with nothing pulling it. What a real insect does, and the goal of most dry fly and nymph fishing." },
  { term: "Drag", group: "Presentation", definition: "The line or leader towing the fly so it moves differently from the current. The single most common reason a fish refuses a fly." },
  { term: "Dropper", group: "Presentation", definition: "A second fly on a short length of tippet, tied either to the bend of the first hook or to a long tag from a leader knot." },
  { term: "Dry-dropper", group: "Presentation", definition: "A buoyant dry fly with a nymph hung beneath it. The dry catches fish and doubles as a far subtler indicator than a plastic bobber." },
  { term: "Euro nymphing", group: "Presentation", definition: "Tight-line nymphing with heavy flies, a long leader and almost no fly line on the water. The most efficient close-range nymphing method there is." },
  { term: "The hang", group: "Presentation", definition: "The pause when a swung fly finishes its arc and hangs directly below you. A great many fish take right there — waiting is free." },
  { term: "Indicator", group: "Presentation", definition: "Anything on the leader that reveals an unseen take: yarn, a foam bobber, or a buoyant dry fly. Watch its speed relative to nearby bubbles, not just its depth." },
  { term: "Mend", group: "Presentation", definition: "Flipping a belly of line upstream or downstream after the cast has landed, without moving the fly, to buy more drag-free drift." },
  { term: "Micro-drag", group: "Presentation", definition: "Drag too subtle to see — the fly moving a fraction faster or slower than the water it sits in. The usual cause of last-second refusals." },
  { term: "Riffling hitch", group: "Presentation", definition: "Half-hitches around the head of a wet fly so the leader comes off the side and the fly wakes across the surface. Originated at Portland Creek, Newfoundland." },
  { term: "Strip strike", group: "Presentation", definition: "Setting the hook by pulling hard with the line hand while the rod stays low. The correct response for streamers and saltwater — lifting the rod pulls the fly away." },
  { term: "Swing", group: "Presentation", definition: "Casting across the current and letting the flow carry the fly round in an arc. The oldest fly fishing method and still the best on big water." },
  { term: "Turnover", group: "Presentation", definition: "The leader straightening at the end of the cast so the fly lands beyond the line. Without it the fly lands in a heap on top of the leader." },

  // --- Insects --------------------------------------------------------------
  { term: "Dun", group: "Insects", definition: "The freshly hatched mayfly adult, with dull opaque wings held upright like a sail. The classic dry fly target — and it must moult again before it can mate." },
  { term: "Emerger", group: "Insects", definition: "An insect caught in the act of hatching, trapped in the surface film. Helpless, conspicuous, and eaten far more than the adult — which is what most anglers fish." },
  { term: "Match the hatch", group: "Insects", definition: "Choosing a fly resembling what's currently emerging. Size first, silhouette second, colour a distant third — and behaviour above all three." },
  { term: "Nymph", group: "Insects", definition: "The underwater juvenile stage of mayflies and stoneflies — and, loosely, any subsurface fly imitating one." },
  { term: "Pupa", group: "Insects", definition: "The stage between larva and adult in caddis and midges. The rise of a pupa to the surface is short, violent and heavily preyed on." },
  { term: "Spinner", group: "Insects", definition: "The mature mayfly adult after its second moult, with clear glassy wings and long tails. Spinners mate over riffles at dusk and fall spent on the water." },
  { term: "Spinner fall", group: "Insects", definition: "Dead spent mayflies lying flush in the film with wings out flat. Nearly invisible to you, eaten steadily by fish — the usual cause of a dusk rise to nothing you can see." },
  { term: "Terrestrial", group: "Insects", definition: "A land insect that falls in — ant, beetle, hopper, inchworm. There's no hatch to time, just wind and the bank, and they matter most in late summer." },

  // --- Fish and water -------------------------------------------------------
  { term: "Grilse", group: "Fish and water", definition: "An Atlantic salmon returning after a single winter at sea, and so smaller than a multi-sea-winter fish. Defined by fork length in the regulations." },
  { term: "Lie", group: "Fish and water", definition: "A specific spot where a fish holds — behind a boulder, along a seam, under a bank. Salmon lies in particular are consistent year after year." },
  { term: "Parr", group: "Fish and water", definition: "A juvenile salmon living in fresh water, with distinctive vertical bars. Their years of eating river insects may be why an adult salmon still takes a fly." },
  { term: "Redd", group: "Fish and water", definition: "A gravel nest cut by a spawning fish, visible as a pale clean patch. Never wade through one, and don't fish over fish that are on them." },
  { term: "Riffle", group: "Fish and water", definition: "Shallow, broken, fast water over gravel. Oxygen-rich, full of insect life, and its broken surface hides you completely from the fish." },
  { term: "Rise form", group: "Fish and water", definition: "The shape of the disturbance a feeding fish leaves. It tells you what depth it's feeding at, which matters far more than which insect it's eating." },
  { term: "Seam", group: "Fish and water", definition: "The boundary between fast and slow water. Fish sit in the slow side and eat what the fast side delivers — the single most productive feature in any river." },
  { term: "Tail-out", group: "Fish and water", definition: "The shallow downstream end of a pool where it speeds up before the next riffle. Holds hard-feeding, easily spooked fish — fish it before you wade near it." },
];

export const GLOSSARY_GROUPS: GlossaryTerm["group"][] = [
  "Gear",
  "Casting",
  "Presentation",
  "Insects",
  "Fish and water",
];
