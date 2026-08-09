// The home screen's structure, and the two lenses over it.
//
// WHY THIS FILE EXISTS
//
// The home page had grown to fourteen top-level cards, which is what happens when every
// new section earns a card and nothing ever gets demoted. Fourteen equally-weighted
// choices is not a launcher, it's a search problem — so the sections are grouped under
// five headings and the headings are what the page shows.
//
// Nothing was removed. Every route that had a card still has an entry; it's one tap
// deeper instead of on the surface.
//
// THE TWO LENSES
//
// Salt/fresh and fly/casting are the two questions that actually change what's relevant,
// and they're close to independent — which is why they're two controls rather than one
// list of four combinations.
//
// They REORDER AND DIM. They do not hide, and they never hide a whole group. The reason
// is that a wrong guess about someone's intent is cheap when the answer is still on
// screen and expensive when it isn't: someone in "casting" mode who wants to look up a
// tippet size should find the Fly Box greyed out and one tap away, not absent. Items with
// no tag are universal — Safety, the species guides, the catch log — and never dim.
//
// Both lenses default to "all", so a first-time visitor is never shown a page that has
// silently decided what kind of angler they are.
//
// SURF FISHING
//
// Live as of /surf. It's a third water rather than a flavour of salt because a beach and
// a wharf share a tide and almost nothing else: no structure to stand on, fish in a
// narrow moving band, distance as a real constraint, and a hazard profile that needs its
// own section. Surf-tagged items are the ones where that difference actually matters.
//
// The ModeOption.comingSoon flag stays in the type. It cost nothing, it kept the option
// out of the UI while the content didn't exist, and the next mode to be sketched before
// it's built will want the same treatment.

export type WaterMode = "all" | "salt" | "fresh" | "surf";
export type MethodMode = "all" | "fly" | "spin";

export interface ModeOption<T> {
  id: T;
  label: string;
  /** Rendered only when false. See the surf note in the file header. */
  comingSoon?: boolean;
}

export const WATER_MODES: ModeOption<WaterMode>[] = [
  { id: "all", label: "Both" },
  { id: "salt", label: "Saltwater" },
  { id: "fresh", label: "Freshwater" },
  { id: "surf", label: "Surf" },
];

export const METHOD_MODES: ModeOption<MethodMode>[] = [
  { id: "all", label: "Both" },
  { id: "fly", label: "Fly" },
  { id: "spin", label: "Casting" },
];

export interface NavItem {
  href: string;
  title: string;
  blurb: string;
  /** Absent means universal — relevant whatever the lenses say, and never dimmed. */
  water?: Exclude<WaterMode, "all">[];
  method?: Exclude<MethodMode, "all">[];
  /** Shown as a small marker. Used sparingly, for the things worth pointing at. */
  badge?: string;
}

export interface NavGroup {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  /** Theme token stem — `bg-{accent}-light`, `text-{accent}`, `hover:border-{accent}`. */
  accent: "brand" | "guide" | "tackle" | "catches" | "accent";
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "today",
    title: "On the water",
    emoji: "🌊",
    blurb: "What the water is doing right now, and whether you should be on it.",
    accent: "brand",
    items: [
      {
        href: "/tides",
        title: "Tides",
        blurb: "Live predictions, the 24-hour curve, marine conditions and solunar periods.",
        water: ["salt", "surf"],
      },
      {
        href: "/safety",
        title: "Safety",
        blurb: "Cold water, what you must carry, a float plan in one tap, and what to say on channel 16.",
      },
      {
        href: "/near-me",
        title: "Fish Near Me",
        blurb: "What's catchable close to where you're standing.",
      },
      {
        href: "/trip-planner",
        title: "Trip Planner",
        blurb: "Put a day together — where, when, and what to bring.",
      },
      {
        href: "/depth",
        title: "Depth Charts",
        blurb: "Seabed depth from the Canadian Hydrographic Service. Save an area to use it offline.",
        water: ["salt", "surf"],
      },
    ],
  },
  {
    id: "fish",
    title: "The fish",
    emoji: "🐟",
    blurb: "What lives here, where it sits, when it's in, and what the law says about it.",
    accent: "guide",
    items: [
      {
        href: "/species",
        title: "Species Guides",
        blurb: "27 species, each with how to actually catch one.",
      },
      {
        href: "/regulations",
        title: "Regulations",
        blurb: "Seasons, limits and licences across NB, NS and PEI.",
      },
      {
        href: "/guide/seasonality",
        title: "What's in season",
        blurb: "Month by month, across the three provinces.",
      },
      {
        href: "/locations",
        title: "Locations",
        blurb: "Trip guides for named waters and launches.",
      },
      {
        href: "/species/compare",
        title: "Compare species",
        blurb: "Two fish side by side, when you're not sure which you're looking at.",
      },
      {
        href: "/guide",
        title: "Fishing Guide",
        blurb: "The hub the guides, regs and seasonality all hang off.",
      },
    ],
  },
  {
    id: "gear",
    title: "Your gear",
    emoji: "🧰",
    blurb: "What you own, and which of it to tie on.",
    accent: "tackle",
    items: [
      {
        href: "/matcher",
        title: "What to Throw",
        blurb: "Which lure or fly for which fish and water — led by what's already in your boxes.",
      },
      {
        href: "/tackle",
        title: "Tackle Box",
        blurb: "Rods, reels, lures and terminal tackle by tray, tagged to the species they suit.",
        method: ["spin"],
      },
      {
        href: "/fly",
        title: "Fly Box",
        blurb: "Fly gear kept separate, with line weights, the tippet chart, knots and patterns.",
        method: ["fly"],
      },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    emoji: "🎓",
    blurb: "The craft the rest of the app assumes you already have.",
    accent: "accent",
    items: [
      {
        href: "/skills",
        title: "Skills",
        blurb: "Casting, reading water, drag and hooksets, and the three minutes before the net.",
      },
      {
        href: "/fly-fishing",
        title: "Learn Fly Fishing",
        blurb: "55 lessons from why the line is heavy to swinging a fly for salmon.",
        method: ["fly"],
        badge: "New",
      },
      {
        href: "/saltwater",
        title: "Saltwater",
        blurb: "Fishing the salt as its own craft — tides, wharves, and what salt does to gear.",
        water: ["salt", "surf"],
      },
      {
        href: "/surf",
        title: "Surf Fishing",
        blurb: "Reading a beach: bars, troughs and cuts, timing the tide, and the hazards a wharf doesn't have.",
        water: ["surf"],
        badge: "New",
      },
      {
        href: "/tying",
        title: "Fly Tying",
        blurb: "Thirteen lessons from the first thread wrap to Bombers.",
        method: ["fly"],
      },
      {
        href: "/lures",
        title: "Making Lures",
        blurb: "Pour jig heads, then build spinners and spoons with no heat at all.",
        method: ["spin"],
      },
      {
        href: "/guide/knots",
        title: "Knots",
        blurb: "The handful worth knowing, and when each one is the right answer.",
      },
    ],
  },
  {
    id: "record",
    title: "Your record",
    emoji: "📓",
    blurb: "What you caught and where — the only data here that's genuinely yours.",
    accent: "catches",
    items: [
      {
        href: "/catches",
        title: "Catch Log",
        blurb: "What you caught, where, on what, and in what conditions.",
      },
      {
        href: "/spots",
        title: "My Spots",
        blurb: "The places you fish, with their nearest tide station.",
      },
      {
        href: "/settings",
        title: "Settings",
        blurb: "Units, theme, profile and notifications.",
      },
    ],
  },
];

/**
 * Does this item match the current lenses?
 *
 * Untagged items always match — that's what makes them universal. A tagged item matches
 * when the active mode is "all" or appears in its list.
 */
export function matchesLenses(item: NavItem, water: WaterMode, method: MethodMode): boolean {
  if (water !== "all" && item.water && !item.water.includes(water)) return false;
  if (method !== "all" && item.method && !item.method.includes(method)) return false;
  return true;
}

/**
 * Three tiers, not two.
 *
 * Binary match/no-match made the Surf lens a no-op, and the reason is structural: surf is
 * a narrowing of salt rather than an alternative to it, so everything tagged for salt
 * also matches surf and nothing gets dimmed. A lens that changes nothing is worse than no
 * lens, because the user presses it and concludes the feature is broken.
 *
 * So relevance is ranked:
 *
 *   0  specifically about this — carries a tag for an active lens and matches it
 *   1  universal — untagged, relevant whatever you picked
 *   2  other — tagged, and the tag says this isn't it
 *
 * Tier 0 floats to the top of its group, which is what makes Surf promote Surf Fishing
 * and Saltwater above the rest of Learn even though it dims nothing. Tier 2 is what the
 * UI dims. Original order is preserved within each tier.
 */
export function relevanceRank(item: NavItem, water: WaterMode, method: MethodMode): 0 | 1 | 2 {
  if (!matchesLenses(item, water, method)) return 2;
  const specificWater = water !== "all" && item.water !== undefined;
  const specificMethod = method !== "all" && item.method !== undefined;
  return specificWater || specificMethod ? 0 : 1;
}

export function sortByRelevance(items: NavItem[], water: WaterMode, method: MethodMode): NavItem[] {
  return items
    .map((item, i) => ({ item, i, rank: relevanceRank(item, water, method) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((e) => e.item);
}

/**
 * Hand the lenses off to /matcher, which has its own method and water filters.
 *
 * Only what maps exactly is passed. The matcher separates river from lake rather than
 * carrying one "fresh" value, so freshwater deliberately passes no water param — seeding
 * it with either one would silently narrow the results to half of what was asked for.
 */
export function matcherHref(water: WaterMode, method: MethodMode): string {
  const p = new URLSearchParams();
  if (method === "fly" || method === "spin") p.set("method", method);
  if (water === "salt" || water === "surf") p.set("water", "salt");
  const q = p.toString();
  return q ? `/matcher?${q}` : "/matcher";
}

export const LENS_STORAGE_KEY = "ma-home-lenses";
