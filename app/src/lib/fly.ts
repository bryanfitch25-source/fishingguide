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
 *     0.006". This is definitional rather than approximate: the diameters below are the
 *     industry standard and every manufacturer holds to them.
 *   Rule of 3  — hook size divided by 3 is roughly the X. A size 16 fly wants about 5X.
 *
 * Breaking strain is the part that does *not* follow a rule reliably, and the part the
 * chart should be least trusted on. The old "rule of 9" (9 minus X) was written for the
 * nylon monofilament of its era and now understates most spools by a wide margin — modern
 * copolymers and fluorocarbon in the same diameter test considerably higher, and the
 * figures vary between manufacturers. The pound tests below are typical of what's sold
 * today; read the spool rather than the chart when it matters.
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
  "Rule of 11 — 11 minus the X is the diameter in thousandths. 5X is 0.006\". This one is exact, not a rule of thumb.",
  "Rule of 3 — hook size divided by 3 is roughly the X you want. A size 16 fly lands near 5X, a size 12 near 4X. Round to the tippet you actually have.",
  "The pound tests are typical of modern tippet material and vary by brand and by spool age. The old rule of 9 — 9 minus the X — was written for the nylon of its day and understates most of what's sold now. Read the spool.",
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

// Patterns moved to lib/fly-patterns.ts, which outgrew this file — see TOTAL_PATTERNS.
export type { FlyPattern, PatternGroup } from "./fly-patterns";
export { PATTERN_GROUPS, PATTERN_TYPES, TOTAL_PATTERNS } from "./fly-patterns";

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
      "The recreational Atlantic salmon fishery is catch-and-release throughout. Every salmon must be released — there is no retention, at any size, anywhere in the region.",
  },
  {
    // Corrected: this used to read "a limit of two released fish per day" everywhere,
    // which is right only for PEI and for the Miramichi and Restigouche. It understated
    // the limit on every other open river and in the spring fishery.
    rule: "The daily limit caps releases — and it isn't one number",
    detail:
      "DFO Gulf Region for 2026: New Brunswick is 5 salmon per day during the spring fishery (15 April – 15 May), then 2 per day on the Miramichi and Restigouche and 4 per day on other open rivers. PEI is 2 per day. The Nova Scotia Gulf area is 4 per day. Nova Scotia's Atlantic and Fundy rivers sit under DFO Maritimes Region instead, under its own and generally tighter rules — many of those rivers are not open to salmon angling at all.",
  },
  {
    rule: "A separate licence",
    detail:
      "Salmon needs its own licence on top of a general angling licence — in Nova Scotia for everyone 16 and over, valid 1 June to 31 October. Some rivers are further restricted by season, by beat, or by daily rod limits.",
  },
  {
    rule: "Guides on some water",
    detail:
      "Certain rivers are Guide Required Waters — a non-resident must be accompanied by a licensed guide after the applicable date.",
  },
];

export const SALMON_RULES_CAVEAT =
  "Summarised from the DFO Gulf Region 2026 recreational salmon notice and provincial guidance. It changes by river and by season, and variation orders arrive mid-year — the numbers above are a starting point for planning, not a defence. Confirm against the current DFO notice and your provincial angling guide before you fish.";
