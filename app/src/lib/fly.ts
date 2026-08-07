// Fly fishing: its own categories, and the reference that only matters with fly gear.
//
// Kept apart from conventional tackle because in the Maritimes the two are not
// interchangeable — they are not even legally interchangeable. Every sea-run Atlantic
// salmon water in New Brunswick and Nova Scotia is fly-only: a spinning rod, a hard lure
// or bait is illegal on those rivers, the hook must be barbless, and every salmon must be
// released. See SALMON_RULES.
//
// The gear taxonomy has nothing in common with a tackle box either. A fly reel is sized
// by the line it holds rather than by a 1000–10000 number; line is described by taper,
// weight and density; leader and tippet use the X system; and a fly is a pattern with a
// hook size rather than a lure with an ounce weight.

export type FlyCategory =
  | "fly_rod"
  | "fly_reel"
  | "fly_line"
  | "backing"
  | "leader_tippet"
  | "fly"
  | "fly_accessory";

export const FLY_CATEGORIES: { value: FlyCategory; label: string }[] = [
  { value: "fly_rod", label: "Rod" },
  { value: "fly_reel", label: "Reel" },
  { value: "fly_line", label: "Line" },
  { value: "backing", label: "Backing" },
  { value: "leader_tippet", label: "Leader & Tippet" },
  { value: "fly", label: "Flies" },
  { value: "fly_accessory", label: "Accessories" },
];

export const FLY_CATEGORY_ICON: Record<FlyCategory, string> = {
  fly_rod: "🎣",
  fly_reel: "🎡",
  fly_line: "🧵",
  backing: "🪢",
  leader_tippet: "➰",
  fly: "🪶",
  fly_accessory: "🧰",
};

export function isFlyCategory(v: unknown): v is FlyCategory {
  return FLY_CATEGORIES.some((c) => c.value === v);
}

/** Line weights, the number everything in fly fishing is sized against. */
export const LINE_WEIGHTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

// ---------------------------------------------------------------------------
// Reference: what line weight for what
// ---------------------------------------------------------------------------

export interface LineWeightGuide {
  weights: string;
  what: string;
  detail: string;
}

/**
 * Line weight against Maritime quarry.
 *
 * Ranges rather than single numbers, because the honest answer depends on wind and water
 * as much as on the fish. The Miramichi in September and a small brook in June are both
 * "brook trout" and are not the same rod.
 */
export const LINE_WEIGHT_GUIDE: LineWeightGuide[] = [
  {
    weights: "2–4 wt",
    what: "Small brook trout, small streams",
    detail:
      "Brushy headwaters and beaver ponds where a cast is twenty feet and delicacy matters more than distance.",
  },
  {
    weights: "5–6 wt",
    what: "Brook trout, brown trout, general freshwater",
    detail:
      "The one rod to own if you own one. Handles a dry fly, a nymph rig and a small streamer, and won't be embarrassed by wind on a lake.",
  },
  {
    weights: "6–7 wt",
    what: "Smallmouth bass, sea-run trout, big streamers",
    detail: "Enough backbone to turn over a weighted fly and a heavier leader.",
  },
  {
    weights: "8–9 wt",
    what: "Atlantic salmon (grilse and small salmon), striped bass",
    detail:
      "The Miramichi standard. An 8 wt covers most summer salmon fishing and doubles as a striper rod in the estuaries.",
  },
  {
    weights: "9–10 wt",
    what: "Large salmon, big stripers, wind",
    detail:
      "Autumn fish in high water, and anywhere you are casting into the teeth of it off a beach.",
  },
  {
    weights: "10–12 wt",
    what: "Bluefin tuna, offshore",
    detail: "A different sport with the same vocabulary. Bring a reel that can actually stop something.",
  },
];

// ---------------------------------------------------------------------------
// Reference: the X system
// ---------------------------------------------------------------------------

export interface TippetRow {
  x: string;
  diameterIn: string;
  approxLb: string;
  hookSizes: string;
  typical: string;
}

/**
 * The tippet X chart.
 *
 * Two rules generate most of this and are worth knowing rather than looking up:
 *   Rule of 11 — 11 minus the X number is the diameter in thousandths of an inch. 5X is
 *     0.006".
 *   Rule of 3  — hook size divided by 3 is roughly the X. A size 16 fly wants about 5X.
 *
 * Breaking strain is the part that does *not* follow a rule reliably. The old "rule of 9"
 * (9 minus X) describes nylon monofilament and no longer describes much else — modern
 * copolymers and fluorocarbon in the same diameter test considerably higher, and the
 * figures vary between manufacturers. The pound tests below are typical nylon; read the
 * spool rather than the chart when it matters.
 */
export const TIPPET_CHART: TippetRow[] = [
  { x: "0X", diameterIn: "0.011", approxLb: "~15 lb", hookSizes: "2 – 1/0", typical: "Salmon, big streamers, pike" },
  { x: "1X", diameterIn: "0.010", approxLb: "~13 lb", hookSizes: "4 – 8", typical: "Salmon, bass bugs" },
  { x: "2X", diameterIn: "0.009", approxLb: "~11 lb", hookSizes: "6 – 10", typical: "Streamers, smallmouth" },
  { x: "3X", diameterIn: "0.008", approxLb: "~8 lb", hookSizes: "8 – 12", typical: "Big nymphs, wet flies" },
  { x: "4X", diameterIn: "0.007", approxLb: "~6 lb", hookSizes: "10 – 14", typical: "Nymphing, larger dries" },
  { x: "5X", diameterIn: "0.006", approxLb: "~5 lb", hookSizes: "14 – 18", typical: "The everyday trout size" },
  { x: "6X", diameterIn: "0.005", approxLb: "~3.5 lb", hookSizes: "16 – 22", typical: "Small dries, clear water" },
  { x: "7X", diameterIn: "0.004", approxLb: "~2.5 lb", hookSizes: "18 – 24", typical: "Spring creeks, fussy fish" },
  { x: "8X", diameterIn: "0.003", approxLb: "~1.75 lb", hookSizes: "22 – 28", typical: "Midges, and hope" },
];

export const TIPPET_RULES = [
  "Rule of 11 — 11 minus the X is the diameter in thousandths. 5X is 0.006\".",
  "Rule of 3 — hook size divided by 3 is roughly the X you want. A size 15 fly takes 5X.",
  "The pound tests are typical nylon only. Fluorocarbon and modern copolymers test higher in the same diameter, and it varies by brand — read the spool.",
];

// ---------------------------------------------------------------------------
// Reference: knots that only matter with fly gear
// ---------------------------------------------------------------------------

export interface FlyKnot {
  name: string;
  joins: string;
  why: string;
  steps: string[];
}

export const FLY_KNOTS: FlyKnot[] = [
  {
    name: "Nail knot",
    joins: "Fly line to leader butt (or backing to fly line)",
    why: "Lies flat and slips through the guides. The classic join, and the one worth learning even though welded loops have made it optional.",
    steps: [
      "Lay the leader butt alongside the fly line, pointing opposite ways, with a small tube (or a nail) beside both.",
      "Wrap the leader back over itself, the line and the tube 5–6 times, working toward the line's tip.",
      "Feed the tag end back through the tube, then pull the tube out.",
      "Work the coils tight against the line a little at a time, wetting as you go.",
      "Pull firm on both standing parts and trim both tags flush.",
    ],
  },
  {
    name: "Loop-to-loop",
    joins: "Looped fly line to looped leader",
    why: "Changes a leader in ten seconds with cold hands. Most modern lines come with a welded loop, which makes this the default.",
    steps: [
      "Pass the leader's loop through the fly line's loop.",
      "Pass the far end of the leader through its own loop.",
      "Pull them together so the two loops form a square, not a girth hitch.",
      "A girth hitch — where one loop lies across the other — cuts into the line and is the usual reason this join fails.",
    ],
  },
  {
    name: "Blood knot",
    joins: "Two lengths of similar-diameter mono — building a tapered leader",
    why: "Straight, slim, and passes through guides cleanly. Struggles when the two diameters differ by more than about 0.002\".",
    steps: [
      "Cross the two ends, leaving generous tags.",
      "Wrap one tag around the other line 5 times, then bring it back through the middle gap.",
      "Wrap the other tag around the first line 5 times the opposite way, and bring it back through the same gap from the other side.",
      "Wet it and pull the standing lines apart steadily.",
      "Trim both tags close.",
    ],
  },
  {
    name: "Double surgeon's",
    joins: "Leader to tippet, especially across different diameters",
    why: "Faster than a blood knot and more tolerant of mismatched diameters. Slightly bulkier, which almost never matters.",
    steps: [
      "Overlap the two lines by about six inches, pointing opposite ways.",
      "Form a simple loop with both together.",
      "Pass both ends through the loop twice (three times for a triple).",
      "Wet it and pull all four ends at once, steadily.",
      "Trim the two tags.",
    ],
  },
  {
    name: "Non-slip loop knot",
    joins: "Tippet to fly",
    why: "Leaves the fly a loop to swing on. On a streamer or a wet fly the extra movement is the whole point; on a dead-drifted dry it doesn't matter.",
    steps: [
      "Tie a loose overhand knot in the tippet, four inches from the end.",
      "Pass the tag through the hook eye and back through the overhand knot.",
      "Wrap the tag around the standing line 4–5 times.",
      "Bring the tag back through the overhand knot, entering the same side it left.",
      "Wet, and tighten the wraps down before seating the overhand knot.",
    ],
  },
  {
    name: "Arbor knot",
    joins: "Backing to the reel spool",
    why: "You tie it once per spool and then forget it exists — which is fine, because it only carries load if a fish takes all your backing.",
    steps: [
      "Pass the backing around the arbor.",
      "Tie an overhand knot around the standing line.",
      "Tie a second overhand knot in the tag end alone, as a stopper.",
      "Pull the standing line so the first knot slides down and the stopper jams against it.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Reference: Maritime patterns
// ---------------------------------------------------------------------------

export interface FlyPattern {
  name: string;
  type: string;
  sizes: string;
  when: string;
  note: string;
}

export interface PatternGroup {
  quarry: string;
  blurb: string;
  patterns: FlyPattern[];
}

/**
 * Patterns worth carrying here specifically.
 *
 * Weighted toward the Miramichi and its tributaries because that is what New Brunswick is
 * known for worldwide, and because the salmon patterns below were largely invented on it —
 * the Green Machine and the Bomber are Miramichi flies that went on to be fished
 * everywhere.
 */
export const PATTERN_GROUPS: PatternGroup[] = [
  {
    quarry: "Atlantic salmon",
    blurb:
      "Fly-only water by law, barbless, and every fish released. Summer fish in low clear water want small and sparse; autumn fish in height of water want more.",
    patterns: [
      {
        name: "Green Machine",
        type: "Bomber / buck bug",
        sizes: "4 – 10",
        when: "Low, clear summer water",
        note: "A Miramichi fly that became a world pattern. Green body, brown tufts fore and aft. If you carry one salmon fly, this is arguably it.",
      },
      {
        name: "Bomber",
        type: "Dry / waking",
        sizes: "2 – 8",
        when: "Warm water, low flow, bright days",
        note: "Deer-hair body skated across the lie to leave a wake. The take is the reason people fish for salmon.",
      },
      {
        name: "Blue Charm",
        type: "Hairwing",
        sizes: "6 – 10",
        when: "Bright days, clear water",
        note: "Slim and sparse, with just enough blue to be seen without alarming a fish that has seen everything.",
      },
      {
        name: "Undertaker",
        type: "Hairwing",
        sizes: "4 – 10",
        when: "Coloured or falling water",
        note: "Black with a green and red butt. The dark-day answer when a Blue Charm is too subtle.",
      },
      {
        name: "Silver Rat / Rusty Rat",
        type: "Hairwing",
        sizes: "4 – 8",
        when: "Anywhere, anytime",
        note: "The Rat series are Canadian classics and the safest thing to tie on when nothing is obviously happening.",
      },
      {
        name: "Cosseboom",
        type: "Hairwing",
        sizes: "4 – 8",
        when: "Late season, coloured water",
        note: "Green-bodied, and a Maritime staple in autumn.",
      },
    ],
  },
  {
    quarry: "Brook trout",
    blurb:
      "The Maritimes' most available fly fish — every county has water holding them. They are not selective; presentation beats pattern nearly always.",
    patterns: [
      {
        name: "Elk Hair Caddis",
        type: "Dry",
        sizes: "12 – 18",
        when: "All season, riffled water",
        note: "Floats well, is easy to see, and suggests enough things to be worth a first cast.",
      },
      {
        name: "Adams",
        type: "Dry",
        sizes: "12 – 20",
        when: "Any hatch you can't identify",
        note: "The universal grey mayfly. Carry the parachute version if your eyes are past forty.",
      },
      {
        name: "Hare's Ear Nymph",
        type: "Nymph",
        sizes: "12 – 18",
        when: "When nothing is rising",
        note: "Beadhead for depth. Buggy enough to be several insects at once.",
      },
      {
        name: "Muddler Minnow",
        type: "Streamer",
        sizes: "6 – 12",
        when: "Big fish, coloured or falling water",
        note: "A sculpin, a small baitfish, or a grasshopper depending on how you fish it.",
      },
      {
        name: "Mickey Finn",
        type: "Streamer",
        sizes: "6 – 12",
        when: "Spring, high water",
        note: "Yellow and red bucktail. An old Maritime standby for sea-run trout and brookies alike.",
      },
      {
        name: "Black Gnat / Griffith's Gnat",
        type: "Dry",
        sizes: "16 – 22",
        when: "Flat calm evenings, midging fish",
        note: "For the rises that ignore everything larger.",
      },
    ],
  },
  {
    quarry: "Striped bass",
    blurb:
      "The Miramichi estuary and the Northumberland Strait hold huge numbers. This is saltwater fly fishing on a fresh-water doorstep — fish the tide, not the clock.",
    patterns: [
      {
        name: "Clouser Deep Minnow",
        type: "Streamer",
        sizes: "1/0 – 4",
        when: "Anywhere, any tide",
        note: "Dumbbell eyes ride it hook-up over structure. Chartreuse/white first, then olive/white.",
      },
      {
        name: "Deceiver",
        type: "Streamer",
        sizes: "2/0 – 2",
        when: "When they're on larger bait",
        note: "Holds a baitfish profile without fouling. The other half of the Clouser answer.",
      },
      {
        name: "Gurgler",
        type: "Topwater",
        sizes: "1/0 – 4",
        when: "Calm water, low light",
        note: "Pushes a wake. Stripers hitting a surface fly is worth doing badly for a while to get right.",
      },
      {
        name: "Gaspereau / smelt pattern",
        type: "Streamer",
        sizes: "1/0 – 2",
        when: "Spring, on the bait runs",
        note: "When the gaspereau are running, matching them matters more than usual.",
      },
    ],
  },
  {
    quarry: "Smallmouth bass",
    blurb: "Warm-water fly fishing on the Saint John system and elsewhere, and the most reliable summer sport going.",
    patterns: [
      {
        name: "Popper",
        type: "Topwater",
        sizes: "2 – 8",
        when: "Summer, morning and evening",
        note: "The reason people own a 6 wt.",
      },
      {
        name: "Woolly Bugger",
        type: "Streamer",
        sizes: "4 – 10",
        when: "Any time nothing is on top",
        note: "Black or olive. Catches everything in this list, which is why every box has a dozen.",
      },
      {
        name: "Crayfish pattern",
        type: "Streamer",
        sizes: "4 – 8",
        when: "Rocky bottom, late summer",
        note: "Fished slow on the bottom. Smallmouth eat more crayfish than anything else.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Reference: the law
// ---------------------------------------------------------------------------

export const SALMON_RULES = [
  {
    rule: "Fly only",
    detail:
      "Every sea-run Atlantic salmon water in New Brunswick and Nova Scotia is fly-fishing only. A spinning rod, a hard lure or any bait is illegal on those rivers — not merely frowned upon.",
  },
  {
    rule: "Barbless",
    detail:
      "The fly must be barbless, or the barb pinched flat. Pinch it at the vice rather than on the river with cold fingers and a fish waiting.",
  },
  {
    rule: "Release everything",
    detail:
      "The recreational Atlantic salmon fishery is catch-and-release. All salmon must be released, with a limit of two released fish per day.",
  },
  {
    rule: "A separate licence",
    detail:
      "Salmon needs its own licence on top of a general angling licence, and some rivers are further restricted by season, by beat, or by daily rod limits.",
  },
  {
    rule: "Guides on some water",
    detail:
      "Certain rivers are Guide Required Waters — a non-resident must be accompanied by a licensed guide after the applicable date.",
  },
];

export const SALMON_RULES_CAVEAT =
  "Summarised from DFO Gulf Region and provincial guidance, and it changes by river and by season — variation orders arrive mid-year. Confirm against the current DFO notice and your provincial angling guide before you fish.";
