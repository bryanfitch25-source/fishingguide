// Learning fly fishing, as a course rather than a reference.
//
// WHY THIS EXISTS SEPARATELY FROM EVERYTHING ELSE
//
// The app already had four things that touch fly fishing, and none of them taught it:
//
//   /fly     — the Fly Box. Your gear, plus lookup tables (line weights, the X chart,
//              knots, 99 patterns, the salmon regulations). Reference, and auth-gated.
//   /tying   — how to *make* flies. Assumes you already fish them.
//   /skills  — general craft. Three of its sixteen lessons are fly casting, sitting
//              among thirteen about spinning gear, which is not where anyone learning
//              to fly fish would think to look.
//   species/ — what lives here and where it sits.
//
// So someone who had never held a fly rod could read all of it and still not know how to
// start. That gap is what this file fills: an ordered path from "I don't understand why
// the line is heavy" through to swinging a fly for salmon and releasing it well.
//
// WHAT THIS DELIBERATELY DOES NOT DO
//
// It does not restate the regulations. SALMON_RULES in lib/fly.ts is the single source
// for those, it carries its own caveat, and duplicating it here would guarantee the two
// drift apart — the dangerous kind of drift, because one of them would be wrong about the
// law. Lessons point at it instead.
//
// It does not repeat the tippet chart or the pattern library either, for the same reason.
// Where a lesson needs them it says so and links.
//
// THE HONESTY CONSTRAINT
//
// Most of this is general craft: a dead drift is a dead drift, a tight loop is thrown by
// the rod stopping, and mayflies have the same life cycle in Nova Scotia as in Montana.
// That is what makes it safe to write at length and in detail.
//
// The regional specifics are where invention creeps in, so they are handled carefully.
// Hatch timing is given as broad windows with the variance stated, not as dates, because
// real emergence swings by weeks with latitude, elevation and the year — see
// lib/entomology.ts, which says so at length. Salmon water-temperature guidance is given
// as the rule of thumb it actually is. Where the honest answer is "keep your own records,
// they'll beat any published calendar", the lesson says that instead of inventing a number.

export type FlyStage =
  | "start"
  | "gear"
  | "rigging"
  | "casting"
  | "bugs"
  | "dry"
  | "nymph"
  | "swing"
  | "salmon"
  | "still"
  | "landing"
  | "season";

export interface FlyStageInfo {
  id: FlyStage;
  title: string;
  blurb: string;
}

export const FLY_STAGES: FlyStageInfo[] = [
  {
    id: "start",
    title: "Start here",
    blurb:
      "What actually makes fly fishing different from every other kind, what to buy first, and the order to learn things in so you don't spend a season frustrated.",
  },
  {
    id: "gear",
    title: "The gear, decoded",
    blurb:
      "Rods, lines, reels, leaders. Fly gear is described in a private language — WF6F, 9' 5wt, 4X — and all of it is learnable in an afternoon.",
  },
  {
    id: "rigging",
    title: "Rigging up",
    blurb:
      "Getting from a rod tube to a fly in the water without a tangle. Then the rigs that catch more than a single fly on a plain leader.",
  },
  {
    id: "casting",
    title: "Casting properly",
    blurb:
      "The one skill you can't fake and can't buy. Everything here is about making the line go where you're looking, in wind, with trees behind you.",
  },
  {
    id: "bugs",
    title: "What the fish is eating",
    blurb:
      "Enough entomology to choose a fly with reasons instead of hope. Four insect groups cover almost everything a Maritime trout eats.",
  },
  {
    id: "dry",
    title: "The dry fly",
    blurb:
      "Fishing on the surface, where you see everything. The whole discipline is a war against drag, and mending is how you win it.",
  },
  {
    id: "nymph",
    title: "Nymphing",
    blurb:
      "Where most of the feeding happens and most of the fish are caught. Less romantic than the dry fly and far more productive.",
  },
  {
    id: "swing",
    title: "Wet fly and streamer",
    blurb:
      "The oldest way to fish a fly and still the best on big water. You cast across, the current does the work, and the take is unmistakable.",
  },
  {
    id: "salmon",
    title: "Atlantic salmon",
    blurb:
      "The Maritime fishery this whole sport is built around here — and the one where almost everything you learned about trout stops applying.",
  },
  {
    id: "still",
    title: "Lakes and ponds",
    blurb:
      "No current to read and nothing to tell you where the fish are. A different problem that rewards a completely different method.",
  },
  {
    id: "landing",
    title: "Take, fight, release",
    blurb:
      "A fly rod fights a fish differently from a spinning rod, and the fish you're most likely to catch here must all go back alive.",
  },
  {
    id: "season",
    title: "The Maritime fly season",
    blurb:
      "What's worth doing when, from ice-out to the last of the autumn salmon, across the three provinces.",
  },
];

export interface FlyLesson {
  stage: FlyStage;
  n: number;
  title: string;
  skill: string;
  steps: string[];
  /** Something to go and do. Reading a lesson is not owning the skill. */
  drill?: string;
  watchOut: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
}

export const FLY_LESSONS: FlyLesson[] = [
  // ===========================================================================
  // Start here
  // ===========================================================================
  {
    stage: "start", n: 1,
    title: "Why the line is heavy",
    skill: "The one idea the whole sport is built on",
    steps: [
      "In every other kind of fishing, the lure is heavy and the line is light. You throw the lure, and the line follows it off the spool. That's why a spinning outfit can throw a 7 g spoon eighty feet and can't throw a bare hook at all.",
      "A fly weighs essentially nothing. A size 14 dry fly is a hook, some thread and a pinch of feather — you cannot throw it any more than you can throw a feather.",
      "So fly fishing inverts the problem: the line is heavy and the fly is weightless. You cast the line, and the fly goes along for the ride, tied to the end of a fine tapered leader.",
      "Everything strange about fly gear follows from that one inversion. The line is thick and plastic-coated because it has to carry mass. The rod is long and springy because it has to load and unload that mass. The reel mostly just stores line, because you don't cast off it. The leader tapers down because a thick line landing on the water would frighten anything.",
      "This is also why fly fishing reaches fish nothing else can: you can present something the size of a mosquito, thirty feet away, landing softly enough not to spook a trout in a foot of clear water.",
    ],
    drill:
      "Before you buy anything, hold a fly rod with line out and just waggle it. Feel the weight of the line bend the rod. That feeling — the rod loading against line weight — is the entire sport, and if you can feel it you already understand more than a written explanation can give you.",
    watchOut:
      "Trying to make the fly go where you want by throwing harder. The fly has no say in anything. Aim the line, and the fly arrives at the end of it.",
    videoId: "90kfmkxaOGs",
    videoTitle: "ORVIS - Fly Casting Lessons - How To Make Your First Cast",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "start", n: 2,
    title: "Your first outfit",
    skill: "Spending money once instead of three times",
    steps: [
      "Buy a 9 foot, 5 weight, medium-action rod with a matching reel and a weight-forward floating line. If you read nothing else on this page, that sentence is the answer, and it has been the answer for about fifty years.",
      "Why 5 weight: it's the one rod that covers brook trout in a small brook, brown trout on a river, and smallmouth on a lake without being wrong anywhere. Lighter is more fun on small fish and useless in wind. Heavier is better for salmon and clumsy for trout.",
      "Why 9 foot: it mends line, it roll casts, and it keeps a back cast off the water. Shorter rods are only better in genuinely overgrown brooks, and you'll know when you're on one.",
      "Why medium action: a fast rod punishes a beginner's timing and flatters an expert's. A medium rod tells you what the line is doing, which is exactly what you need while you're learning to feel it.",
      "Buy the outfit as a matched kit if one is available. A pre-balanced rod, reel and line from a reputable maker in the $200–400 range is genuinely good gear now, and a kit removes every chance of mismatching the three.",
      "Spend the money you saved on a casting lesson instead of on an upgraded rod. An hour with someone who can watch your loop is worth more than the difference between a $250 rod and a $900 one — and it is worth it before you develop faults, not after.",
      "For Atlantic salmon, add an 8 weight later. Don't start there. Learning on a salmon rod is like learning to drive in a lorry.",
    ],
    drill:
      "Before buying, borrow or rent for one day. Nothing on paper tells you whether a rod suits you, and every fly shop and most guides will put a rod in your hand.",
    watchOut:
      "Buying a rod first and a line as an afterthought. The line is what you're actually casting — a good rod with a cheap or wrong-weight line casts badly, and beginners routinely blame themselves for it.",
  },
  {
    stage: "start", n: 3,
    title: "The order to learn this in",
    skill: "Not wasting your first season",
    steps: [
      "Learn to cast on grass, before you ever go fishing. Water adds current, fish, wind and self-consciousness, and none of those teach you to cast. A lawn, a park and a piece of yarn tied to the leader will teach you more in three sessions than a whole season of fishing badly.",
      "Then fish one fly, one method, on one piece of water you can walk to. Depth of experience beats variety at the start — you learn a river by fishing it thirty times, not by fishing thirty rivers once.",
      "Learn a wet fly or a small streamer on the swing before you learn the dry fly. The swing is close to automatic: cast across, let it come round, take two steps. It catches fish while your casting is still ugly, and it teaches you what current does to a line.",
      "Add nymphing next, because that is where most of the fish are.",
      "Add the dry fly after that. It's the most enjoyable and the least forgiving — it demands a drag-free drift, which demands mending, which demands line control you won't have in week one.",
      "Learn entomology last and lightly. Fly selection matters far less than presentation, and beginners routinely change flies when they should have changed where they were standing.",
    ],
    drill:
      "Commit to one piece of water for a full season and keep a notebook: date, water height, temperature, weather, what was hatching, what worked. That notebook will beat any published hatch chart for your water within two seasons.",
    watchOut:
      "The instinct to solve every blank day by buying something. The three things that actually fix a blank day are standing somewhere else, drifting without drag, and fishing deeper — all free.",
  },
  {
    stage: "start", n: 4,
    title: "The four questions behind every cast",
    skill: "A framework to fall back on when nothing is working",
    steps: [
      "Where is the fish? Not 'where are fish generally', but where in this pool, right now. Seams, drop-offs, current cushions, cover — the Reading Water lessons in Skills cover this and it applies identically to fly gear.",
      "What depth is it feeding at? Surface, mid-column or on the bottom. This decides the whole method: dry, wet or nymph. Getting this wrong is the single most common reason for a blank day, and it's usually 'too shallow'.",
      "What is it eating? Only once you've answered the first two. Size first, then shape, then colour — in that order, because that is the order the fish notices them.",
      "How does that food behave? A drifting mayfly nymph is helpless and moves at exactly the speed of the current. An emerging caddis pupa rises. A baitfish flees. Matching the *behaviour* is presentation, and presentation beats pattern almost every time.",
      "When you're blanking, walk back through the four in order. Nine times in ten the answer is question one or two, and nine times in ten the beginner is changing the fly, which is question three.",
    ],
    drill:
      "Next time you blank for an hour, say the four questions out loud and change your answer to only one of them. Change one variable at a time or you'll never know what fixed it.",
    watchOut:
      "Skipping to question three because it's the one with a tangible answer in your fly box. Changing flies feels like doing something. Moving twenty metres upstream usually is doing something.",
    videoId: "mWEgJqDy2UY",
    videoTitle: "Proven Fly Fishing Techniques For Trout | How To",
    videoChannel: "The New Fly Fisher",
  },

  // ===========================================================================
  // The gear, decoded
  // ===========================================================================
  {
    stage: "gear", n: 5,
    title: "Rods: weight, length and action",
    skill: "Reading a rod's markings and knowing what they cost you",
    steps: [
      "Every fly rod is marked with a length and a line weight, usually just above the grip: '9'0\" 5wt' or '905-4' (9 foot, 5 weight, 4 pieces). The weight number is not the rod's weight — it's the weight of line the rod is designed to bend properly.",
      "Line weight runs 1 to 12 and up. It's the master number of the whole system: the rod, the line and, loosely, the reel all carry it, and they should all match. See the Line Weight guide in the Fly Box for what suits which Maritime fish.",
      "Length trades reach against control. Longer rods mend line better, hold line off conflicting currents, roll cast better and keep a back cast higher. Shorter rods are more accurate at close range and survive alder tunnels. Nine feet is standard because it's the best compromise for almost everything.",
      "Action is where the rod bends under load. A fast (tip-flex) rod bends mostly near the tip: it generates high line speed, cuts wind, and demands precise timing. A slow (full-flex) rod bends deep into the butt: forgiving, delicate, lovely at short range, hopeless in a gale. Medium is in between and is what to learn on.",
      "Action is not stiffness and the two get confused constantly. A fast rod can be light and a slow rod can be powerful. Action describes *where* it bends, power describes *how much force* it takes.",
      "Four-piece rods travel and cast indistinguishably from two-piece ones. There is no longer any reason to prefer fewer sections.",
    ],
    drill:
      "If you get the chance, cast a fast and a slow rod back to back with the same line, at 10 m and then at 25 m. The difference at short range will surprise you far more than the difference at distance.",
    watchOut:
      "Buying fast and stiff because it's marketed as advanced. A fast rod overloaded by a beginner's timing throws worse loops than a medium rod would, and there's no way to tell that's the problem from inside it.",
  },
  {
    stage: "gear", n: 6,
    title: "Lines: reading WF6F and why it matters",
    skill: "The single most important and least understood piece of gear",
    steps: [
      "A fly line's code has three parts. 'WF6F' is Weight-Forward, 6 weight, Floating. Once you can read that, the wall of boxes in a shop becomes navigable.",
      "Taper — the first letters. WF (weight-forward) concentrates mass in the first 10 m or so, then runs to thin shooting line: it casts further and turns over bigger flies, and it's what to own. DT (double taper) is symmetrical, lands more delicately, mends beautifully, and can be reversed when one end wears out. L (level) is untapered and only used as cheap shooting line.",
      "Weight — the number, matching your rod. The industry standard is defined by the weight in grains of the first 30 feet, which is why a line's front taper matters so much: two 6 weights can feel very different.",
      "Density — the last letters. F floats. I is intermediate, sinking slowly and invisibly, superb for stillwater and stripers. S sinks, in graded rates. F/S is a floating line with a sinking tip, which gets a fly down while leaving most of the line mendable.",
      "Own a weight-forward floating line first, and own only that for a year. It fishes dries, nymphs and, with a weighted fly or a polyleader, most wet flies. It is the most versatile piece of equipment in the sport.",
      "Lines wear out. A cracked, dirty or sun-baked line will not shoot and will not float, and it is a far more common cause of bad casting than bad technique. Wash it with warm water and mild soap a few times a season and it lasts for years.",
      "Some makers over-weight their lines by half a size to help fast rods load. This is why a rod can feel wrong with a nominally correct line, and it is not your imagination.",
    ],
    drill:
      "Clean your line, then cast it before and after. The difference in how far it shoots is usually large enough to feel immediately — and it's the cheapest performance gain available.",
    watchOut:
      "Saving money on line and spending it on the rod. If your budget is fixed, buy the cheaper rod and the better line every time. The line is what you cast.",
  },
  {
    stage: "gear", n: 7,
    title: "Reels, drag and backing",
    skill: "Knowing when the reel matters and when it doesn't",
    steps: [
      "For trout, a fly reel is mostly a line holder. You cast off coils in your hand, not off the reel, and most trout are landed by stripping line in. A simple click-pawl reel that balances the rod is entirely sufficient.",
      "For anything that runs — Atlantic salmon, striped bass, anything in salt — the reel becomes critical. A big fish will take all your loose line in seconds and then be fighting the reel directly, and a drag that stutters at that moment breaks the tippet.",
      "A sealed disc drag is what you want for salmon and salt: smooth, adjustable, and unaffected by sand and water. Set it light — roughly the point where you can pull line off steadily by hand with firm pressure. Most fish are lost to too much drag, not too little.",
      "Backing is thin braided line — usually 20 lb Dacron — that fills the spool underneath the fly line. It does two jobs: it gives you 50–100 m of reserve for a running fish, and it pads the arbor so the fly line coils in a wider, less kinked loop.",
      "Fill it properly. A fly line that finishes a centimetre below the spool rim retrieves far faster and coils far less than one wound onto a mostly empty spool.",
      "Left or right hand wind is genuinely personal. Choose one and stay with it — swapping mid-season is how you find yourself cranking backwards with a fish on.",
      "Balance matters more than weight. A reel that makes the outfit feel dead in the hand at the grip will make an afternoon's casting tiring in a way you'll blame on the rod.",
    ],
    drill:
      "Set your drag, then pull line off the reel by hand steadily and watch the rod tip. If it stutters or jerks rather than giving line smoothly, the drag is either too tight or the reel isn't up to the job — and better to learn that now than with a salmon on.",
    watchOut:
      "Setting drag by feel at the reel while the rod is straight. Drag is only one part of the resistance a fish feels — the bend of the rod and the line dragging through water add a great deal more. Always set it lighter than seems right.",
  },
  {
    stage: "gear", n: 8,
    title: "Leaders and tippet",
    skill: "The invisible bit that decides whether you get a take",
    steps: [
      "A leader is a tapered length of monofilament between the thick fly line and the fly. It has three jobs: transfer the cast's energy smoothly so the fly turns over, put something nearly invisible next to the fly, and let the fly move naturally.",
      "It's tapered because energy transfer needs it. A fly on a level piece of heavy mono lands in a heap; a fly on a level piece of fine mono can't be turned over at all. The taper carries the cast smoothly from one to the other.",
      "Three parts: the butt (thick, roughly two-thirds the fly line's diameter, about 60% of the leader's length), the mid-section or taper, and the tippet (the fine level bit the fly ties to, about 20–30%).",
      "Length: 9 feet is the default for trout. Go shorter — 7½ feet — in wind or with heavy flies. Go longer, 12 feet and up, in flat clear water where the line landing would spook fish.",
      "Tippet is sized by the X system, which runs backwards: bigger X is thinner. 3X is heavy, 7X is gossamer. Rule of 11 gives the diameter, rule of 3 gives the size from the hook. The full chart lives in the Fly Box and the two rules are worth memorising rather than looking up.",
      "Nylon versus fluorocarbon: nylon is cheaper, floats slightly, stretches more and is kinder on the knot — first choice for dry flies. Fluorocarbon sinks, resists abrasion and is less visible underwater — first choice for nymphs, streamers and anywhere rocky. Neither is invisible, whatever the packaging says.",
      "Tippet degrades. Nylon weakens with UV and age; a spool that has lived on a dashboard for two summers will break at half its rating. Date your spools and bin them after a couple of seasons.",
    ],
    drill:
      "Tie your usual knot in a length of tippet, then pull it apart by hand against a scale or a spring balance. Knowing that your knot actually breaks at, say, 70% of the spool rating changes how you fight fish — and how carefully you tie.",
    watchOut:
      "Adding a new fly to the same tippet all day. Each fly change costs you a few centimetres, and eventually your 9-foot leader is a 6-foot one with a heavy taper and a stub of tippet, which turns over like a brick. Add tippet back, don't just keep cutting.",
    videoId: "gfNzJSBqA6U",
    videoTitle: "ORVIS - Fly Casting Lessons - Getting A Good Turnover",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "gear", n: 9,
    title: "The small things that actually get used",
    skill: "A vest that helps instead of jingling",
    steps: [
      "Nippers on a retractor. You cut line dozens of times a session and teeth are not a plan. A cheap pair with a pin for clearing hook eyes is fine.",
      "Forceps or barbless pliers, also on a retractor. For backing a hook out, and for pinching barbs — which is mandatory on Maritime salmon water and good practice everywhere.",
      "Floatant for dry flies, in paste or gel, applied *before* the fly gets wet. And a desiccant powder to dry and refresh a fly that has been slimed by a fish, which works far better than blowing on it.",
      "Split shot or tungsten putty, to get a nymph down. Weight on the leader is often the difference between a blank and a good day.",
      "Polarised sunglasses, which are safety equipment as much as fishing equipment: they let you see structure and fish through the surface glare, and they stop a size 10 fly reaching your eye. Amber or copper lenses suit Maritime river light.",
      "A net with a soft rubber mesh. Knotted nylon strips slime and fins; rubber doesn't, and doesn't tangle flies either. On catch-and-release water this is a fish-welfare item, not a convenience.",
      "Waders and boots with felt or studded rubber soles. Check the rules before you travel — felt is restricted in some jurisdictions to limit the spread of aquatic invasives, and either way you should be cleaning and drying gear between watersheds.",
      "A small fly box you can open one-handed in wind, and a spool of tippet in your two most-used sizes. Everything else is optional and most of it stays in the car.",
    ],
    drill:
      "Lay out everything you carry and fish a session with only what's listed above. Most people find they never miss the rest, and a light vest makes you willing to walk to better water.",
    watchOut:
      "Buying a fully loaded vest before you know what you fish. Gadgets accumulate, weigh you down, and the heaviest vests belong to the anglers who walk the least.",
  },

  // ===========================================================================
  // Rigging up
  // ===========================================================================
  {
    stage: "rigging", n: 10,
    title: "Rod tube to fly, in order",
    skill: "Setting up without tangles, in the dark, in the rain",
    steps: [
      "Assemble the rod with the guides deliberately misaligned by about 30 degrees, then twist the sections into line as you seat them. That seats the ferrules firmly without over-pushing and makes them far easier to separate later.",
      "Check the ferrules are fully seated. A partly seated ferrule is the most common way to break a fly rod — the joint flexes where it shouldn't, and the tip section snaps or flies off on a cast.",
      "Mount the reel in the reel seat and check the line comes off the spool in the direction you'll retrieve. Tighten it properly; a reel that works loose mid-session is maddening.",
      "Now the important trick: double the end of the fly line into a loop and thread *that* through the guides, not the thin leader tip. If you let go — and you will — the loop catches on a guide instead of the whole lot sliding back out.",
      "Thread every guide including the small one just above the grip, which is the one everyone misses. A missed guide will cost you a fish and you won't know why the line feels wrong.",
      "Attach the leader. If the fly line has a welded loop, use a loop-to-loop and make sure it forms a square, not a girth hitch. If it doesn't, a nail knot. Both are in the Fly Box knots reference.",
      "Tie on tippet if the leader needs it, then the fly, then hook the fly in the keeper ring — not in a guide, which wears a groove in it.",
      "Before you walk to the water, pull two rod-lengths of line off and check the whole thing turns over on one lawn cast. Finding a wind knot or a missed guide on dry land is free; finding it on the first pool is not.",
    ],
    drill:
      "Time yourself setting up from the tube. Get it under three minutes with no tangles, then practise it once in near-dark. Dawn and dusk are the best fishing and the worst time to be learning where the guides are.",
    watchOut:
      "Threading the fine leader tip through the guides. It slips from your fingers, whips back out through every guide, and you start again — usually while a hatch is happening in front of you.",
    videoId: "CCONVJb8-SE",
    videoTitle: "ORVIS - Fly Fishing Lessons - How To Set Up A Fly Rod",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "rigging", n: 11,
    title: "Building and repairing a leader",
    skill: "Not being at the mercy of what the shop has",
    steps: [
      "A knotless tapered leader out of a packet is drawn as a single continuous strand and is what most people use. It works well and turns over beautifully. Its weakness is that once you've cut the tippet back a few times, the taper is gone and you can't restore it without adding sections.",
      "A knotted leader is built from lengths of decreasing diameter joined with blood knots or double surgeon's knots. It's cheaper, endlessly repairable, and lets you tune the taper. Its weakness is that the knots collect weed and algae.",
      "The classic formula is the 60/20/20 rule: 60% of total length in a stiff butt section, 20% in a stepped-down mid-taper, 20% in level tippet. For a 9 foot trout leader that's roughly 5½ feet of butt, 1¾ feet of taper, 1¾ feet of tippet.",
      "A simple, genuinely useful 9-foot 5X build: 36\" of 0.021\" butt, 18\" of 0.017\", 12\" of 0.013\", 8\" of 0.011\", 6\" of 3X, then 20\" of 5X. Step down by no more than about 0.002\" per join or the blood knots slip.",
      "Match the butt to the fly line. Butt diameter around two-thirds of the fly line tip's is the traditional rule, and it's the join where most turnover problems start.",
      "The everyday repair matters more than the theory: when the tippet gets short, tie a new length on rather than tying the fly directly to the thicker section. Two feet of fresh tippet costs pennies and restores the presentation completely.",
      "Add a small tippet ring — a 2 mm steel ring — at the end of the taper if you like. You then only ever replace the tippet below it and the leader body lasts a season. Purists dislike them; fish appear not to notice.",
    ],
    drill:
      "Build one knotted 9-foot leader at the vice from a spool set. Even if you never do it again, you'll understand why a leader turns over or doesn't, and you'll be able to diagnose a leader that's collapsing.",
    watchOut:
      "Stepping down too far in one join. Going straight from a heavy butt to fine tippet gives you a hinge — the cast's energy dies at that point, and the fly lands in a pile no matter how well you cast.",
    videoId: "LAK1jqn0afA",
    videoTitle: "Build Perfect Nymph & Streamer Leaders | Micro Swivels + Tippet Rings",
    videoChannel: "Mad River Outfitters",
  },
  {
    stage: "rigging", n: 12,
    title: "Two flies on one leader",
    skill: "Doubling your information per cast",
    steps: [
      "Fishing two flies lets you test two depths, two sizes or two ideas at once. On a slow day it's the fastest way to find out what they want. Check your provincial regulations first — some waters limit the number of hooks, and fly-only salmon water has its own rules.",
      "The simplest rig is the dropper off the bend: tie the first fly on normally, then tie a length of tippet, 45–60 cm, to the *bend of that hook*, and tie the second fly to the end of it.",
      "The other common rig is a tag dropper: when joining leader sections with a blood knot or surgeon's, leave one tag end long — 15 cm — and tie a fly to it. It stands off the leader more cleanly but is fiddlier to build.",
      "Heavier fly first, lighter behind, when you're nymphing. The point fly is the anchor that gets the rig down, and the dropper rides above it in the column.",
      "The dry-dropper is the most useful version of all: a buoyant dry fly on the point, and a small nymph hung 40–90 cm beneath it. The dry catches fish and doubles as your indicator, which is a much subtler bite detector than a plastic bobber.",
      "Keep the dropper shorter than you think. Long droppers tangle, and a tangled two-fly rig in wind will cost you ten minutes and your temper.",
      "Open your casting loop deliberately with two flies on — a slightly wider, slower stroke. Tight loops and multiple flies are how you tie the whole leader into a bird's nest.",
    ],
    drill:
      "Fish a dry-dropper for one full session with the nymph at about 60 cm. Count how many fish take the dry and how many take the nymph. Almost everyone is startled by the ratio the first time.",
    watchOut:
      "Fishing two flies before your casting is reliable. It's a genuine multiplier of tangles, and a beginner in wind can lose an entire evening to it. Get one fly landing where you look, then add the second.",
  },
  {
    stage: "rigging", n: 13,
    title: "Indicators and getting a nymph down",
    skill: "Seeing a take you can't feel",
    steps: [
      "A nymph drifting near the bottom is invisible and the take is often nothing more than a pause. An indicator is anything on the leader that shows you that pause.",
      "Yarn indicators are the most sensitive and land softest. Foam or plastic bobbers are the easiest to see at distance and in broken water. A buoyant dry fly — the dry-dropper — is the subtlest of all and can catch its own fish.",
      "Set the depth first: indicator to fly should be roughly one and a half to two times the water's depth. That sounds like too much and isn't — the current pushes the nymph downstream of the indicator, so the line runs at an angle rather than straight down.",
      "Add weight until you're occasionally ticking the bottom. If you never touch bottom you're fishing above the fish; if you're snagging constantly you're too heavy. That occasional tick is the target, and it's the single most useful piece of nymphing feedback there is.",
      "Weight goes on the leader 15–25 cm above the fly, or in the fly itself as a bead or wire underbody. A weighted point fly is tidier in the air than split shot, which hinges the cast.",
      "Move the indicator constantly as the water changes. Depth in a river changes every few metres, and a rig set for the pool is wrong in the riffle above it.",
      "Strike at anything. A pause, a twitch, a hesitation, the indicator sliding slightly upstream — lift the rod. A trout can take and eject a nymph in well under a second, and you cannot afford to think about it first.",
    ],
    drill:
      "Fish a run once at your usual depth, then again with the indicator set 50% deeper and one more split shot. If the second pass produces more, you have been fishing too shallow — which most people are, most of the time.",
    watchOut:
      "Treating the indicator as a float that must go under. Most takes never sink it. It hesitates, tips, or slows relative to the current beside it. Watch its speed as much as its depth.",
    videoId: "W1ynUE8DDIk",
    videoTitle: "Indicators and Dry Droppers | Orvis Guide to Fly Fishing",
    videoChannel: "Orvis Guide to Fly Fishing",
  },
  {
    stage: "rigging", n: 14,
    title: "Sink tips and polyleaders",
    skill: "Fishing deep without owning six lines",
    steps: [
      "Sometimes weight on the leader isn't enough — big water, heavy current, cold spring rivers where the fish are hard on the bottom. You need the line itself to sink.",
      "A full sinking line sinks along its whole length. It fishes deep and it's the right tool in a lake, but it's miserable in a river: you can't mend it, you can't easily lift it, and you can't see what it's doing.",
      "A sink-tip line has a floating body and a sinking front section, usually 3–5 m. It gets the fly down while leaving most of the line on the surface where you can mend and control it. This is the practical answer for river work.",
      "A polyleader or versileader is the cheapest way in: a tapered 1.5–3 m loop-on leader available in floating through fast-sinking. It loops straight to your existing floating line's welded loop and converts it in ten seconds. One floating line plus three polyleaders covers most of what you'll meet.",
      "Sink rates are given in inches per second. Slow intermediate is roughly 1.5 ips, fast sinking around 6 ips. Pick by current speed and depth: fast water needs a faster sink rate to reach the same depth in the same distance.",
      "Cast a sinking line differently. Roll cast it to the surface first to lift it, then a single back cast — trying to rip a sunk line straight into a back cast is heavy, ugly, and hard on the rod.",
      "Shorten the tippet with a sink tip: 90–120 cm. A long leader lets a buoyant fly ride up above the sunk tip, which defeats the point of it.",
    ],
    drill:
      "Take one pool you know well and fish it through with a floating line, then again with a sinking polyleader and the same fly. On most Maritime rivers in spring or high water the difference is not subtle.",
    watchOut:
      "Fishing a sink tip on a shallow gravel run. You'll spend the session snagged and lose flies fast. Sink tips are for depth and pace you can't otherwise reach, not a default.",
  },

  // ===========================================================================
  // Casting properly
  // ===========================================================================
  {
    stage: "casting", n: 15,
    title: "Grip, stance and what the rod is doing",
    skill: "Starting from a position that can't fight you",
    steps: [
      "Hold the rod like a hammer with your thumb on top, in line with the blank and pointing at the target. The thumb is your alignment reference and your stopping brake — the whole cast is aimed along it.",
      "Grip lightly. A tight grip transmits every twitch into the rod tip, and the tip is drawing the loop. If your forearm aches after twenty minutes, you're strangling it.",
      "Stand with your rod-side foot slightly back, weight even, body turned about 30 degrees away from the target. That lets you rotate your shoulders to watch the back cast without your feet arguing.",
      "Keep the wrist almost locked. The stroke comes from the forearm and elbow, not the wrist. A breaking wrist is the single most common fault in fly casting and it opens the loop every time — it drops the rod tip too far back, so the tip travels a curve instead of a straight line.",
      "The rod is a spring you load with line weight and unload by stopping. It is not a whip and not a lever. Everything else in this stage is about loading it evenly and stopping it crisply.",
      "The rod tip's path is what draws the loop. Move the tip in a straight line, get a tight loop. Let it dip into an arc, get a wide loop or a tailing tangle. This is the whole geometry of fly casting in one sentence.",
    ],
    drill:
      "Tuck the rod butt up your sleeve or under your forearm with an elastic band, then cast. If your wrist is breaking, the butt digs into your arm and tells you immediately. Ten minutes of this fixes a fault that can otherwise last years.",
    watchOut:
      "The 'ten to two' clock advice taken literally. It's a rough guide for a short cast and it misleads badly as line length grows — the arc must widen with more line out. Think about a straight tip path and a crisp stop, not clock positions.",
    videoId: "oDJJ6W23gHw",
    videoTitle: "ORVIS - Fly Casting Lessons - The Basic Fly Cast",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "casting", n: 16,
    title: "The stroke: acceleration to a stop",
    skill: "The mechanism behind every cast you'll ever make",
    steps: [
      "Start with the rod tip low and the line straight. Any slack at the start is stroke length wasted lifting it, and slack is why a cast that felt fine went nowhere.",
      "Accelerate smoothly and continuously through the stroke, ending faster than you started. Not a constant speed, not a yank at the start — a build. This is called a smoothly accelerating stroke and it is what loads the rod deeply.",
      "Stop. Hard, and definitely. The stop is the cast: the rod straightens, the tip flicks forward past the line, and the line has nowhere to go but over the top into a loop. No stop, no loop.",
      "The loop then unrolls away from you. Wait for it. On the back cast, the line must straighten before you come forward — this pause is the hardest thing for a beginner, and it lengthens as you carry more line.",
      "Come forward with the same smooth acceleration to another crisp stop, aimed slightly above your target so the line straightens in the air and falls.",
      "Lengthen the casting arc as you lengthen the line. Short line, short arc; more line, wider arc and a longer pause. Trying to cast 20 m with the arc that works at 8 m gives you a collapsing cast every time.",
      "Speed doesn't come from muscle, it comes from the stop and from the length of the acceleration. People who cast a long way look relaxed for exactly this reason.",
    ],
    drill:
      "Cast with your eyes closed for ten minutes on grass, listening. A good cast is almost silent; a whoosh means you're pushing air with a wide loop, and a crack means you came forward before the back cast straightened. Your ears diagnose faster than your eyes here.",
    watchOut:
      "Applying power at the beginning of the stroke — the 'shovel'. It throws slack into the line and kills the load. Start slow, finish fast, stop dead.",
    videoId: "3oZXeJ7MPuw",
    videoTitle: "Fly Casting 101: The Pick Up and Lay Down",
    videoChannel: "MidCurrent",
  },
  {
    stage: "casting", n: 17,
    title: "Loop shape, and how to read it",
    skill: "Teaching yourself, without an instructor watching",
    steps: [
      "Turn and watch your back cast. This is the single highest-value habit in fly casting, and almost nobody does it unprompted. Half your cast happens behind you and you're flying blind.",
      "A good loop is narrow — think of a candy cane, about a metre from top leg to bottom. It cuts wind, turns the fly over positively, and travels a long way for the effort put in.",
      "A wide, open loop means the rod tip travelled in an arc rather than a straight line. Usually a breaking wrist, sometimes too wide a casting arc for the line you're carrying. It's slow, wind-sensitive, and dumps the leader in a heap.",
      "A tailing loop — where the top leg crosses under the bottom and you get wind knots — means the tip dipped and rose during the stroke, usually from a shove of power in the middle. Cure it by starting slower and accelerating more evenly.",
      "A cracking noise like a whip is the leader breaking the sound barrier because you started forward before the back cast straightened. It's also how flies snap off, and if you've ever mysteriously lost a fly mid-cast, this was why.",
      "The line piling up at your feet with a good-looking loop in the air usually means you aimed the forward stop down at the water rather than out above it. Aim at a point about head height above your target.",
      "Fix one fault at a time, and fix the back cast first. A bad back cast cannot produce a good forward cast, no matter what you do in front.",
    ],
    drill:
      "Set up side-on to a fence or a hedge about 3 m away and cast along it. It gives you an instant straight-line reference for your loop and for the plane of your stroke, and you'll see a drift or a dip immediately.",
    watchOut:
      "Diagnosing by how the cast felt. Casting feel is a poor guide and lies systematically to beginners — a hard shove feels powerful and produces a worse cast than a relaxed one. Watch the loop; believe the loop.",
  },
  {
    stage: "casting", n: 18,
    title: "False casting and shooting line",
    skill: "Getting distance, and only as much as you need",
    steps: [
      "A false cast is a cast you don't let land — line goes back and forward in the air. It has three legitimate uses: extending line, changing direction, and drying a waterlogged dry fly. Nothing else.",
      "To extend line, release a little from your line hand as the loop unrolls on each stroke. Feed it during the unroll, not during the stop, and let the loop pull it out — this is called shooting line.",
      "Aim the final forward stop high, then release all the loose line at once. The unrolling loop drags it through the guides. That release is what turns a 12 m cast into a 20 m one, and it costs no effort.",
      "Haul with your line hand for line speed — a short sharp pull as the rod accelerates. One haul on the back cast is a single haul; hauls on both is the double haul, and that's a lesson of its own.",
      "Manage the loose line. Coil it in your line hand, or let it fall on clean ground or into a stripping basket. Line that wraps a boot or a rock stops the shoot dead and you'll blame your cast.",
      "Then stop false casting. Every extra false cast is another chance to line a fish, another second the fly isn't fishing, and — with a dry — more risk of drying it into a spray of droplets that lands like buckshot.",
      "Two false casts is plenty for almost everything. Watch a good angler on a small Maritime brook and you'll see one, or none at all.",
    ],
    drill:
      "Set a target at 12 m and reach it in exactly two false casts, ten times running. Then try one. Distance practice is fun; economy practice catches fish.",
    watchOut:
      "False casting over the fish you're trying to catch. The line flickering overhead is far more alarming to a trout than the fly landing. Work your line out to the side, then make one delivery cast to the target.",
    videoId: "f85kwEeuGOg",
    videoTitle: "ORVIS - Fly Casting Lessons - How To Hold Your Line Hand",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "casting", n: 19,
    title: "The roll cast and the anchor",
    skill: "Casting with alders at your back — most of the Maritimes",
    steps: [
      "There is no room for a back cast on most small Maritime rivers. The roll cast solves that: it uses the water's grip on the line instead of a back cast to load the rod.",
      "Draw the rod slowly back and up until the line hangs in a D-shape from the rod tip down to the water behind your shoulder. Slowly, so the line stays on the surface — this is not a back cast and lifting the line off ruins it.",
      "That belly of line lying on the water is the anchor. The water's grip on it is what loads the rod. No anchor, no load, no cast.",
      "Pause with the tip high and slightly outside your shoulder, so the line is off to your side rather than directly overhead.",
      "Punch forward and down to a hard stop, as though hammering a nail at chest height. The loop rolls out along the water and turns the leader over.",
      "The single-handed roll cast tops out at about 12–15 m, which covers most brook and small-river fishing. It's also how you lift a sunk line before a proper back cast.",
      "The switch cast and the snap-T are the same idea with the anchor repositioned, and they let you change direction. Worth learning once the basic roll is automatic.",
    ],
    drill:
      "Stand with your back a metre from a fence and make twenty roll casts. If you can do it there, you can fish every brushy brook in the province.",
    watchOut:
      "Rushing the draw-back. Lift the line off the water behind you and the anchor is gone — the cast collapses in a heap, and it will feel like the rod's fault.",
    videoId: "NSTshveV59Q",
    videoTitle: "Fly Casting Lessons — Making a Roll Cast",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "casting", n: 20,
    title: "The double haul",
    skill: "Line speed for wind, salt and salmon",
    steps: [
      "Learn this only after the basic overhead cast is comfortable. The haul amplifies whatever cast you're making — including a bad one, and rather effectively.",
      "The haul is a short sharp pull on the line with your non-rod hand, timed to the rod's acceleration. It increases line speed without increasing rod-hand effort, and line speed is what beats wind.",
      "As the rod accelerates back, pull sharply down on the line — 20–30 cm, a snap, not a long drag.",
      "Let your line hand drift back up toward the reel as the line straightens behind you. This 'give-back' is what lets you haul again, and forgetting it is the usual reason a double haul stalls out.",
      "As the rod accelerates forward, haul again, then release the line to shoot.",
      "The rhythm is down-up-down-shoot, and it must match the rod's stroke rather than lead it. Hauling early takes the load off the rod instead of adding to it.",
      "This is the cast that makes an 8 weight work into an autumn wind on the Miramichi, and it's essentially mandatory for striped bass off a beach.",
    ],
    drill:
      "Practise the haul on its own with the rod held still and the line in your hand, until the timing is automatic. Then add the rod back. Trying to learn both halves at once is why this cast has a reputation.",
    watchOut:
      "Hauling continuously instead of sharply — a tug-of-war rather than a snap. A long slow pull just drags the rod tip out of position and flattens your loop.",
    videoId: "d8idd4kgXY4",
    videoTitle: "Fly Casting Lessons — The Double Haul",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "casting", n: 21,
    title: "Casts for impossible places",
    skill: "Fishing the spots everyone else walks past",
    steps: [
      "The bow and arrow cast: hold the fly by the bend between finger and thumb, point the rod at the target, draw back so the rod bends like a bow, and release. Accurate to about two rod lengths, and it puts a fly under a alder canopy no other cast can reach.",
      "The steeple cast: an ordinary overhead cast with the back cast thrown steeply upward rather than back, to clear low bushes behind you. It costs distance and delicacy but it beats not casting.",
      "The side cast: the whole stroke rotated to horizontal, keeping the line low. It gets a fly under overhanging branches and it keeps your silhouette down on flat water where fish are spooky.",
      "The tuck cast: overpower the forward stop and stop high, so the leader kicks down and the fly drops nearly vertically, entering the water ahead of the line. It gets a nymph sinking immediately and is genuinely underused.",
      "The pile or puddle cast: aim high and let the leader collapse in loose coils, giving you slack for a drag-free drift straight away. Useful when you're casting downstream to a rising fish.",
      "The reach cast: mid-air, after the forward stop, lean the rod upstream and lay the line up-current of the fly. It buys you several metres of drag-free drift before you have to mend at all, and it's covered properly in the dry fly stage.",
      "The water-load or 'flip' cast: with a short line, use the drag of the line still on the water to load the rod directly into a forward cast. No back cast at all, and it's how you fish a tight brook quickly.",
    ],
    drill:
      "Pick the tightest, brushiest ten metres of brook you know — the bit you always walk past — and fish it for half an hour with only these casts. That water holds fish precisely because everyone walks past it.",
    watchOut:
      "Pointing the rod tip at your own hand on a bow and arrow cast. Hold the fly by the *bend*, keep the point away from your fingers, and release cleanly — this cast has injured a lot of thumbs.",
    videoId: "cRupwXj8CT4",
    videoTitle: "ORVIS - Fly Casting Lessons - Casting A Short Line",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "casting", n: 22,
    title: "Wind",
    skill: "Fishing the Maritimes, where it's usually blowing",
    steps: [
      "Wind is normal here, especially anywhere near the coast, and being unable to cast in it removes most of the good days from your season. It is a technique problem, not a strength problem.",
      "Beat wind with line speed and a tight loop, not with force. A narrow loop presents almost no surface to the wind; a wide one is a sail. Haul rather than shove.",
      "Wind in your face: aim the forward cast low, almost driving the line down at the water, and keep the back cast high. Let the wind straighten the leader for you.",
      "Wind at your back: reverse it. High forward cast, low back cast — and let the wind do most of the delivery. This is usually easier than people expect and gives your longest casts of the day.",
      "Wind from your casting-arm side is the dangerous one: it blows the fly into you. Either cast off your other shoulder, or tilt the rod across your body so the line travels on the downwind side, or turn round and deliver with your back cast.",
      "Wear glasses and a hat, always, and non-negotiably in wind. A size 6 streamer at casting speed does permanent damage to an eye.",
      "Shorten the leader and go slightly heavier on tippet in real wind. A long fine leader will not turn over in a gale, and you'll spend the day untangling instead of fishing.",
    ],
    drill:
      "Deliberately go out and practise on the windiest day of the month, on grass, with yarn. Learning to cast off the wrong shoulder when it doesn't matter means you can do it when it does.",
    watchOut:
      "Casting harder into a headwind. It widens the loop, which catches more wind — the exact opposite of what you need. Narrow and fast, never big and hard.",
  },

  // ===========================================================================
  // What the fish is eating
  // ===========================================================================
  {
    stage: "bugs", n: 23,
    title: "How much entomology you actually need",
    skill: "Choosing a fly for reasons instead of hope",
    steps: [
      "You do not need Latin. You need to tell four groups apart — mayfly, caddis, stonefly, midge — and to judge size. That covers the overwhelming majority of what a Maritime trout eats, and you can learn it in an afternoon on the river.",
      "Size first. Getting the size right and the pattern wrong beats getting the pattern right and the size wrong, by a wide margin. Fish reject on size more readily than on anything else.",
      "Silhouette second. What the fish sees from below is mostly an outline against the sky, plus the dimples the legs and feet make in the surface film. Slim mayfly profile, tent-winged caddis, tiny midge — those shapes are what matter.",
      "Colour third, and it matters far less than fly boxes imply. Light, dark, and roughly the right tone is usually enough. The exception is when fish are locked onto one abundant insect and refusing near-misses.",
      "Behaviour above all three. A drifting nymph moves at exactly the speed of the current; a rising caddis pupa climbs; a spent spinner is dead still. If your fly behaves wrongly, no amount of matching saves it — this is why presentation beats pattern.",
      "The honest shortcut: a Pheasant Tail, a Hare's Ear, an Elk Hair Caddis, an Adams and a Woolly Bugger, in two or three sizes each, will catch fish anywhere in the Maritimes all season. Everything beyond that is refinement.",
      "The Fly Box carries the full pattern library, and the Fly Tying course shows you how to make most of these yourself.",
    ],
    drill:
      "Go to the river with no intention of fishing. Turn stones, hold a net in the current, look at spider webs, and spend an hour just identifying what's there to the group. You'll choose flies differently forever after.",
    watchOut:
      "Buying a fly box organised by species name and thinking that's knowledge. Two dozen patterns you understand beats four hundred you don't, and the fish never learned the names.",
    videoId: "vngTttjfnxg",
    videoTitle: "Fly Fishing Entomology 101: How To Decide Which Fly Pattern To Use",
    videoChannel: "Fly Fish Food",
  },
  {
    stage: "bugs", n: 24,
    title: "Mayflies, caddis, stoneflies, midges",
    skill: "Identifying to the group in about five seconds",
    steps: [
      "Mayfly adult: wings held upright like a small sail, body curved up, two or three long tails. Weak fluttery flight, upward then drifting down. Sits on the water to dry its wings, which is why the classic dry fly works.",
      "Mayfly nymph: three tails (usually), gills along the sides of the abdomen. Uniquely among these four, mayflies have two winged stages — the dull-winged dun and the glassy-winged spinner that follows a moult.",
      "Caddis adult: wings folded in a tent along the back, no tails, long antennae, moth-like fluttering. Leaves the water fast rather than sitting on it — which is why you see adults, see rises, and catch nothing on a dry.",
      "Caddis larva: often in a portable case of sand grains or tiny sticks. Turn a stone and find what look like small moving tubes of gravel — that's caddis, and it's there in every month of the year.",
      "Stonefly nymph: two tails, never three, flattened body, two claws per foot. Needs cold clean fast water, so finding plenty of them tells you something good about the river.",
      "Stonefly emergence is the odd one out: the nymph crawls out onto a rock or the bank and hatches in the open air, not in the surface film. That's why the nymph matters year-round and the dry fly hardly at all.",
      "Midge: very small, slim, humped thorax, no tails, mosquito-like but harmless. Hatches every month of the year including midwinter, and in stillwater it is the single most eaten thing there is.",
    ],
    drill:
      "Learn the tail count. Three tails and gills means mayfly nymph; two tails and a flat body means stonefly nymph. That one distinction, made on a wet stone at the river's edge, does most of the identification work for you.",
    watchOut:
      "Identifying the adults in the air and ignoring the water. Insects flying about may have hatched hours ago or a kilometre upstream. What's drifting *in* the surface is what the fish is eating.",
    videoId: "iVVLZLHux4g",
    videoTitle: "Mayfly, Caddis, Stonefly & Midge Hatches Explained",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "bugs", n: 25,
    title: "Reading the rise",
    skill: "Knowing what depth a fish is feeding at, from the ring it leaves",
    steps: [
      "The rise form is the fish telling you the answer to question two — what depth — and it is far more useful than knowing the species of insect.",
      "A quiet sip, barely a dimple: something helpless in or just under the film. Spinners, midge pupae, emergers. Often the biggest fish in the pool, because quiet is efficient.",
      "Head and tail, a slow porpoise showing head then dorsal then tail: emergers taken just under the surface on a steady cruise. Very catchable — fish an emerger, not a high-riding dry.",
      "A bulge or hump that never breaks the surface: nymphs a few inches down. This is the single most common reason people fish dries over 'rising' fish and catch nothing.",
      "A splashy, noisy rise: something moving and trying to escape, usually caddis. Try a twitched or skated dry, or swing a soft hackle through them.",
      "A tail waving above the surface with the head down: grubbing on the bottom, not looking up at all. Get something small down in front of it.",
      "Sharp swirls with small fish spraying out of the water: a predator on fry. Put on a streamer — this is the one case where matching a hatch is exactly the wrong instinct.",
    ],
    drill:
      "Spend fifteen minutes on an evening rise without casting at all. Just watch one fish and name its rise form. Anglers who do this catch more than anglers who start casting the moment they see a ring.",
    watchOut:
      "Assuming a rising fish is eating off the surface. A large share of 'rises' are fish taking emergers or nymphs inches down, and the fly that would have caught them was never on the surface at all.",
  },

  // ===========================================================================
  // The dry fly
  // ===========================================================================
  {
    stage: "dry", n: 26,
    title: "Drag, and why it beats you",
    skill: "The one thing that decides dry fly fishing",
    steps: [
      "A real insect on the surface is not attached to anything. It drifts at exactly the speed of the water it's sitting in, and it does that perfectly, every time.",
      "Your fly is attached to a leader, a line and a rod. The moment any part of that is sitting in water moving at a different speed, it starts towing the fly. That's drag.",
      "The fish sees it instantly. A fly crossing the current, or leaving the smallest V-shaped wake, is the most obviously wrong thing on the river. Trout that will take a badly chosen pattern drifting perfectly will refuse a perfect pattern that drags.",
      "Micro-drag is the version that ruins most days, because you can't see it. The fly isn't skating — it's just travelling a fraction faster or slower than the bubbles beside it. If your fly is being refused at the last moment, this is almost always why.",
      "Drag happens because current is not uniform. Water is slower at the edges and near the bottom, faster in the middle. Cast across those bands and the fast water grabs your line and pulls the fly.",
      "There are only three ways to beat it: cast so the line lands with slack in the right places, mend the line after it lands, or move so you're not casting across the conflicting currents at all. Position is the one people forget.",
      "Watch the bubbles right next to your fly. If a bubble and your fly stay level with each other, you have a dead drift. If they separate, you don't.",
    ],
    drill:
      "Fish a whole session with a piece of bright yarn instead of a fly and just watch its drift. With nothing at stake and something highly visible on the water, you'll see drag you've been missing for years.",
    watchOut:
      "Blaming the pattern. When you get a refusal — a fish that rises, inspects and turns away — change your drift before you change your fly. The refusal is usually about movement, not appearance.",
    videoId: "tZoGbJbKfrw",
    videoTitle: "Drag Free Dry Fly Drifts | How To",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "dry", n: 27,
    title: "Mending",
    skill: "Repositioning line that's already on the water",
    steps: [
      "A mend is flipping a belly of line upstream or downstream after the cast has landed, without moving the fly. It buys you drift time, and it's the fundamental line-control skill in river fishing.",
      "The usual case: you cast across, the fast middle current grabs the middle of your line and drags a downstream belly into it, which then tows the fly. Mend the belly back upstream and the fly gets several more seconds of free drift.",
      "To mend: lift the rod tip enough to unstick some line from the surface, then draw a half-circle in the air with the tip in the direction you want the line to go, and lower it again. It's a lifting-and-flipping motion, not a sideways drag.",
      "Keep the leader and fly still. If the fly jumps when you mend, you lifted too much line or moved too hard — the mend should move the line only.",
      "Mend upstream when the current between you and the fly is faster than the current your fly is in. Mend downstream in the rarer opposite case, where the fly is in the fast water and your line is in a slow eddy.",
      "Mend early and repeatedly. A small mend before the belly forms is far more effective than a big one afterward, and one long drift may take three or four small mends.",
      "The stack mend — several mends fed in quick succession while feeding slack — extends a drift a long way downstream, and it's the technique for fishing a fly to a rising fish below you.",
    ],
    drill:
      "Cast straight across a current you know is faster in the middle. Do one drift with no mend and watch how quickly the fly starts to skate. Then do the same drift and mend as soon as the line lands. The difference in drift length is the whole lesson.",
    watchOut:
      "Mending so hard the fly is dragged off the fish's lane. A mend that moves the fly is worse than no mend — you've just made the fly do the exact thing you were trying to prevent, only more so.",
    videoId: "9jUVN8W7U1c",
    videoTitle: "How to mend your fly line",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "dry", n: 28,
    title: "The reach cast and slack-line presentation",
    skill: "Getting the drift right before the line lands",
    steps: [
      "Mending fixes drag after the fact. Slack-line casts prevent it, which is better — the first second of drift is often when the fish takes.",
      "The reach cast: make a normal forward cast, and while the line is still unrolling in the air, lean the whole rod upstream and lay the line up-current of the fly. The fly still lands on target, but the line lands upstream of it, and the current has to travel all the way back before it can pull.",
      "The reach cast is the single most useful cast in dry fly fishing and most people never learn it. It routinely doubles a drag-free drift, and it costs nothing.",
      "The pile or puddle cast: aim high and stop abruptly so the leader collapses in loose coils. Slack straight away, at the cost of accuracy — the answer when you're fishing downstream to a riser.",
      "The wiggle cast: waggle the rod tip side to side as the line unrolls, putting S-curves in the line. More slack, spread along the whole line.",
      "The slack-line trade-off is always the same: more slack means a longer drift and a harder hookset, because you have to take up all that slack before the hook moves. Use as much as the drift needs and no more.",
      "Position beats all of it. Moving ten metres so you're casting up a single current lane, rather than across three, removes the problem instead of managing it.",
    ],
    drill:
      "Fish a session in which you are not allowed to mend at all — only reach and slack-line casts. It forces you to solve drag at the moment of delivery, which is where the good anglers solve it.",
    watchOut:
      "Reaching after the line has landed. That's a mend, and a clumsy one. The reach happens in the air, while the loop is still unrolling.",
    videoId: "J0tdJXq9pho",
    videoTitle: "ORVIS - Fly Casting Lessons - The Reach Cast",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "dry", n: 29,
    title: "Approach and position",
    skill: "The half of dry fly fishing that happens before the cast",
    steps: [
      "Trout in current face upstream, into the flow, because that's where food comes from. Their blind spot is directly behind them. Approach from downstream and you can get remarkably close; approach from upstream and you're walking through their field of view.",
      "Move slowly and stay low. Fish detect movement and shape far better than they detect colour. A crouched angler moving slowly in drab clothing is invisible at ten metres; an upright one moving quickly is not.",
      "Mind your shadow and the sun. A shadow crossing a pool empties it instantly. Keep the sun in front of you where you can — it also helps you see into the water.",
      "Wading pushes a pressure wave ahead of you that fish feel through their lateral line long before they see you. Wade slowly, and don't wade at all if you can fish from the bank.",
      "Fish the near water first. Everyone wades in and casts to the far bank, walking straight through the fish that were two metres away in the margin. Cover the close lie before you step into it.",
      "Fish upstream with a dry when you can. You're behind the fish, the drift comes back toward you, and the line is never over the fish's head.",
      "Choose the position that gives you the simplest drift, not the one that gives you the shortest cast. One current lane between you and the fly is worth a lot of extra walking.",
    ],
    drill:
      "Pick a pool with a visible rising fish and spend five minutes deciding where to stand before making a cast. Then do it again from the wrong side deliberately, to see what a difficult drift feels like. The comparison teaches faster than either alone.",
    watchOut:
      "The habit of wading to the middle out of reflex. The middle of the river is where you can be seen from everywhere, and the fish you spook on the way in were the catchable ones.",
  },
  {
    stage: "dry", n: 30,
    title: "The take, and the pause",
    skill: "Not pulling the fly out of the fish's mouth",
    steps: [
      "The commonest dry fly failure is striking too fast. You see the rise, adrenaline arrives, you snatch — and the fly comes back untouched because the fish hadn't closed on it yet.",
      "The old advice is to say 'God save the Queen' before lifting, and something of that length genuinely works. A deliberate beat between seeing the rise and lifting is what you're training.",
      "Better than counting: wait until you see the fish turn down with the fly, or until you feel weight. Set to the *disappearance of the fly*, not to the splash.",
      "Set by lifting the rod smoothly and firmly to about 45 degrees, tightening the line, rather than by a violent snap. A dry fly hook is small and fine and needs very little to set; the tippet is 5X and needs very little to break.",
      "Keep slack under control the whole drift. If you've made a big slack-line cast, you must gather line as it drifts back or your lift will just straighten line rather than move the hook.",
      "For a fish rising downstream of you, lift more gently and slightly sideways rather than straight up — a hard vertical lift pulls the fly directly out of its mouth, back the way it came.",
      "Missing takes on very small flies is normal even for good anglers. If you're missing constantly on size 18s and below, check that the hook point is sharp and consider that you may be striking early rather than late.",
    ],
    drill:
      "For one session, deliberately delay every strike by a full beat longer than feels right. You'll hook more fish, and the feeling of 'too slow' will recalibrate to about right.",
    watchOut:
      "Striking at the rise of a fish that isn't yours. On a good evening several fish rise at once and it's easy to strike at a ring a metre from your fly. Watch your fly, not the water.",
  },

  // ===========================================================================
  // Nymphing
  // ===========================================================================
  {
    stage: "nymph", n: 31,
    title: "Why almost everything happens underwater",
    skill: "Fishing where the fish actually are",
    steps: [
      "A trout in a river takes the overwhelming majority of its food below the surface. The dry fly is the visible, memorable, romantic part of the sport, and it is the minority of the feeding.",
      "That's simple economics for the fish. Drifting nymphs and larvae are available all day, every day, in the current lanes near the bottom, and rising to the surface costs energy and exposes it.",
      "So the default assumption when nothing is rising should be: fish are feeding, they are feeding deep, and I am not down there.",
      "'Deep' means close to the bottom. A nymph drifting a metre above a trout's head is not being eaten, and the difference between fishing at the right depth and 30 cm above it is often the difference between a blank and a good day.",
      "This is also why nymphing feels less satisfying and catches more. You are fishing blind, guided by an indicator and a feel for the bottom rather than by sight.",
      "The two main approaches are indicator nymphing — a strike indicator suspending flies at a set depth, good at range and in deeper water — and tight-line or Euro nymphing, where you keep a short direct connection to heavy flies and feel the take, superb at close range.",
      "Both are just ways of solving the same two problems: getting the fly to the right depth, and knowing when a fish has eaten it.",
    ],
    drill:
      "Fish a run you normally fish with a dry, but nymph it thoroughly first, adding weight until you tick bottom occasionally. Do that on three different days before judging. Most people's catch rate changes sharply.",
    watchOut:
      "Deciding nymphing is boring before you've done it at the right depth. Nymphing at the wrong depth genuinely is boring, because nothing happens. Nymphing at the right depth is relentless.",
  },
  {
    stage: "nymph", n: 32,
    title: "Indicator nymphing",
    skill: "The method that works everywhere and is easiest to learn",
    steps: [
      "Rig: indicator on the leader, weight or a weighted point fly, and one or two nymphs. Set the distance from indicator to fly at roughly one and a half to two times the water depth.",
      "That extra length is not a mistake. The current pushes the flies downstream of the indicator so the leader runs at an angle rather than straight down — a rig set to exactly the water's depth fishes well above the bottom.",
      "Cast up and slightly across, so the flies have time to sink before they reach the water you want to fish. Casting straight across means the fly is only at depth for the last part of the drift.",
      "Mend immediately, then keep mending. The indicator should drift at the same speed as the bubbles beside it — if it's moving faster, the line is towing it and the flies are lifting off the bottom.",
      "Follow the indicator with the rod tip, gathering slack as it comes back toward you so you stay in contact without pulling.",
      "Strike at anything. A pause, a dip, a twitch, the indicator sliding fractionally upstream or just stopping. Most takes are not a dramatic plunge, and a trout can eject a nymph in a fraction of a second.",
      "At the end of the drift, let the flies swing up and hang for a moment before recasting. The rise of the flies imitates an emerging insect and takes a surprising number of fish.",
    ],
    drill:
      "Count your strikes for a session, including the ones that turn out to be rocks. If you're not striking at least a few false alarms per hour, you aren't striking at enough — the cost of a wrong strike is one recast.",
    watchOut:
      "Setting the depth once and leaving it. River depth changes every few metres. A rig set for the pool is fishing a metre off the bottom in the riffle above it, and the adjustment takes ten seconds.",
  },
  {
    stage: "nymph", n: 33,
    title: "Tight-line and Euro nymphing",
    skill: "Feeling the take instead of watching for it",
    steps: [
      "Tight-line nymphing removes the indicator and the slack. You use heavy flies, a long leader, and hold the rod high so almost no fly line touches the water — the connection between rod tip and fly is nearly direct.",
      "Because nothing is floating and nothing is dragging, the fly sinks fast and drifts at true current speed. It is the most efficient way to fish a nymph at close range that anyone has come up with.",
      "Use a sighter — a short section of brightly coloured or two-tone monofilament in the leader — as your visual reference. You watch it for hesitation while you feel for weight.",
      "Lead the flies downstream with the rod tip, keeping a very slight tension. Not dragging them, not letting them go slack: tracking them, at the speed of the current.",
      "The take is often a tick, a stop, or a feeling of the drift going heavy. Set immediately with a short crisp lift — you're already tight, so it takes very little movement.",
      "Its limitation is range. Tight-line nymphing works beautifully out to about a rod length and a half and falls apart beyond it, because you can't keep the line off the water. Indicator nymphing takes over at distance.",
      "It suits pocket water, fast runs and boulder gardens — which is a good description of a lot of Maritime river.",
    ],
    drill:
      "Take one short fast run and fish it tight-line, one step at a time, covering every seam and pocket. It's methodical, close-quarters work, and it will show you fish in water you'd previously have waded straight through.",
    watchOut:
      "Holding tension so tight you're actually towing the flies upstream of the current. The rig must fall at the speed of the water — tension is for contact, not for control.",
    videoId: "k6JYIx1EUoE",
    videoTitle: "Euro Nymphing | How To with George Daniel",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "nymph", n: 34,
    title: "Depth and weight",
    skill: "The single adjustment that fixes most blank days",
    steps: [
      "The target is occasionally ticking the bottom. Not snagging every cast, not never touching it — occasionally. That feedback tells you the fly is in the bottom third of the water column where the fish are.",
      "If you never touch bottom, add weight or lengthen the drop. If you snag every cast, remove weight or shorten it. Adjust in small steps and change one thing at a time.",
      "Weight can be split shot on the leader 15–25 cm above the fly, tungsten putty you can reshape, a beadhead fly, or a heavily wire-weighted body. A weighted fly casts better than split shot, which hinges the leader.",
      "Depth is reached over distance, not instantly. In fast water a fly may need several metres of drift to get down — which is why you cast well upstream of the fish you're targeting.",
      "Faster water needs more weight for the same depth. The same rig that fished perfectly in the tail of a pool is far too light in the run above it.",
      "In a deep slow pool, the opposite problem: too much weight sinks the rig into the bottom and holds it there. Slow water needs a lighter, slower-sinking presentation.",
      "Change weight far more often than you change flies. It is the higher-leverage adjustment by a large margin, and it's the one most anglers fiddle with least.",
    ],
    drill:
      "Fish one run four times: your normal weight, then heavier, then heavier again, then lighter than normal. Note takes for each. You'll usually find one setting doing most of the work, and it's rarely the one you started with.",
    watchOut:
      "Treating snags as failure. A day with no snags at all is a day fishing too shallow. Losing the occasional fly to the bottom is the cost of fishing where the fish are, and it's cheap.",
  },
  {
    stage: "nymph", n: 35,
    title: "Detecting the take",
    skill: "Seeing what isn't obvious",
    steps: [
      "A nymph take rarely looks like a bite. Most often the indicator or sighter simply hesitates for a fraction of a second, or drifts a touch slower than the water beside it.",
      "Learn what a normal drift looks like on that piece of water first. Detection is entirely about noticing a departure from normal, so you need a baseline.",
      "Watch the indicator's speed relative to nearby bubbles or foam, not just its depth. Slowing down is a take; sinking is a take; sliding sideways or upstream is definitely a take.",
      "On a tight line, the signals are a tick through the rod hand, the drift going suddenly heavy, or the sighter straightening or stopping.",
      "Set on everything. There is no penalty worth worrying about — a false strike costs you one recast, while a missed take costs you the fish. Beginners under-strike by a wide margin.",
      "Set with a short crisp lift, not a heave. On a tight line the hook moves immediately. With an indicator you have slack to take up, so the lift is longer but still controlled.",
      "If you're getting takes and not connecting, the usual causes are too much slack, a blunt hook, or striking a beat late. Sharpen the hook first — it's the cheapest thing to eliminate.",
    ],
    drill:
      "Fish a drift while deliberately saying 'now' out loud every time anything looks even slightly odd. It externalises the judgement and speeds up the reflex, and it's how you find out how many signals you were previously talking yourself out of.",
    watchOut:
      "Waiting to be sure. By the time you're sure, the fish has decided the nymph isn't food and spat it out. Strike on suspicion.",
  },

  // ===========================================================================
  // Wet fly and streamer
  // ===========================================================================
  {
    stage: "swing", n: 36,
    title: "The swing: across and down",
    skill: "The oldest fly fishing method, and still one of the best",
    steps: [
      "Cast across the current, or slightly downstream of straight across. Let the fly land, and let the current do everything else.",
      "The current pushes a belly into your line, and that belly pulls the fly across the river in a smooth arc — the swing — until it hangs directly below you.",
      "The fly is moving across the current the whole time, which is exactly what a fleeing baitfish or a diving egg-laying caddis does. This is why it works, and why it works on fish that have never seen a mayfly.",
      "Then take two steps downstream and cast again. Two steps, every cast. That methodical progression covers a pool completely and is the whole discipline of swung-fly fishing.",
      "The take is unmistakable and usually happens as the fly comes round into the slower water near your bank. Often the fish hooks itself against the tension of the swing.",
      "Do not strike. This is the hardest habit to break coming from any other method: on a swung fly you let the fish turn and take the line, then simply lift into it. Striking pulls the fly straight out of a fish that's moving away from you.",
      "It is also the most beginner-friendly way to catch fish on a fly rod. The casting can be ordinary, the current does the presentation, and it fishes while you learn.",
    ],
    drill:
      "Fish an entire pool with two steps between every cast and no exceptions. Resist the urge to re-cast to a spot. Covering water systematically is the method, and the discipline of it is what beginners skip.",
    watchOut:
      "Standing in one place and casting repeatedly. The swing works because it shows the fly to new fish continually. A pool fished from one spot for an hour is a pool you've shown one fly to one lie, sixty times.",
    videoId: "EdaU1bWaNTw",
    videoTitle: "How To Nymph Fish & Swing Wet Flies For Trout",
    videoChannel: "Orvis Guide to Fly Fishing",
  },
  {
    stage: "swing", n: 37,
    title: "Controlling the speed of the swing",
    skill: "The dial that turns a mediocre swing into a good one",
    steps: [
      "Swing speed is the main variable you control, and it's set by the angle of your cast and by mending — not by anything you do with the fly.",
      "Cast at a shallow angle downstream and the current catches the line straight away: fast swing. Cast squarer across, or upstream of square, and the fly sinks and swings slower.",
      "An upstream mend as soon as the line lands slows the swing and lets the fly sink. A downstream mend speeds it up. This is the same skill as dry fly mending, used for the opposite purpose.",
      "Cold water wants a slow swing. A fish in 6 °C water will not chase, and a fly moving quickly past its nose is simply not worth the energy. Slow it down and get it deeper.",
      "Warm water and active fish want a faster swing, sometimes with a twitch or a strip added. In summer a fly that's moving with purpose draws fish from further.",
      "Watch where the fly is by watching the angle of your line. You should always know roughly how deep and how fast it's travelling — swinging blind is the difference between doing this and merely doing it.",
      "The hang: when the fly finishes its swing and hangs directly below you, wait. Count to ten. A remarkable number of fish follow the fly all the way round and take it when it stops.",
    ],
    drill:
      "Swing one run three times: once with no mend, once with a big upstream mend, once with two mends. The fly follows a visibly different path each time. Being able to choose that path deliberately is the skill.",
    watchOut:
      "Letting the line get downstream of the fly. Once the belly is below the fly, the current drags it across at speed and you've lost all control of both depth and pace.",
  },
  {
    stage: "swing", n: 38,
    title: "Stripping a streamer",
    skill: "Making a fly behave like something worth chasing",
    steps: [
      "A streamer imitates a fish, and fish that are being eaten do a specific thing: they flee in bursts, and they pause. The pause is where you get bitten.",
      "The basic retrieve is strip, strip, pause. Vary the length and speed of the strips and, more importantly, vary the length of the pause. On a slow day, make the pause much longer than feels right.",
      "Strip with your line hand while the rod tip stays low and pointed down the line. A low tip keeps you in direct contact so the take registers immediately and the hookset is short.",
      "Cast across and down and combine strips with the swing — the fly moves across the current *and* darts. That combination is deadly for big trout and for striped bass.",
      "For a fish that follows without taking, speed up rather than slowing down. A prey item that notices it's being hunted accelerates; one that stops looks wrong. Speeding up converts followers surprisingly often.",
      "Strip-strike rather than lifting the rod. When you feel the take, pull hard with the line hand while the rod stays low. Lifting the rod on a streamer take just pulls the fly away from a fish that has its head turned.",
      "Fish structure hard: undercut banks, log jams, drop-offs, the deep side of a bend. A streamer is a searching tool and big fish live next to cover.",
    ],
    drill:
      "Fish a session with a streamer and nothing else, and deliberately fish the last hour of light. Big trout feed on fish at dusk, and one session of this teaches you more about where the big ones live than a month of nymphing.",
    watchOut:
      "Retrieving all the way to your feet and then lifting off. Fish follow streamers a long way and commit at the last second — finish every retrieve with a slow figure-of-eight and a pause right at the rod tip.",
  },
  {
    stage: "swing", n: 39,
    title: "The wet fly team and the soft hackle",
    skill: "An old method that still out-fishes most modern ones",
    steps: [
      "A soft hackle is a bare-bones wet fly: a slim body and a sparse turn of game-bird hackle that pulses and breathes in the current. It suggests an emerging caddis or mayfly without imitating anything exactly.",
      "Swung on a floating line, it fishes exactly in the zone where emergers are most vulnerable — the top foot of water. That's why it takes fish during a hatch when a dry fly is being refused.",
      "The traditional rig is a team of two or three, spaced along the leader on droppers, covering different depths and sizes in one pass. Check local regulations on hook numbers before you fish more than one.",
      "Fish them across and down like any swung fly, but lead them a little with the rod and lift the tip at the end of the swing so they rise through the column. That rise imitates an ascending pupa and is often when the take comes.",
      "Add a gentle twitch during the swing to make the hackle pulse. Subtle — you're animating a hackle, not stripping a streamer.",
      "This is the method for the awkward moment when fish are bulging and boiling but refusing dries. The bulge means they're taking emergers inches down, and that's exactly where a swung soft hackle lives.",
      "Sizes 12–16 in partridge and orange, partridge and yellow, or a plain hare's ear soft hackle will cover most of a Maritime season.",
    ],
    drill:
      "The next time you meet a rise you can't crack with a dry, put on a single soft hackle and swing it through the rising fish. Do it before you start changing dry flies. It solves that situation more often than any other single change.",
    watchOut:
      "Fishing them dead-drift like a nymph. The movement — the swing, the pulse, the lift — is the whole point of a soft hackle. Dead-drifted it's just a scruffy nymph.",
  },

  // ===========================================================================
  // Atlantic salmon
  // ===========================================================================
  {
    stage: "salmon", n: 40,
    title: "A fish that isn't feeding",
    skill: "Understanding why everything you learned about trout stops here",
    steps: [
      "An Atlantic salmon returning from the sea to spawn essentially stops feeding in fresh water. It lives on fat reserves built at sea, and its digestive system shuts down for the duration of the run.",
      "So every idea underneath trout fishing — match the hatch, find what they're eating, imitate it — has no purchase at all. There is nothing to match.",
      "A salmon takes a fly anyway, and nobody can tell you with certainty why. The usual explanations are aggression at an intruder, territorial irritation, curiosity, or a reflex left over from its years as a parr in that same river eating exactly these insects. Any of them may be right; none is proven.",
      "The practical consequence is that presentation and water covered matter enormously, and pattern matters much less than salmon anglers' fly boxes suggest. A well-swung fly of almost any reasonable pattern beats a badly swung perfect one.",
      "The second consequence is that it's a numbers game about *fish shown*, not fish fooled. You are trying to put a fly in front of as many salmon as possible, at the right depth and speed, and waiting for one to be in the mood.",
      "This is why the two-steps-and-cast discipline of the swing is not just a technique here — it's the whole approach. Cover water, methodically, repeatedly.",
      "It's also why salmon fishing rewards patience in a way trout fishing doesn't. Long blank spells are normal and are not evidence you're doing it wrong.",
    ],
    drill:
      "Fish a known holding pool through completely — head to tail, two steps a cast — without changing fly. Then change to something markedly different in size and do it again. Learning to trust the water-covering over the fly-changing is the mental shift this fishery demands.",
    watchOut:
      "Importing trout instincts wholesale. Anglers new to salmon change flies constantly because that's what works on trout. The fish that takes will take because you put a fly over it at the right moment, not because you found the magic pattern.",
    videoId: "amUEmRL7oYc",
    videoTitle: "Atlantic Salmon Fishing Basics | How To",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "salmon", n: 41,
    title: "The pool, and the etiquette",
    skill: "The social rules — which here are as important as the casting",
    steps: [
      "Salmon pools are fished in rotation, and the convention is old, universal and taken seriously. Break it and you'll be corrected, sometimes sharply.",
      "Enter at the head of the pool, behind anyone already fishing. Make your cast, take two steps down, cast again. Keep moving.",
      "Never drop in below someone who is fishing down through. You'd be fishing water they're working toward, which is the fundamental discourtesy on a salmon river.",
      "If someone is playing a fish, reel in and give them room. Offer to help if they're alone and it looks like they need it — a hand with a net is normal and welcome.",
      "When you reach the tail, get out, walk back up the bank well away from the water, and rejoin at the head behind whoever is now there. Don't wade back up through the pool you just fished.",
      "If a pool is busy, the rotation is what makes it work — everyone gets the whole pool, in turn. An angler who parks in the sweet spot and won't move is the one thing that reliably causes trouble.",
      "On rivers with Guide Required Waters or beat systems, there are additional rules and they're legal rather than social. Check the current provincial guide and DFO notice before you go — see the salmon regulations in the Fly Box.",
    ],
    drill:
      "The first time on a new salmon river, fish behind someone experienced and simply copy their rhythm — where they enter, how far they step, when they get out. Twenty minutes of that teaches the local convention better than any written description.",
    watchOut:
      "Standing still in the best-looking lie. It's the single most common newcomer's mistake, it stops the rotation for everyone behind you, and it doesn't even work — a salmon that hasn't taken in twenty casts isn't going to.",
  },
  {
    stage: "salmon", n: 42,
    title: "Water temperature, fly size and depth",
    skill: "The rule of thumb that decides what you tie on",
    steps: [
      "The most useful single variable in salmon fishing is water temperature, because it governs how far and how fast a salmon will move to a fly.",
      "In cold water — roughly below 10 °C — a salmon will not move far. Fish bigger flies, deeper and slower. Sunk tips, larger tube flies or heavier irons, and a slow swing that brings the fly close to the fish rather than expecting it to travel.",
      "As the water warms into the middle range, come up in the column and down in size. A floating line and a medium-sized wet fly swung at moderate pace is the classic summer presentation.",
      "In warm water — roughly above 15–16 °C — go small and fish near or on the surface, faster. Small flies, a riffled hitch, or a dry. A salmon in warm water is more willing to move up but less willing to move far sideways.",
      "Treat those numbers as a starting frame rather than thresholds. Rivers, runs and individual fish vary, and every experienced salmon angler has a story that contradicts the rule.",
      "Water height matters alongside temperature. High coloured water calls for something larger and more visible; low clear water calls for smaller, finer and a longer leader.",
      "In genuinely hot, low water, the ethical answer is often to stop. Salmon suffer badly in warm water and catch-and-release mortality rises sharply. Provinces and DFO do impose warm-water closures and pool protocols — check the current notices, and be willing to leave the river before you're told to.",
    ],
    drill:
      "Carry a cheap stream thermometer and take the water temperature every trip, writing it down with what worked. Within a season you'll have your own version of this rule, calibrated to your river, and it will be better than mine.",
    watchOut:
      "Fishing a summer fly and a floating line in cold spring water because that's what's on the reel. Early-season fish sitting deep in 6 °C water will let a small surface fly pass all day without moving.",
  },
  {
    stage: "salmon", n: 43,
    title: "The classic wet fly swing for salmon",
    skill: "The presentation that catches most Maritime salmon",
    steps: [
      "Start at the head of the pool. Cast across and slightly down — the exact angle sets your swing speed, and squarer across means slower and deeper.",
      "Mend upstream immediately if the current between you and the fly is fast, so the fly swings at a controlled pace rather than being dragged.",
      "Let the fly swing across the current under light tension, following it round with the rod tip. You want it broadside to the flow for as much of the arc as possible — that's the profile a salmon sees best.",
      "Let it hang directly below you for several seconds at the end of the swing. A large share of salmon take right there, at the hang, and anglers who rush the recast never know it.",
      "Two steps down. Cast again. Repeat until you reach the tail of the pool. Consistency of coverage is the method.",
      "When a salmon takes, do nothing. Let the line come tight, let the fish turn away with the fly, and only then lift into it smoothly. A salmon usually takes the fly moving away from you and hooks itself in the corner of the jaw.",
      "The hardest discipline in the sport is not striking at the pull of a salmon. Some anglers deliberately hold a loop of slack line in their hand and let the fish take it before tightening.",
    ],
    drill:
      "Practise the no-strike response somewhere it doesn't cost you a salmon — on trout, swinging a wet fly. Train yourself to let the line come tight before lifting, until it's automatic rather than a decision made in adrenaline.",
    watchOut:
      "Trout-striking a salmon take. A hard fast lift pulls the fly straight out of the mouth of a fish that's turning away, and it's the commonest way a first salmon is lost.",
    videoId: "hCpkBpV0lEQ",
    videoTitle: "Miramichi Atlantic Salmon | New Brunswick",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "salmon", n: 44,
    title: "Bombers, bugs and the dry fly",
    skill: "The most exciting way this fishery happens",
    steps: [
      "Salmon will take a dry fly, and in the Maritimes this is a genuine mainstream method rather than a curiosity — the Miramichi in particular has a deep tradition of it.",
      "The Bomber is the classic: a big buoyant cigar of spun and clipped deer hair with a palmered hackle, fished on the surface. Buck Bugs are the smaller, sparser relative. Both are in the pattern library, and the Fly Tying course covers spinning deer hair.",
      "Fish it dead-drift or with a deliberate skate across the current. Both work, and on a given day one will usually be clearly better — try each before deciding.",
      "It works best in warmer water and low clear conditions, when fish are willing to come up. In cold water a dry is largely wasted effort.",
      "Cast to a known lie and let the fly work over it repeatedly. Unlike trout dry fly fishing, repeated presentations to the same fish are normal and often necessary — a salmon may look several times before committing.",
      "The take is spectacular and slow. A salmon often rises deliberately, and the fly may be refused at the last instant or taken with complete confidence.",
      "Wait even longer than for a trout. Watch the fish take the fly and turn down with it before you lift. Lifting at the rise is the classic way to miss a salmon on a dry, and everyone does it at least once.",
    ],
    drill:
      "On a warm summer evening, fish a Bomber over a lie you know holds a fish, and commit to twenty presentations before changing anything. Salmon dry fly fishing rewards persistence over variety more than any other fishing there is.",
    watchOut:
      "Striking at the rise. The fish has to close its mouth and turn down before there's anything to hook. A visible rise plus a fast reflex equals a fly pulled out of an open mouth.",
    videoId: "BsUIp93BorA",
    videoTitle: "Bomber & Bug Patterns for Trout & Atlantic Salmon",
    videoChannel: "The New Fly Fisher",
  },
  {
    stage: "salmon", n: 45,
    title: "The riffling hitch",
    skill: "A local trick with a genuinely Atlantic-Canadian history",
    steps: [
      "The riffling hitch — also called the Portland Creek hitch — makes a wet fly skim and wake across the surface instead of swinging beneath it.",
      "Its origin is Portland Creek in Newfoundland. British naval officers left flies behind whose gut eye whippings had rotted; local anglers salvaged them by attaching the leader with half-hitches around the head of the fly. That changed how the fly rode, and it turned out to work startlingly well. Lee Wulff encountered it there and popularised it far beyond the island.",
      "To tie it: attach the fly normally, then take two half-hitches around the head of the fly behind the eye, and have the leader come off the side of the fly rather than the front.",
      "Which side matters: the leader should come off the side facing you — the side toward your bank — so that the current pressure makes the fly swim across the flow with its head up, throwing a small V-shaped wake.",
      "Fish it like a normal swing but on a tight floating line and a slightly faster pace. You want a visible wake, which is the whole point: the fish is responding to the surface disturbance.",
      "It excels in warm, low water, and on bright days when fish won't move for a sunk fly. It also lets you fish a pool a second time in a completely different way after the swing has been through it.",
      "The take is visual, and often a slashing boil at the wake. Same rule as ever: do not strike. Let it come tight.",
    ],
    drill:
      "Hitch a fly and swing it in front of you where you can see it clearly, adjusting which side the leader exits until you get a clean V-wake. Two minutes of watching teaches the geometry better than any description.",
    watchOut:
      "Hitching on the wrong side. A hitch with the leader coming off the far side makes the fly skid awkwardly and roll rather than wake. If it isn't leaving a clean V, undo it and hitch the other way.",
    videoId: "ueSbad-jy2I",
    videoTitle: "How To Fish The Hitch For Salmon",
    videoChannel: "Aardvark McLeod Fly Fishing",
  },
  {
    stage: "salmon", n: 46,
    title: "Playing and releasing a salmon",
    skill: "Getting it back in the water alive — which here is the law",
    steps: [
      "Every Atlantic salmon must be released in this region. That isn't a preference, it's the regulation, and the fish's survival is the actual measure of whether you did this well. See the salmon rules in the Fly Box.",
      "Get the fish on the reel quickly. Loose coils of line around your feet, a rod, or a rock is how a first salmon ends. Once it's on the reel, the drag and the rod do the work.",
      "Use side pressure, not a high rod. Pulling sideways — and specifically pulling in the opposite direction to the way the fish is heading — unbalances it and tires it far faster than lifting straight up.",
      "Play it hard and land it fast. A long romantic fight is the worst thing for the fish: lactic acid builds, and exhaustion is what kills released salmon hours or days later. Aim to be firm rather than gentle.",
      "Keep it in the water. Do not beach it on gravel, do not lift it out for a photograph by the tail or the gills. Bring it into shallow water, keep it upright and submerged, and remove the barbless hook with forceps.",
      "If you want a photo, get the camera ready first, keep the fish in the water, and lift its head clear for no more than a couple of seconds — or better, photograph it in the water. A fish out of water is on a clock.",
      "Revive it facing into the current until it holds itself upright and swims off under its own power. Don't push it back and forth — that forces water the wrong way through the gills. Just hold it steady in flow until it goes.",
      "In warm water, everything above matters more and the honest answer may be to stop fishing. Warm-water mortality after release is real and substantial.",
    ],
    drill:
      "Practise the whole release sequence on trout, including having the forceps in your hand before the fish is at your feet and keeping it submerged throughout. The routine needs to be automatic before you're doing it with shaking hands over your first salmon.",
    watchOut:
      "The photograph. More released fish are killed by a slow, fumbling, out-of-water photo session than by the fight. Decide before you hook it whether the picture is worth it, and make it fast if it is.",
  },

  // ===========================================================================
  // Lakes and ponds
  // ===========================================================================
  {
    stage: "still", n: 47,
    title: "Water with no current to read",
    skill: "Finding fish when nothing tells you where they are",
    steps: [
      "A river hands you the answer: seams, pockets, drop-offs, current cushions. A lake removes all of it. The surface tells you almost nothing and the fish can be anywhere in three dimensions.",
      "So you replace current-reading with structure-reading. Drop-offs where shallow shelf meets deep water, weed bed edges, points, submerged timber, rocky shorelines, and the mouths of inflowing brooks.",
      "Inflows and outflows are the highest-percentage spots in most Maritime ponds. Moving water brings food and oxygen and is cooler in summer, and fish stack there.",
      "The wind is your friend and most people get it backwards. Wind pushes surface food and plankton downwind, and fish follow it — the choppy, awkward, downwind shore is usually the productive one, not the sheltered bank.",
      "Depth changes with season. Fish are shallow shortly after ice-out when the shallows warm first, they go deep in high summer to find cool oxygenated water, and they come shallow again in autumn.",
      "Cover water until you find them, then work that depth and area properly. Stillwater fishing is searching, then repeating.",
      "The Depth Charts section and your own Spots list are worth using here — a lake's contours are exactly the information a river gives you for free.",
    ],
    drill:
      "Take one pond and fish a transect: cast a countdown retrieve at 5 seconds, then 10, 15, 20, 30, from the same spot. When you find the depth that produces, stay at it. That systematic search is the whole stillwater method.",
    watchOut:
      "Fishing the pretty sheltered bank because it's comfortable. The wind-blown shore with a chop on it is where the food is going, and it is nearly always the better water.",
  },
  {
    stage: "still", n: 48,
    title: "Countdown and retrieve",
    skill: "Fishing a specific depth on purpose",
    steps: [
      "The countdown is the fundamental stillwater technique: cast, then count while the fly sinks before you start retrieving. It converts depth into a number you can repeat.",
      "Count in seconds, consistently. When you get a take at 15, cast again and count 15. You've now found the fish's depth and can fish it deliberately instead of by luck.",
      "An intermediate line makes this much easier than a floater. It sinks slowly and evenly, stays straight, and keeps you in contact with the fly — for stillwater it's arguably more useful than a floating line.",
      "Retrieve styles, roughly slowest to fastest: the figure-of-eight, gathering line continuously in your palm for a slow steady crawl; short slow pulls; long steady pulls; fast strips.",
      "Vary the retrieve every cast until something works, then repeat exactly what worked. Fish in stillwater are often very specific about speed, far more than about pattern.",
      "The figure-of-eight is the most underused and most productive retrieve in stillwater fishing. It's slow, it never stops, and it imitates a chironomid or a small nymph moving almost imperceptibly.",
      "Takes on a slow retrieve are often just a sense of weight or a gentle draw. Tighten steadily rather than striking hard, especially with fine tippet.",
    ],
    drill:
      "Fish one fly for a whole session and change only the count and the retrieve. Most people discover that speed and depth are doing far more work than pattern ever did.",
    watchOut:
      "Retrieving at the same speed all day without noticing. Everyone has a default cadence and settles into it within minutes. Deliberately break yours — the fish that ignored six casts often takes on the seventh when you change the rhythm.",
  },
  {
    stage: "still", n: 49,
    title: "Chironomids, leeches and the stillwater staples",
    skill: "Three flies that catch fish in any lake",
    steps: [
      "Chironomid pupae are the most abundant food item in most stillwaters, and imitating them is an entire discipline. The pupa hangs vertically in the surface film waiting to hatch, unable to escape, and fish cruise along the film eating them steadily.",
      "Fish a chironomid pupa suspended under an indicator, dead still, close to the bottom or just under the film depending on where the fish are. 'Dead still' is not an exaggeration — movement makes it wrong.",
      "This is the least active-feeling fishing in the sport and one of the most effective. Watching a static indicator for an hour requires a temperament, and it catches large trout.",
      "A leech pattern — black, olive or maroon, on a size 8–12 — fished slow and deep on an intermediate line is the most reliable searching fly in stillwater. It needs no hatch and works from ice-out to freeze-up.",
      "A Woolly Bugger does the same job and imitates leeches, baitfish, dragonfly nymphs and things with no name. If you take one fly to a lake you've never fished, take this.",
      "Damselfly and dragonfly nymphs matter in weedy water in summer. Damsel nymphs swim to shore to hatch with a distinctive wiggling motion — a slow, steady, twitchy retrieve near weed beds imitates it.",
      "Look for cruising fish along the margins in the evening, and cast ahead of their line of travel rather than at them. A fly landing on a cruising trout spooks it; a fly waiting on its path gets eaten.",
    ],
    drill:
      "Fish a static chironomid under an indicator for one full hour without giving in and stripping it. It's a genuine test of discipline and it converts a lot of sceptics.",
    watchOut:
      "Moving a chironomid because nothing is happening. The stillness is the imitation. If you can't bear it, change depth rather than adding movement.",
  },

  // ===========================================================================
  // Take, fight, release
  // ===========================================================================
  {
    stage: "landing", n: 50,
    title: "Slack, and the strip strike",
    skill: "Converting a take into a hooked fish",
    steps: [
      "A fly rod has a problem no spinning rod has: there is usually loose line between your hand and the reel, and that slack must be gone before the hook can move.",
      "So slack management is a constant background job. Keep the line pinched under a finger of your rod hand and gather loose line as the fly comes back to you.",
      "For dries and nymphs, set by lifting the rod smoothly and firmly to about 45 degrees — enough to come tight and drive a small hook home, not a violent snatch that breaks 5X tippet.",
      "For streamers and anything in salt, strip-strike instead: keep the rod low and pointed at the fly, and pull hard with the line hand. If the fish doesn't stay on, the fly is still in the strike zone and it may come back.",
      "Lifting the rod on a streamer take is the classic error. It pulls the fly up and away from a fish that has turned, and it gives you no power at all because the rod is already bent.",
      "For swung flies — wet fly and salmon — don't strike at all. Let the fish turn and take the line tight, then simply lift. The fish hooks itself against the tension of the swing.",
      "Three different responses for three situations, and the wrong one costs you the fish. Know which you're fishing before the take, because there's no time to decide afterwards.",
    ],
    drill:
      "Have a friend pull on your fly while you look away, and practise responding correctly for each of the three cases. Building the right reflex ahead of time is the only way it happens under adrenaline.",
    watchOut:
      "The universal trout-set reflex applied to everything. Anglers who learned on trout will lift on a striper take for years, and lose fish after fish without understanding why.",
    videoId: "mAnruzLpIko",
    videoTitle: "Setting the Hook & Fighting Fish On A Fly Rod — Fly Fishing for Beginners",
    videoChannel: "Ventures Fly Co.",
  },
  {
    stage: "landing", n: 51,
    title: "Playing a fish on a fly rod",
    skill: "Using nine feet of leverage properly",
    steps: [
      "Get the fish on the reel as soon as it's clearly a good one. Loose line at your feet is the single biggest hazard in the first ten seconds — it catches on everything and breaks tippet against a locked drag.",
      "Keep the rod bent. The bend is the shock absorber protecting fine tippet from sudden lunges, and it's what tires the fish.",
      "But not straight up. A high rod applies force upward, which a fish resists comfortably, and past about 45 degrees you're loading the rod tip rather than the butt where the power is.",
      "Use side pressure. Pull sideways, low, and specifically against the direction the fish wants to go — if it runs left, apply pressure to the right. It unbalances the fish and tires it much faster than lifting.",
      "Never let slack develop. A fish that turns toward you must be reeled or stripped to immediately, because slack lets a barbless hook drop out — and it will.",
      "Let it run when it wants to run. Fighting a run directly against a locked drag is how tippets break. That's what the drag and the backing are for.",
      "Fight it faster than feels kind, especially with anything you'll release. Exhaustion is what kills released fish. A firm two-minute fight is better for the fish than a gentle ten-minute one.",
      "If it goes into a snag, don't pull harder — slacken off. A fish that no longer feels pressure will often swim back out of a log jam on its own.",
    ],
    drill:
      "Have someone hold your line and walk about while you play them like a fish. You'll feel immediately how much more control side pressure gives than a high rod, and it's a lesson that's hard to learn with a real fish at stake.",
    watchOut:
      "The high rod held vertically over your head — the pose from every fishing photograph ever taken. It's the weakest possible angle, it risks the rod tip, and it lets fish run in circles under your feet.",
  },
  {
    stage: "landing", n: 52,
    title: "Landing and release that works",
    skill: "The last thirty seconds, which decide whether the fish lives",
    steps: [
      "Get the net wet before you use it, and use rubber mesh. Dry knotted nylon strips the fish's protective slime layer and damages fins — the slime is its defence against infection.",
      "Lead the fish head-first into the net in one movement. Chasing it with the net, or scooping from behind, panics an already tired fish into one last run that often breaks the tippet.",
      "Keep it in the water. Every second out of water is a cost, and the research on air exposure is consistent: brief is survivable, prolonged is not.",
      "Wet your hands before touching it, always. Dry hands lift slime off in patches.",
      "Never hold a fish by the gills or squeeze it behind the head. Support it under the belly and hold the wrist of the tail if you must hold it at all.",
      "Barbless hooks come out with forceps in seconds. If a fish is hooked deep, cut the tippet close and leave the hook — a fish released with a hook in it survives far better than one worked over for two minutes.",
      "Revive it facing into the current, holding it upright and letting water flow through its gills, until it swims off under its own power. Never push it back and forth — that forces water backwards through the gills and does harm.",
      "In warm water, all of this matters more and the release survival rate drops. When the water is genuinely warm, the responsible choice is often to fish somewhere cooler or not at all.",
    ],
    drill:
      "Set up the whole release kit — net wet, forceps in hand, camera ready if you want one — *before* you start fishing, not while a fish is thrashing at your feet. Doing it in the right order once makes it a habit.",
    watchOut:
      "The photo. It is where almost all the damage happens: fish held up, dropped, held up again while someone finds the camera. Have it ready or skip it — a fish in the water in the picture looks better anyway.",
    videoId: "wcgE2z1JHBw",
    videoTitle: "How To Catch and Release Fish (Safe Handling of Trout)",
    videoChannel: "Into Fly Fishing",
  },

  // ===========================================================================
  // The Maritime fly season
  // ===========================================================================
  {
    stage: "season", n: 53,
    title: "Spring: cold water and the first fish",
    skill: "Starting the season without wasting the best weeks",
    steps: [
      "Season openings differ by province and by water, and some rivers open later than others. Check the current provincial angling guide before your first trip — the Regulations section is the starting point.",
      "Early water is cold, often high and coloured with snowmelt. Fish are lethargic, hold in slower deeper water, and won't move far for a fly.",
      "So fish deep and slow: nymphs on the bottom, or streamers swung slowly on a sink tip. Cover water methodically rather than expecting a hatch.",
      "Fish the warmest part of the day, roughly midday to late afternoon. This inverts the summer rule entirely, and anglers who go out at dawn in April usually get cold and blank.",
      "Midges and small dark stoneflies are the first insects. Then, as the water warms, the first real mayfly emergences arrive — the weeks that most experienced anglers organise their spring around.",
      "Late spring, once the water drops and clears and warms into the low teens, is arguably the best trout fishing of the year: good flows, strong hatches, fish feeding hard and not yet pressured.",
      "Wading is at its most dangerous in spring. High cold water, poor visibility of the bottom, and the consequences of a fall in cold water are all worse than they look from the bank — see the Safety section.",
    ],
    drill:
      "Take the water temperature on every spring trip and write it down beside what happened. The relationship between temperature and fish activity becomes obvious over one season, and it changes when you choose to go.",
    watchOut:
      "Fishing spring like summer. Dawn starts, small dry flies and fast retrieves all belong to a warmer river. In cold water, slow down and go deep.",
  },
  {
    stage: "season", n: 54,
    title: "Summer: low water and the hard months",
    skill: "Catching fish when conditions are against you",
    steps: [
      "High summer is the hardest trout fishing of the year: low, clear, warm water, spooky fish, and long bright days with very little happening in the middle of them.",
      "Fish dawn and dusk, and don't feel obliged to fish the middle of the day at all. The last two hours of light are the best of the season, and the hour after dark is often better still.",
      "Go finer and smaller. Longer leaders, lighter tippet, smaller flies. Low clear water shows a fish everything, including your leader.",
      "Fish terrestrials along the banks. When aquatic hatches thin out, ants, beetles and hoppers falling from bankside vegetation become a real part of the diet, and that shifts the fishing to the margins and under overhanging cover.",
      "Find cold water. Spring seeps, tributary mouths, deep shaded pools, and anywhere with a bit of current and shade. Trout will concentrate in these places and they're findable if you carry a thermometer.",
      "Warm water is a welfare issue, not just a fishing one. Trout become stressed as water warms and released fish die at much higher rates. When a river is genuinely warm, fish a cooler one, fish the salt, or don't fish.",
      "This is a good time to fish the coast instead. Striped bass and mackerel are in, the water is cooler than the rivers, and the Saltwater section covers it properly.",
    ],
    drill:
      "Fish one session from an hour before dusk until you genuinely cannot see, with a single fly you can fish by feel. The last twenty minutes will change what you think summer fishing is.",
    watchOut:
      "Fishing warm rivers hard because it's your holiday. Above the warm-water thresholds the fish you release mostly die, which turns catch-and-release into catch-and-kill with extra steps.",
  },
  {
    stage: "season", n: 55,
    title: "Autumn: the best of it",
    skill: "The season most people miss",
    steps: [
      "Autumn is, for many anglers here, the best fishing of the year — and the river is emptier than in June because most people have put the rod away.",
      "Cooling water makes fish active again through the whole day, and the pressure of high summer lifts. Rain brings rivers up and freshens them.",
      "It's the peak of the Atlantic salmon run on many Maritime rivers. Autumn fish are strong, numerous relative to the rest of the season, and the whole salmon stage of this course is aimed at them.",
      "For trout, this is streamer season. Fish feeding hard before winter become aggressive, and big trout that ignored everything all summer will chase a Woolly Bugger or a Muddler stripped through a pool.",
      "Blue-winged olives return, and often on the grey drizzly days that look least appealing. A mild overcast afternoon in October can produce a better hatch than any bright day in August.",
      "Watch closing dates carefully, and be aware of spawning fish. Brook trout and salmon spawn in autumn, and fish on gravel redds should be left alone entirely — walking through a redd destroys the next generation.",
      "Then check the regulations for what stays open. Some waters close early, some run later, and a few have winter fisheries worth knowing about.",
    ],
    drill:
      "Go out on the worst-looking day of October — grey, drizzling, cold — and fish a streamer through every deep pool you know. That is the day the biggest trout of your year is most likely to be caught.",
    watchOut:
      "Fishing over spawning fish on redds. They're easy to catch, they're concentrated, they're visible, and disturbing them costs the river far more than the fish is worth. Walk around pale gravel patches, don't wade through them.",
  },
];

export const TOTAL_FLY_LESSONS = FLY_LESSONS.length;

export function flyLessonsForStage(stage: FlyStage): FlyLesson[] {
  return FLY_LESSONS.filter((l) => l.stage === stage);
}

export const FLY_COURSE_CREDIT_NOTE =
  "Every video is somebody else's work, linked and credited by channel — nothing here is hosted or mirrored. Each was checked with scripts/verify-videos.mjs when it was added, which confirms it's public and returns its real title. Links rot; re-run the script rather than trusting this note.";

export const FLY_COURSE_SCOPE_NOTE =
  "Most of this is general craft, and that's deliberate: a dead drift, a tight loop and the mechanics of a swing work identically on the Margaree and the Test. Regional specifics are handled where they belong — the regulations live once in the Fly Box and are linked rather than restated, hatch timing is given as a sequence with its variance stated rather than as invented dates, and the salmon temperature guidance is presented as the rule of thumb it actually is.";

/** Where the rest of the fly content lives, so lessons can point rather than duplicate. */
export const FLY_RELATED = [
  {
    href: "/fly",
    title: "Fly Box",
    what: "Your gear, plus the reference tables: line weights, the tippet X chart, the fly knots, the pattern library and the salmon regulations.",
  },
  {
    href: "/tying",
    title: "Fly Tying",
    what: "Making the flies this course tells you to fish, from thread control through to salmon patterns and saltwater streamers.",
  },
  {
    href: "/skills",
    title: "Skills",
    what: "The general craft shared with spinning gear — reading water, playing fish, and reading the day's conditions.",
  },
  {
    href: "/saltwater",
    title: "Saltwater",
    what: "Fishing the coast, including how a fly rod fits into it for striped bass and mackerel.",
  },
];
