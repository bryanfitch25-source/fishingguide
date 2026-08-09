// What the fish is actually eating, and how to tell.
//
// SCOPE, AND WHY THE CALENDAR IS VAGUE ON PURPOSE
//
// Insect biology is the safe half of this file. A mayfly has the same life cycle in Nova
// Scotia as it does in Montana or Hampshire: the orders, the stages, the way a caddis pupa
// rockets to the surface and a stonefly crawls out onto a rock instead — none of that is
// regional, all of it is long-established, and it can be written in as much detail as is
// useful without inventing anything.
//
// Emergence *timing* is the unsafe half, and it is where a fishing app most easily starts
// lying. Real hatch dates swing by two or three weeks between a cold spring and a warm one,
// by more than that between a shallow southern NS river and a cold northern NB one, and
// they differ between two rivers you can see from the same hill. Published "hatch charts"
// with tidy date ranges imply a precision that does not exist.
//
// So HATCH_WINDOWS gives sequence and broad season rather than dates, states its own
// variance, and says plainly that a notebook kept on one river for two seasons will beat
// it. That is the honest shape of the knowledge. A table of dates would look more useful
// and be worth less.
//
// The rise forms are the other genuinely high-value part, and they are observational
// rather than regional: what the ring on the water tells you about what the fish is taking
// and where in the column it's taking it.

export interface InsectGroup {
  slug: string;
  name: string;
  scientific: string;
  icon: string;
  /** Complete (egg-larva-pupa-adult) or incomplete (egg-nymph-adult) metamorphosis. */
  metamorphosis: string;
  stages: { stage: string; detail: string }[];
  /** How to recognise the adult on the water or in the air. */
  identify: string;
  /** The stage that actually matters to an angler, and why. */
  keyStage: string;
  hookSizes: string;
  patterns: string[];
}

export const INSECT_GROUPS: InsectGroup[] = [
  {
    slug: "mayfly",
    name: "Mayflies",
    scientific: "Ephemeroptera",
    icon: "🦋",
    metamorphosis: "Incomplete — egg, nymph, then two winged stages. No pupa.",
    stages: [
      {
        stage: "Nymph",
        detail:
          "Months to two years underwater, moulting many times. Three tails (usually), gills along the abdomen, and one of four body shapes: clingers flattened onto fast-water rocks, crawlers in gravel, swimmers darting in weed, burrowers in silt. The shape tells you how it moves, which tells you how to fish an imitation of it.",
      },
      {
        stage: "Emerger",
        detail:
          "The nymph swims or drifts to the surface and struggles out of its shuck in the film. It is trapped, helpless and utterly conspicuous, and this is when most of them are eaten. Trout key on emergers far more than on adults, and most anglers fish the adult.",
      },
      {
        stage: "Dun (subimago)",
        detail:
          "The freshly hatched adult, with dull opaque wings held upright like a small sailboat. It sits on the surface drying its wings, which is the classic dry-fly target. It cannot mate yet — mayflies are the only insects with a winged stage that moults again.",
      },
      {
        stage: "Spinner (imago)",
        detail:
          "After a moult in streamside bushes, the wings turn clear and glassy and the tails lengthen. Spinners swarm over riffles at dusk, mate, and the females drop to lay eggs.",
      },
      {
        stage: "Spinner fall",
        detail:
          "The spent adults die on the surface with wings flat out to the sides, flush in the film and nearly invisible to you. Fish eat them steadily and quietly. A dusk rise where nothing appears to be on the water is very often a spinner fall.",
      },
    ],
    identify:
      "Upright wings like a sail when at rest on the water, a distinctly upcurved abdomen, and two or three long tails. In the air they fly weakly upward and drift down.",
    keyStage:
      "The emerger, then the spinner fall. Both are stages where the insect can't escape, and fish know it.",
    hookSizes: "10–22, with most Maritime river work between 12 and 18",
    patterns: ["Pheasant Tail Nymph", "Hare's Ear", "Adams", "Blue-Winged Olive", "Comparadun", "Rusty Spinner"],
  },
  {
    slug: "caddis",
    name: "Caddisflies",
    scientific: "Trichoptera",
    icon: "🪰",
    metamorphosis: "Complete — egg, larva, pupa, adult. Like a butterfly, not like a mayfly.",
    stages: [
      {
        stage: "Larva",
        detail:
          "A grub-like larva, present all year, and the reason a caddis larva imitation catches fish in any month. Many species build a portable case of sand grains, tiny sticks or leaf fragments glued with silk — if you turn over a stone and find what look like small tubes of gravel that move, that's caddis. Others are free-living or spin nets to strain food from the current.",
      },
      {
        stage: "Pupa",
        detail:
          "Sealed in the case for a few weeks, then it cuts free and rises to the surface, often fast and often carrying a bubble of gas that makes it glint. This ascent is short, violent and heavily preyed upon.",
      },
      {
        stage: "Adult",
        detail:
          "Emerges at the surface and usually leaves fast, sometimes running across the water before flying. Unlike a mayfly, it doesn't sit about drying its wings — which is why an angler sees adults in the air and fish rising, and catches nothing on a dry.",
      },
      {
        stage: "Egg-laying",
        detail:
          "Adults live for weeks and return to the water repeatedly. Some skitter across the surface, some crawl or swim right down to the bottom to lay. A swung or twitched wet fly imitates a diving egg-layer exactly, which is part of why the old wet-fly swing keeps working.",
      },
    ],
    identify:
      "Wings folded in a tent or roof shape along the back, long antennae, and a moth-like fluttering flight. No tails. Often seen bouncing over the water at dusk in numbers.",
    keyStage:
      "The pupa on its way up. When fish are boiling and slashing at dusk and won't take a dry, they are almost always taking pupae just under the film.",
    hookSizes: "12–18",
    patterns: ["Elk Hair Caddis", "LaFontaine Sparkle Pupa", "Soft hackle wet fly", "Peeping Caddis"],
  },
  {
    slug: "stonefly",
    name: "Stoneflies",
    scientific: "Plecoptera",
    icon: "🪳",
    metamorphosis: "Incomplete — egg, nymph, adult. No pupa.",
    stages: [
      {
        stage: "Nymph",
        detail:
          "One to three years on the bottom of cold, fast, well-oxygenated water, clinging under stones. Two tails (never three, which separates them from mayfly nymphs), two claws per foot, and a flattened body. They need clean water — finding plenty of stonefly nymphs is a good sign about a river.",
      },
      {
        stage: "Emergence",
        detail:
          "This is what makes stoneflies different: the nymph crawls out of the water onto a rock, a log or the bank and splits its shuck there, in the open air. It does not hatch in the surface film. You'll find the empty brown shucks on streamside boulders — hard evidence of what's happening in that river.",
      },
      {
        stage: "Adult",
        detail:
          "Wings folded flat over the back, longer than the body. Clumsy fliers that spend most of their time crawling in bankside vegetation, so they only interest fish when they blunder onto the water or come back to lay eggs.",
      },
    ],
    identify:
      "Two tails on the nymph, flat wings on the adult, and empty shucks on rocks at the water's edge. Early black stoneflies are small and dark and are often the first insect activity of the year.",
    keyStage:
      "The nymph, essentially always. Because they never drift as emergers, the dry fly matters far less than for mayfly or caddis — but a big stonefly nymph bounced along the bottom is one of the most reliable searching patterns there is.",
    hookSizes: "6–16, and the nymphs run big",
    patterns: ["Stonefly nymph", "Pat's Rubber Legs", "Early black stonefly", "Stimulator"],
  },
  {
    slug: "midge",
    name: "Midges and chironomids",
    scientific: "Diptera, Chironomidae",
    icon: "🦟",
    metamorphosis: "Complete — egg, larva, pupa, adult.",
    stages: [
      {
        stage: "Larva",
        detail:
          "A thin worm-like larva in silt and mud, often bright red from the haemoglobin that lets it live in low-oxygen bottom mud — hence 'bloodworm'. Abundant beyond any other insect in most stillwaters.",
      },
      {
        stage: "Pupa",
        detail:
          "The critical stage. The pupa rises slowly and then hangs vertically in the surface film, sometimes for a long time, unable to do anything about it. In a lake this is the single most eaten item there is, and an entire discipline of stillwater fishing exists around imitating it.",
      },
      {
        stage: "Adult",
        detail:
          "A small, delicate, mosquito-like fly — but it doesn't bite. Often forms dense swarms over the water on calm evenings.",
      },
    ],
    identify:
      "Very small, slim, with a distinct humped thorax and no tails. In numbers they look like drifting smoke over the water. Adults sit flush in the film rather than upright.",
    keyStage:
      "The pupa in the film. And note that midges hatch every month of the year including midwinter, which makes them the answer when nothing else is happening.",
    hookSizes: "18–28, and 'too small' is usually not small enough",
    patterns: ["Zebra Midge", "Griffith's Gnat", "Chironomid pupa", "Buzzer"],
  },
  {
    slug: "terrestrial",
    name: "Terrestrials",
    scientific: "Land insects that fall in",
    icon: "🐜",
    metamorphosis: "Not aquatic at all — they arrive by accident.",
    stages: [
      {
        stage: "The fall",
        detail:
          "Ants, beetles, grasshoppers, crickets, inchworms and caterpillars blow, fall or crawl into the water from overhanging trees and bankside grass. There is no hatch to time — there is wind, and there is the edge of the river.",
      },
      {
        stage: "Why they matter",
        detail:
          "From high summer into autumn, when aquatic hatches are thin and the water is low and warm, terrestrials can be most of what a trout eats. They arrive along the banks and under overhanging cover rather than out in the current, which changes where you cast.",
      },
      {
        stage: "Flying ant falls",
        detail:
          "On certain warm, humid days ants swarm and mate in the air, and huge numbers end up on the water at once. Fish lock onto them completely and refuse everything else. It's unpredictable, brief, and worth carrying two ant patterns all summer for.",
      },
    ],
    identify:
      "Look at the bankside vegetation rather than the water. If beating a bush produces beetles and hoppers, the fish under that bank already know.",
    keyStage:
      "Any of them, and they sink. A beetle or an ant fished slightly awash or just under the film usually beats one riding high and dry.",
    hookSizes: "12–20",
    patterns: ["Black ant", "Foam beetle", "Hopper", "Green inchworm"],
  },
  {
    slug: "baitfish",
    name: "Baitfish and the big stuff",
    scientific: "Not insects at all",
    icon: "🐟",
    metamorphosis: "n/a",
    stages: [
      {
        stage: "Small fish",
        detail:
          "Sculpin, dace, shiners, smelt, sticklebacks and juvenile trout and salmon parr. Big trout in particular switch to fish rather than insects, because the calories per chase finally make sense.",
      },
      {
        stage: "Crustaceans",
        detail:
          "Scuds and freshwater shrimp in weedy stillwater and spring-fed water, and crayfish where they occur. Both are eaten heavily and imitated far less often than they deserve.",
      },
      {
        stage: "Leeches and worms",
        detail:
          "A black or olive leech pattern fished slow and deep is one of the most reliable stillwater flies in existence, and it needs no hatch to work.",
      },
      {
        stage: "In the salt",
        detail:
          "Sand lance, silversides, juvenile herring and mackerel — the reason a Clouser Deep Minnow and a Lefty's Deceiver are in the tying course. See the Saltwater section for how that fishery works.",
      },
    ],
    identify:
      "Watch for fleeing bait, terns working, or fry scattering in the margins. That's a fish feeding, and it wants something bigger than a nymph.",
    keyStage:
      "Movement over imitation. A streamer's action — strip, pause, sink — matters more than its exact profile, because it's being taken as prey rather than inspected as food.",
    hookSizes: "2–10",
    patterns: ["Woolly Bugger", "Muddler Minnow", "Clouser Deep Minnow", "Black Ghost", "Mickey Finn"],
  },
];

// ---------------------------------------------------------------------------
// Rise forms
// ---------------------------------------------------------------------------

export interface RiseForm {
  name: string;
  looks: string;
  means: string;
  fish: string;
}

/**
 * What the disturbance tells you.
 *
 * This is observational rather than regional, and it is probably the highest-value page in
 * this file: the rise form tells you what depth the fish is feeding at, which is question
 * two of the four, and which decides your whole method.
 */
export const RISE_FORMS: RiseForm[] = [
  {
    name: "The sip",
    looks: "A small quiet ring, barely a dimple, often with almost no sound.",
    means:
      "Something helpless in or just under the film — spent spinners, midge pupae, emergers. The fish doesn't need to hurry because the food can't escape.",
    fish: "Often the biggest fish in the pool. Quiet rises are an efficiency signal, not a size one.",
  },
  {
    name: "Head and tail",
    looks: "The head appears, then the dorsal fin, then the tail rolls over — a slow porpoise.",
    means:
      "Emergers taken just beneath the film, on a steady confident cruise. The fish is moving through a lane collecting them.",
    fish: "Feeding hard and catchable. Fish an emerger or a nymph in the film, not a high-riding dry.",
  },
  {
    name: "The bulge",
    looks: "A hump or boil that pushes the surface up without ever breaking it.",
    means: "Nymphs or pupae taken a few inches down. The surface never breaks because the fish never reaches it.",
    fish:
      "The classic reason people fish dries over 'rising' fish and catch nothing. Go subsurface — a soft hackle or an unweighted nymph.",
  },
  {
    name: "The splash",
    looks: "A noisy, showy rise, sometimes clearing the water.",
    means:
      "Something moving and trying to leave — usually an emerging or skittering caddis. The violence is the fish committing to a chase.",
    fish:
      "Often smaller, more eager fish, but not always. Try a twitched or skated caddis, or swing a soft hackle through them.",
  },
  {
    name: "Tailing",
    looks: "The tail out of the water, the head down, in shallow water.",
    means: "Grubbing on the bottom for cased caddis, shrimp or nymphs. Not looking up at all.",
    fish: "Feeding confidently but blind to the surface. Get something small on the bottom in front of it.",
  },
  {
    name: "Slashing and scattering bait",
    looks: "Sharp aggressive swirls, small fish spraying out of the water.",
    means: "A predator on fry or smelt. Nothing to do with insects.",
    fish: "Put on a streamer and strip it. This is the one rise form where matching a hatch is entirely the wrong instinct.",
  },
];

// ---------------------------------------------------------------------------
// Seasonal sequence — deliberately not a date table
// ---------------------------------------------------------------------------

export interface HatchWindow {
  window: string;
  water: string;
  expect: string[];
  approach: string;
}

/**
 * The order things happen in, not the dates they happen on.
 *
 * Every published hatch chart implies a precision that rivers do not have. Emergence is
 * driven by accumulated water temperature and day length, so a cold late spring can push a
 * hatch back by two or three weeks, a warm one pulls it forward, and two rivers thirty
 * kilometres apart can be a fortnight out of step. Elevation, spring-fed versus
 * surface-fed, and how much snow melted last month all move it.
 *
 * What is stable is the sequence — midges before the early stoneflies, the big spring
 * mayflies before the summer caddis, terrestrials as the water warms and drops, and olives
 * returning with the autumn cool. That sequence is what this encodes.
 *
 * See HATCH_CAVEAT, which is rendered with this wherever it appears.
 */
export const HATCH_WINDOWS: HatchWindow[] = [
  {
    window: "Ice-out to early spring",
    water: "Cold, often high and coloured with snowmelt",
    expect: [
      "Midges, which never stopped — often the only thing moving on a cold day",
      "Small dark early stoneflies, crawling out onto rocks and snow at the water's edge",
      "The first small dark olives on milder afternoons",
    ],
    approach:
      "Fish deep and slow with nymphs; the fish are cold and won't move far. Afternoons are warmest and best. Surface activity, if it comes at all, comes in the middle of the day rather than at dusk.",
  },
  {
    window: "Late spring",
    water: "Dropping and warming, often the best flows of the year",
    expect: [
      "The big spring mayfly emergences — the ones that make people take days off work",
      "Caddis starting, and building fast",
      "Stonefly nymphs active and worth imitating on the bottom",
    ],
    approach:
      "The most reliably productive weeks of the season for trout. Hatches come mid-afternoon in cool weather and shift later as it warms. Fish emergers if adults are on the water and you're being refused.",
  },
  {
    window: "Early summer",
    water: "Warm, clear, dropping toward summer level",
    expect: [
      "Caddis at their peak, particularly in the last hour of light",
      "Mayfly spinner falls at dusk — quiet rises with nothing visible on the water",
      "The first terrestrials as bankside vegetation fills in",
    ],
    approach:
      "Evenings become the whole game. Be on the water for the last two hours, and don't leave when the light goes — the best of it is often after you can no longer see your fly.",
  },
  {
    window: "High summer",
    water: "Low, warm and clear — the hardest conditions of the year",
    expect: [
      "Terrestrials dominating: ants, beetles, hoppers along the banks",
      "Small stuff — midges and tiny olives — in the film",
      "Very little in the middle of the day",
    ],
    approach:
      "Fish dawn and dusk and leave the middle of the day alone. Go fine and small, fish the banks and the shade rather than the open current, and find cold water: spring seeps, tributary mouths, deep shaded pools. In genuinely warm water, consider not fishing for trout at all — see the release lesson on warm-water mortality.",
  },
  {
    window: "Autumn",
    water: "Cooling, often rising with the first real rains",
    expect: [
      "Olives returning, and often on the drizzly grey days that look least promising",
      "Late caddis",
      "Fish feeding hard ahead of winter, and big fish becoming aggressive",
    ],
    approach:
      "Streamer season. Cooling water and pre-winter aggression make this the best time of year for a big trout, and the fish that ignored everything all summer will chase a Woolly Bugger. Also the peak of the Atlantic salmon run on many rivers — see the salmon stage.",
  },
];

export const HATCH_CAVEAT =
  "This is a sequence, not a calendar. Emergence is driven by accumulated water temperature and day length, so a cold spring can delay everything by two or three weeks and a warm one pulls it forward — and two rivers within sight of each other can be a fortnight apart. Use it to know what to look for and roughly when to start looking. A notebook kept on one river for two seasons will beat any published chart, including this one.";

export const ENTOMOLOGY_NOTE =
  "Insect life cycles are long-established biology and are given here in full. What is deliberately withheld is precise regional timing and species-level lists for individual rivers, because that varies more than any chart can honestly capture. Identify to the group — mayfly, caddis, stonefly, midge — then match size and silhouette. That is enough to catch fish, and it is knowledge you can actually trust.";

/** Sample the river rather than guessing — the one habit that beats every chart. */
export const SAMPLING_STEPS = [
  "Turn over a few stones in the riffle and look at what's clinging underneath. Count tails: three usually means mayfly, two means stonefly. Cases of sand or sticks mean caddis.",
  "Hold a fine mesh net, or just a piece of window screen, downstream while you disturb the gravel above it with your boot. Whatever ends up in the mesh is what's drifting.",
  "Look at spider webs in the bankside bushes. They are a free record of what has been hatching for the last few days.",
  "Check streamside rocks for empty stonefly shucks, and the underside of bridges and leaves for resting caddis and duns.",
  "Watch the water itself in the last hour of light, low to the surface with the light behind the insects. Things you cannot see standing up are obvious lying down.",
  "If a fish is rising, catch the rise form before you catch the insect. What depth it's feeding at matters more than which species it's eating.",
];
