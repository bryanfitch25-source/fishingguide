// What to throw at what, and where.
//
// Grounded in the gear and technique sections already written into research/*.json rather
// than assembled independently — if a species guide says mackerel come to a small casting
// spoon or a Sabiki, this agrees with it. An app that recommends one thing on the species
// page and a different thing in the matcher is worse than one that only does the former.
// Every named water below appears in the research for that species; none were added here.
//
// Two kinds of geography, deliberately distinguished:
//
//   regions      — water type crossed with province. Defensible everywhere, doesn't go
//                  stale, and true whether or not you know the local names.
//   namedWaters  — specific rivers, bays and wharves. Far more useful when right, and the
//                  interface flags them as the softer claim. They are a starting point for
//                  asking someone at the wharf, not a guarantee: access changes, fish move,
//                  and a spot that produced for someone on a forum in 2019 owes you nothing.
//
// Species that genuinely aren't lure or fly fisheries here say so, and then give the bait
// rig that actually works, rather than being left blank or padded with an invented
// crankbait. Gaspereau are dipped or taken on a small streamer, herring come to a Sabiki,
// eels come to cut bait sat still on the bottom. That is the honest answer and it is also
// the useful one.
//
// `regions` is always a subset of the provinces the species guide lists for that fish.

import type { Province } from "@/types/content";

export type Method = "spin" | "fly" | "bait";
export type WaterType = "salt" | "estuary" | "river" | "lake";
export type Certainty = "established" | "local";

export interface Recommendation {
  speciesSlug: string;
  method: Method;
  /** Fly pattern name (matching lib/fly-patterns.ts) or a lure/rig description. */
  name: string;
  kind: "lure" | "fly" | "bait";
  /** Weight, size or hook range in the units the thing is sold in. */
  sizes?: string;
  /** Season and conditions — when you'd actually reach for it. */
  when: string;
  waters: WaterType[];
  regions: Province[];
  namedWaters?: string[];
  certainty: Certainty;
  note: string;
  /**
   * Exact pattern name in lib/fly-patterns.ts, when this is a fly that lives in the
   * library. Lets the matcher link through to the full entry instead of repeating it.
   */
  patternRef?: string;
}

export const WATER_LABEL: Record<WaterType, string> = {
  salt: "Open salt",
  estuary: "Estuary / tidal",
  river: "River / stream",
  lake: "Lake / pond",
};

export const METHOD_LABEL: Record<Method, string> = {
  spin: "Spinning",
  fly: "Fly",
  bait: "Bait",
};

export const KIND_LABEL: Record<Recommendation["kind"], string> = {
  lure: "Lure",
  fly: "Fly",
  bait: "Bait / rig",
};

const ALL: Province[] = ["NB", "NS", "PEI"];

/**
 * Species that aren't realistically fished with a lure or a fly here, and why.
 *
 * These still carry recommendations below — bait ones. The note explains why nothing in
 * the list has a retrieve.
 */
export const NOT_LURE_FISHERIES: Record<string, string> = {
  gaspereau:
    "Mostly a dip-net fishery on the spring run. They will take a small bright streamer swung fast, and that is genuinely fun on light tackle, but nobody is choosing a crankbait for them.",
  "atlantic-herring":
    "Taken on a Sabiki or feather rig under a wharf light rather than on a lure with a retrieve. Effectively bait-gathering, and none the worse for it.",
  "american-eel":
    "A scent-based, stationary bait fishery on the bottom. Eels hunt by smell and don't chase; no lure meaningfully improves on cut bait sat still.",
  "atlantic-tomcod":
    "A small-bait fishery — a hi-lo rig in a deep estuary channel, or through the ice on the January run. Not a lure target.",
  cunner:
    "Bait on a small hook dropped beside structure. Genuinely no-technique, which is exactly why it's the best thing to hand a child on a wharf.",
  sculpin:
    "Almost always incidental — caught on bait or a jig meant for flounder or tomcod. Worth knowing about mainly so you can handle one without getting spiked.",
  "acadian-redfish":
    "Not a targeted recreational fishery in this region at all. It lives at 150–300 m; you meet one as bycatch on a deep cod or halibut trip.",
};

export const RECOMMENDATIONS: Recommendation[] = [
  // =========================================================================
  // ATLANTIC SALMON — fly only, by law
  // =========================================================================
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Green Machine",
    patternRef: "Green Machine",
    sizes: "2 – 10", when: "Low, clear summer water",
    waters: ["river"], regions: ["NB", "NS", "PEI"],
    namedWaters: ["Miramichi River", "Restigouche River", "Margaree River"], certainty: "established",
    note: "The Miramichi bug that became a world pattern. Fished damp in the surface film on a floating line.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Bomber",
    patternRef: "Bomber",
    sizes: "2 – 8", when: "Warm, low water — the dry-fly window",
    waters: ["river"], regions: ["NB", "NS", "PEI"],
    namedWaters: ["Miramichi River", "Margaree River"], certainty: "established",
    note: "Skated across the lie to leave a wake. A salmon coming up through the surface for one is the reason people fish these rivers.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Black Bear Green Butt",
    patternRef: "Black Bear Green Butt",
    sizes: "4 – 10", when: "Any height, any time",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "If you are unsure what to start with, this or a Rat. Among the most-fished salmon flies in eastern Canada.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Rusty Rat",
    patternRef: "Rusty Rat",
    sizes: "2 – 10", when: "Anywhere, anytime",
    waters: ["river"], regions: ["NB", "NS", "PEI"],
    namedWaters: ["Restigouche River", "Miramichi River"], certainty: "established",
    note: "Tied on the Restigouche in 1949 and still the fly a great many people would pick if allowed only one.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Blue Charm",
    patternRef: "Blue Charm",
    sizes: "4 – 12", when: "Bright days, clear low water",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "Small and sparse for fish that have already seen a season of flies. Scottish by birth, adopted here wholesale.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Undertaker",
    patternRef: "Undertaker",
    sizes: "4 – 10", when: "Coloured or falling water",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "The dark-day answer when something brighter is being refused. Named in the species guide's own gear table.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Cosseboom",
    patternRef: "Cosseboom",
    sizes: "4 – 10", when: "Late season, coloured water",
    waters: ["river"], regions: ["NS", "NB"],
    namedWaters: ["Margaree River"], certainty: "local",
    note: "John Cosseboom's pattern, from the Margaree. An autumn staple across the Maritimes.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Butterfly",
    patternRef: "Butterfly",
    sizes: "4 – 10", when: "Summer grilse in riffled water",
    waters: ["river"], regions: ["NB"],
    namedWaters: ["Miramichi River"], certainty: "local",
    note: "White wings set in a V. A long-standing Miramichi grilse fly, and named in the guide's gear table.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Copper Killer",
    patternRef: "Copper Killer",
    sizes: "6 – 10", when: "Low, warm water — late summer grilse",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "Small, coppery and bright. The classic late-summer grilse answer when the river is down to bones.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Same Thing Murray",
    patternRef: "Same Thing Murray",
    sizes: "4 – 10", when: "Overcast days, medium water",
    waters: ["river"], regions: ["NB"],
    namedWaters: ["Miramichi River"], certainty: "local",
    note: "A New Brunswick fly with a New Brunswick name. Deep orange, and better on a grey day than the sun suggests it should be.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Shady Lady",
    patternRef: "Shady Lady",
    sizes: "4 – 10", when: "Dark water, low light",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "Dark and simple. Fish it when the water has colour and a bright fly is being ignored.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Green Highlander",
    patternRef: "Green Highlander",
    sizes: "2 – 8", when: "High or coloured water, early season",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "The big bright classic for spring water with volume in it. Fished on a sink-tip when the river is up.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Ally's Shrimp",
    patternRef: "Ally's Shrimp",
    sizes: "4 – 10", when: "Any height — a genuine all-rounder",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "A shrimp-style hairwing with a long tail that comes alive on the swing. Widely carried, rarely regretted.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Silver Rat",
    patternRef: "Silver Rat",
    sizes: "4 – 10", when: "Bright days, clear water",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "The flash version of the Rat family. Worth a swing after the darker ones have been through a pool.",
  },
  {
    speciesSlug: "atlantic-salmon", method: "fly", kind: "fly", name: "Buck Bug",
    patternRef: "Buck Bug",
    sizes: "2 – 8", when: "Low summer water, dry-fly conditions",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "The deer-hair bug family the Green Machine belongs to. Fished damp in the film rather than dry on top — a change of silhouette when a pool has seen too many Bombers.",
  },

  // =========================================================================
  // STRIPED BASS
  // =========================================================================
  {
    speciesSlug: "striped-bass", method: "spin", kind: "lure", name: "Paddletail soft plastic on a jig head",
    sizes: "4–6 in, 1/4–1 oz head", when: "All season, most conditions",
    waters: ["estuary", "salt", "river"], regions: ALL,
    namedWaters: ["Miramichi River estuary", "Hillsborough River, Charlottetown", "Malpeque Bay", "Northumberland Strait"],
    certainty: "established",
    note: "The workhorse, and the first thing named in the species guide. White or pearl first, darker in stained water. Change head weight with the current rather than changing plastic.",
  },
  {
    speciesSlug: "striped-bass", method: "spin", kind: "lure", name: "Topwater popper or walking plug",
    sizes: "4–6 in", when: "Dawn and dusk, calm water",
    waters: ["estuary", "salt"], regions: ALL,
    namedWaters: ["Rustico and Cavendish beaches, PEI", "West Point / Jacques Cartier beach, PEI"],
    certainty: "established",
    note: "Worth losing sleep for. Best on a flooding tide over a shallow flat or sandbar where bass are pushing bait. Swap trebles for single inline hooks — barbless singles are mandatory.",
  },
  {
    speciesSlug: "striped-bass", method: "spin", kind: "lure", name: "Metal casting spoon",
    sizes: "1/2 – 2 oz", when: "Wind, distance, fish holding deep",
    waters: ["salt", "estuary"], regions: ALL, certainty: "established",
    note: "Casts into weather when nothing else will, and imitates a fleeing baitfish on a fast retrieve. Let it swing across the current rather than cranking it straight back.",
  },
  {
    speciesSlug: "striped-bass", method: "spin", kind: "lure", name: "Swimming plug / minnow bait",
    sizes: "4–7 in", when: "Bait present, moving water",
    waters: ["estuary", "river"], regions: ALL, certainty: "established",
    note: "Fished on the swing in a tidal river much like a fly, letting the current do the work. Singles, not trebles.",
  },
  {
    speciesSlug: "striped-bass", method: "bait", kind: "bait", name: "Fresh-cut mackerel or gaspereau on a bottom rig",
    sizes: "Egg sinker, 2–4 ft leader, single barbless hook", when: "Any tide, best on current seams and river-mouth holes",
    waters: ["estuary", "river", "salt"], regions: ALL, certainty: "established",
    note: "The low-effort producer the guide singles out for bigger fish. Fresh beats frozen by a wide margin. Measure everything — the 50–65 cm slot is enforced.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Clouser Deep Minnow",
    patternRef: "Clouser Deep Minnow",
    sizes: "1/0 – 2", when: "Any tide, any time",
    waters: ["estuary", "salt", "river"], regions: ALL,
    namedWaters: ["Miramichi River estuary"], certainty: "established",
    note: "Chartreuse over white first. Rides hook-up, which matters over the rock and mussel bottom here.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Lefty's Deceiver",
    patternRef: "Lefty's Deceiver",
    sizes: "2/0 – 1", when: "When they're on larger bait",
    waters: ["estuary", "salt"], regions: ALL, certainty: "established",
    note: "The bigger profile for when gaspereau or small mackerel are the forage rather than sand eels.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Gurgler",
    patternRef: "Gurgler",
    sizes: "1/0 – 4", when: "Calm, low light",
    waters: ["estuary", "salt"], regions: ALL, certainty: "established",
    note: "The fly equivalent of a topwater plug, and every bit as worth it.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Sand Eel",
    patternRef: "Sand Eel",
    sizes: "1 – 4", when: "Over sand, when bass are refusing everything fatter",
    waters: ["salt", "estuary"], regions: ALL, certainty: "established",
    note: "Thin, long, almost nothing on the hook. When bass are keyed to sand lance, profile matters more than colour.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Gaspereau / Alewife pattern",
    patternRef: "Gaspereau / Alewife pattern",
    sizes: "2/0 – 1", when: "Spring, on the bait run",
    waters: ["estuary", "river"], regions: ["NB", "NS"],
    namedWaters: ["Miramichi River"], certainty: "local",
    note: "When gaspereau are running a river the bass are behind them, and matching the size matters more than usual.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Half and Half",
    patternRef: "Half and Half",
    sizes: "2/0 – 1/0", when: "Wind, current, big fish",
    waters: ["estuary", "salt"], regions: ALL, certainty: "established",
    note: "A Deceiver's tail on a Clouser's head — length and profile that still sinks. The one fly to tie on when you can only tie on one.",
  },
  {
    speciesSlug: "striped-bass", method: "fly", kind: "fly", name: "Surf Candy",
    patternRef: "Surf Candy",
    sizes: "1 – 4", when: "Clear water, bright light, spooky fish",
    waters: ["salt", "estuary"], regions: ALL, certainty: "established",
    note: "Epoxy-bodied and translucent. Holds up to a beating and looks right in water clear enough that a bulkier fly gets refused.",
  },

  // =========================================================================
  // BROOK TROUT
  // =========================================================================
  {
    speciesSlug: "brook-trout", method: "spin", kind: "lure", name: "Inline spinner",
    sizes: "size 0–3, 1/16–1/4 oz", when: "All season, moving water",
    waters: ["river", "lake"], regions: ALL,
    namedWaters: ["Little River, Salisbury NB", "Pollett River", "Prosser Brook"],
    certainty: "established",
    note: "Gold in tea-stained water, silver in clear. Cast up and across and retrieve just fast enough to feel the blade turning.",
  },
  {
    speciesSlug: "brook-trout", method: "spin", kind: "lure", name: "Small casting spoon",
    sizes: "1/8 – 1/2 oz", when: "Lakes and larger pools",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "Covers water faster than a spinner and gets deeper without adding weight to the line.",
  },
  {
    speciesSlug: "brook-trout", method: "bait", kind: "bait", name: "Worm on a light rig",
    sizes: "Size 8–12 hook, one split shot", when: "Cold or high water, and any time nothing else is working",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "Named in the species guide's own gear table and there is no shame in it. Drifted naturally through a pool it out-fishes everything in early spring. Check whether the water you're on is fly-only or artificial-lure-only first.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Elk Hair Caddis",
    patternRef: "Elk Hair Caddis",
    sizes: "12 – 18", when: "All season, riffled water",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "Floats through broken water and stays visible in it. Often the right first cast on a small stream.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Adams",
    patternRef: "Adams",
    sizes: "12 – 18", when: "Any unidentified hatch",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "The universal grey mayfly. Parachute version if the light is poor or your eyes are.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Gold-Ribbed Hare's Ear",
    patternRef: "Gold-Ribbed Hare's Ear",
    sizes: "12 – 18", when: "Nothing rising",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "Beadhead to get it down. Buggy enough to pass for several things at once, which is the whole point.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Pheasant Tail Nymph",
    patternRef: "Pheasant Tail Nymph",
    sizes: "12 – 18", when: "Clear water, fish that have seen pressure",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "The slim counterpart to a Hare's Ear. Carry both and let refusals decide.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Mickey Finn",
    patternRef: "Mickey Finn",
    sizes: "6 – 12", when: "Spring high water",
    waters: ["river", "estuary"], regions: ALL, certainty: "established",
    note: "Bright enough to be found in stained spring water. A long-standing Maritime choice for sea-run fish too.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Montreal",
    patternRef: "Montreal",
    sizes: "8 – 14", when: "Spring, coloured water",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "A Canadian wet developed for brook trout in the 1800s and still doing exactly the job it was made for.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Parmachene Belle",
    patternRef: "Parmachene Belle",
    sizes: "8 – 14", when: "Dark water, brook trout specifically",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "Red and white, unmistakable, and a brook-trout fly rather than a general one.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Muddler Minnow",
    patternRef: "Muddler Minnow",
    sizes: "4 – 12", when: "Any time a small fish would be on the menu",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "Sculpin, minnow, grasshopper, or nothing in particular. Fish it dead-drift, swung, or skated — it works all three ways.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Foam Ant",
    patternRef: "Foam Ant",
    sizes: "14 – 20", when: "Mid-summer, overhanging bank cover",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "In July and August more trout eat terrestrials than mayflies. Drop it tight to the bank and don't mend.",
  },
  {
    speciesSlug: "brook-trout", method: "fly", kind: "fly", name: "Grey Ghost",
    patternRef: "Grey Ghost",
    sizes: "2 – 8", when: "Sea-run fish in the estuary, and lake fish at ice-out",
    waters: ["estuary", "lake"], regions: ALL,
    namedWaters: ["Boughton River, PEI", "Morell River, PEI"], certainty: "local",
    note: "Carrie Stevens' smelt imitation. Where sea-run brook trout meet smelt in a PEI estuary this is the right shape.",
  },

  // =========================================================================
  // SEA-RUN BROOK TROUT & LANDLOCKED SALMON
  // =========================================================================
  {
    speciesSlug: "landlocked-salmon", method: "fly", kind: "fly", name: "Grey Ghost",
    patternRef: "Grey Ghost",
    sizes: "2 – 8", when: "Ice-out and again in autumn",
    waters: ["lake"], regions: ["NB", "NS"],
    namedWaters: ["Grand Lake, Halifax County NS", "Loch Lomond, NB", "Oromocto Lake"],
    certainty: "established",
    note: "Carrie Stevens' smelt imitation, and the fly this whole fishery is built around. Trolled or cast along a shoreline when the smelt move.",
  },
  {
    speciesSlug: "landlocked-salmon", method: "fly", kind: "fly", name: "Nine-Three",
    patternRef: "Nine-Three",
    sizes: "2 – 8", when: "Cold water, spring",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "Green over white. The other half of the classic smelt pair.",
  },
  {
    speciesSlug: "landlocked-salmon", method: "fly", kind: "fly", name: "Joe's Smelt",
    patternRef: "Joe's Smelt",
    sizes: "4 – 8", when: "Spring, surface-feeding fish",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "Slimmer and sparser than a Grey Ghost, for when the fish are looking closely rather than chasing.",
  },
  {
    speciesSlug: "landlocked-salmon", method: "fly", kind: "fly", name: "Magog Smelt",
    patternRef: "Magog Smelt",
    sizes: "2 – 8", when: "Spring and autumn, along drop-offs",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "Another Canadian smelt streamer, and a useful change of colour when the Ghost has been through twice.",
  },
  {
    speciesSlug: "landlocked-salmon", method: "spin", kind: "lure", name: "Trolling spoon",
    sizes: "2–4 in", when: "Ice-out through early summer",
    waters: ["lake"], regions: ["NB", "NS"],
    namedWaters: ["Middle and Upper Tetagouche Lake, NB"], certainty: "established",
    note: "Trolled slow and shallow at ice-out, deeper as the water warms and the fish drop toward the thermocline.",
  },
  {
    speciesSlug: "landlocked-salmon", method: "spin", kind: "lure", name: "Inline spinner",
    sizes: "size 2–4", when: "Casting shorelines and points, spring and evening",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "The guide names spinners and small spoons together. Work points and drop-offs rather than open basin.",
  },

  // =========================================================================
  // SMALLMOUTH BASS
  // =========================================================================
  {
    speciesSlug: "smallmouth-bass", method: "spin", kind: "lure", name: "Tube jig",
    sizes: "2.5–3.5 in, 1/8–3/8 oz", when: "All season, rocky bottom",
    waters: ["lake", "river"], regions: ALL,
    namedWaters: ["Saint John River", "Little River, Salisbury NB", "Anagance River"],
    certainty: "established",
    note: "Dragged and hopped on the bottom. Imitates the crayfish smallmouth eat more than they eat anything else.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "spin", kind: "lure", name: "Topwater popper or walker",
    sizes: "2–4 in", when: "Summer, first and last light",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "The most fun way to catch them and often the most effective in warm water.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "spin", kind: "lure", name: "Small crankbait",
    sizes: "2–3 in, 4–10 ft diving", when: "Covering water on a flat",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "Crayfish colours over rock, shad colours over sand. Named alongside spinners and tubes in the guide.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "spin", kind: "lure", name: "Inline spinner",
    sizes: "size 2–4", when: "Rivers, all season",
    waters: ["river"], regions: ALL, certainty: "established",
    note: "The simplest thing that works on river smallmouth, and what local anglers actually recommend for the Petitcodiac tributaries.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "fly", kind: "fly", name: "Popper",
    patternRef: "Popper",
    sizes: "2 – 8", when: "Summer mornings and evenings",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "The reason a lot of people own a 6 wt.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "fly", kind: "fly", name: "Woolly Bugger",
    patternRef: "Woolly Bugger",
    sizes: "4 – 10", when: "Any time nothing is happening on top",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "Black or olive, weighted, fished slow along a rock edge. Does more jobs than any other fly in the box.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "fly", kind: "fly", name: "Clouser Deep Minnow",
    patternRef: "Clouser Deep Minnow",
    sizes: "2 – 8", when: "Deep pools, current seams",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "Bob Clouser designed it for smallmouth before anyone put it in salt water.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "fly", kind: "fly", name: "Crayfish pattern",
    patternRef: "Crayfish pattern",
    sizes: "4 – 8", when: "Anywhere the bottom is rock",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "Fished on the bottom in short hops, backwards, the way the animal actually moves.",
  },
  {
    speciesSlug: "smallmouth-bass", method: "fly", kind: "fly", name: "Sneaky Pete",
    patternRef: "Sneaky Pete",
    sizes: "4 – 10", when: "Calm evenings, pressured fish",
    waters: ["lake"], regions: ALL, certainty: "established",
    note: "A slider rather than a popper — pushes water without the noise, for fish that have already refused a loud one.",
  },

  // =========================================================================
  // LARGEMOUTH BASS, PICKEREL, MUSKIE
  // =========================================================================
  {
    speciesSlug: "largemouth-bass", method: "spin", kind: "lure", name: "Soft plastic worm, Texas rigged",
    sizes: "5–7 in", when: "Summer, in and around weed",
    waters: ["lake"], regions: ["NB"],
    namedWaters: ["Grand Lake, NB", "Washademoak Lake", "Oromocto Lake", "Mactaquac headpond"],
    certainty: "established",
    note: "Weedless and slow. The most reliable way to fish cover without collecting salad on every cast.",
  },
  {
    speciesSlug: "largemouth-bass", method: "spin", kind: "lure", name: "Hollow-body frog",
    sizes: "2.5–4 in", when: "Summer, over lily pads and mats",
    waters: ["lake"], regions: ["NB"], certainty: "established",
    note: "Walk it over the pads and wait a beat after the blow-up before setting. Setting on the splash costs you the fish.",
  },
  {
    speciesSlug: "largemouth-bass", method: "spin", kind: "lure", name: "Spinnerbait",
    sizes: "3/8 – 1/2 oz", when: "Wind, stained water, weed edges",
    waters: ["lake"], regions: ["NB"], certainty: "established",
    note: "Comes through cover better than it has any right to. White or chartreuse-and-white covers most days.",
  },
  {
    speciesSlug: "largemouth-bass", method: "spin", kind: "lure", name: "Crankbait along a drop-off",
    sizes: "2–3 in, 6–12 ft diving", when: "Heat of summer, deeper cover",
    waters: ["lake"], regions: ["NB"], certainty: "established",
    note: "When the shallow bite dies at midday, the fish are usually on the first drop next to it rather than gone.",
  },
  {
    speciesSlug: "largemouth-bass", method: "fly", kind: "fly", name: "Dahlberg Diver",
    patternRef: "Dahlberg Diver",
    sizes: "2 – 6", when: "Evenings, over and beside pads",
    waters: ["lake"], regions: ["NB"], certainty: "established",
    note: "Dives on the strip and floats back up on the pause. The one deer-hair fly worth the tying time for bass.",
  },
  {
    speciesSlug: "chain-pickerel", method: "spin", kind: "lure", name: "Spinnerbait",
    sizes: "1/4 – 1/2 oz", when: "Summer, weed edges",
    waters: ["lake", "river"], regions: ["NB", "NS"],
    namedWaters: ["Belleisle Bay", "Washademoak Lake", "Grand Lake, NB"],
    certainty: "established",
    note: "Fast and flashy, straight down a weed line. Use a short wire or heavy fluorocarbon bite guard — pickerel teeth end line.",
  },
  {
    speciesSlug: "chain-pickerel", method: "spin", kind: "lure", name: "Topwater walker",
    sizes: "3–5 in", when: "Warm, calm days",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "Pickerel hit topwater harder than their size suggests, and miss it often enough to be entertaining.",
  },
  {
    speciesSlug: "chain-pickerel", method: "spin", kind: "lure", name: "Small jerkbait or spoon",
    sizes: "3–4 in / 1/4–1/2 oz", when: "Spring and autumn, cooler water",
    waters: ["lake", "river"], regions: ["NB", "NS"], certainty: "established",
    note: "Red-and-white, white, or yellow — the colours the guide names. Work it erratically with pauses; the take usually comes on the stop.",
  },
  {
    speciesSlug: "chain-pickerel", method: "fly", kind: "fly", name: "Chain Pickerel Streamer",
    patternRef: "Chain Pickerel Streamer",
    sizes: "1/0 – 4", when: "Summer, along pad edges",
    waters: ["lake"], regions: ["NB", "NS"], certainty: "established",
    note: "Flashy, long, and tied on a wire or heavy fluoro bite tippet. A pickerel on an 8 wt is a genuinely good afternoon.",
  },
  {
    speciesSlug: "muskellunge", method: "spin", kind: "lure", name: "Large bucktail spinner",
    sizes: "6–10 in", when: "Summer and autumn",
    waters: ["river", "lake"], regions: ["NB"],
    namedWaters: ["Saint John River", "Mactaquac headpond"], certainty: "local",
    note: "Retrieved fast and steady, and every cast finished with a figure-8 boatside. Check the current invasive-species rules before you go — retention requirements have changed and vary by area.",
  },
  {
    speciesSlug: "muskellunge", method: "spin", kind: "lure", name: "Large jerkbait or glide bait",
    sizes: "8–12 in", when: "Autumn, cooling water",
    waters: ["river", "lake"], regions: ["NB"],
    namedWaters: ["Mactaquac headpond"], certainty: "local",
    note: "Cast tight to weed edges and current breaks. An 80 lb+ wire or fluorocarbon leader is not optional.",
  },

  // =========================================================================
  // MACKEREL, POLLOCK, COD — the saltwater staples
  // =========================================================================
  {
    speciesSlug: "atlantic-mackerel", method: "spin", kind: "lure", name: "Small casting spoon or metal jig",
    sizes: "1/2 – 1 oz", when: "Summer, when the schools arrive",
    waters: ["salt", "estuary"], regions: ALL, certainty: "established",
    note: "Retrieve fast. Mackerel outrun most lures and will hit almost anything bright moving quickly.",
  },
  {
    speciesSlug: "atlantic-mackerel", method: "bait", kind: "bait", name: "Sabiki / feather rig",
    sizes: "size 4–8 hooks", when: "Schools thick around a wharf",
    waters: ["salt"], regions: ALL,
    namedWaters: ["Pointe-du-Chêne Wharf", "Souris Wharf, PEI"], certainty: "established",
    note: "Several at a time, which is what you want if you're gathering bait rather than fishing for sport. Carry both this and a spoon — the guide says so, and it's right.",
  },
  {
    speciesSlug: "atlantic-mackerel", method: "fly", kind: "fly", name: "White Bucktail",
    patternRef: "White Bucktail",
    sizes: "2 – 6", when: "Schools within casting range",
    waters: ["salt", "estuary"], regions: ALL, certainty: "established",
    note: "A strip of bucktail and some flash on a hook is genuinely enough. Excellent on a 6–8 wt off a wharf, and badly under-used here.",
  },
  {
    speciesSlug: "atlantic-mackerel", method: "fly", kind: "fly", name: "Mackerel fly (silver tinsel)",
    patternRef: "Mackerel fly (silver tinsel)",
    sizes: "2 – 8", when: "Bright day, fish showing on the surface",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "All flash, no subtlety. Strip it as fast as you physically can and hold on.",
  },
  {
    speciesSlug: "pollock", method: "spin", kind: "lure", name: "Metal jig or casting spoon",
    sizes: "1/2 – 2 oz", when: "All season, around structure",
    waters: ["salt"], regions: ALL,
    namedWaters: ["St. Andrews, NB", "Reversing Falls West shuttle dock", "Blacks Harbour", "Beaver Harbour"],
    certainty: "established",
    note: "Snap-jigged: a sharp 12–18 in lift, then drop the tip and let it flutter back on slack. That fluttering fall is what gets hit.",
  },
  {
    speciesSlug: "pollock", method: "spin", kind: "lure", name: "Bucktail jig with a soft-plastic trailer",
    sizes: "6–12 oz for deep boat work", when: "From a boat over ledges and wrecks",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "White or chartreuse. Work it vertically through the whole column rather than pinning it to bottom — pollock suspend well above the rock.",
  },
  {
    speciesSlug: "pollock", method: "fly", kind: "fly", name: "Clouser Deep Minnow",
    patternRef: "Clouser Deep Minnow",
    sizes: "1/0 – 2", when: "Around structure, moving tide",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "On a fast-sinking line and an 8–9 wt, as the guide's own gear table specifies. Pollock are one of the most willing saltwater fly targets here and almost nobody fishes for them.",
  },
  {
    speciesSlug: "pollock", method: "fly", kind: "fly", name: "Sand Eel",
    patternRef: "Sand Eel",
    sizes: "1 – 4", when: "When pollock are on small bait near the surface",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "The sandeel pattern the gear table names. Thin and long, fished with a fast, uneven strip.",
  },
  {
    speciesSlug: "pollock", method: "bait", kind: "bait", name: "Oily herring strip on a bottom or float rig",
    sizes: "Size 1–2/0 hook", when: "Wharf fishing, fish not showing on top",
    waters: ["salt"], regions: ALL,
    namedWaters: ["Martins Wharf", "Little Lepreau"], certainty: "local",
    note: "Smoked or oily herring is specifically called out by NB anglers — the scent trail pulls fish in when they aren't feeding on top. Expect mackerel and flounder on the same rig.",
  },
  {
    speciesSlug: "atlantic-cod", method: "spin", kind: "lure", name: "Diamond jig",
    sizes: "4–16 oz", when: "Open season, over hard bottom",
    waters: ["salt"], regions: ALL,
    namedWaters: ["Grand Manan Island", "North Lake, PEI", "Bras d'Or Lakes"],
    certainty: "established",
    note: "Chrome or hammered, dropped to bottom then reeled up a foot or two. Sharp 2–3 ft sweeps, and let it fall back on a controlled semi-slack line rather than ripping it down. Check the very limited open season first.",
  },
  {
    speciesSlug: "atlantic-cod", method: "bait", kind: "bait", name: "High-low rig with fresh cut bait",
    sizes: "4–16 oz sinker, size 3/0–6/0 hooks", when: "Any time you can hold bottom",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "Fresh cut mackerel, herring, squid strip or clam. The guide is blunt about this: fresh bait out-fishes stale by a wide margin, and in heavy current a bottom rig out-produces a jig.",
  },
  {
    speciesSlug: "atlantic-cod", method: "spin", kind: "lure", name: "Teaser fly on a dropper above the jig",
    sizes: "2–3 ft above the jig", when: "When cod are keyed on small bait like sand eels",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "A small teaser or scented soft plastic on a short dropper picks up extra fish, and often the better ones.",
  },

  // =========================================================================
  // BLUEFIN TUNA — a charter fishery, and honest about it
  // =========================================================================
  {
    speciesSlug: "bluefin-tuna", method: "bait", kind: "bait", name: "Live or fresh mackerel, set by the crew",
    sizes: "Barbless circle hooks, 180 lb+ line", when: "July – October, on a charter",
    waters: ["salt"], regions: ALL,
    namedWaters: ["North Lake, PEI", "East Point, PEI"], certainty: "established",
    note: "This is what actually happens on a trip. Mackerel is almost the entire southern Gulf bluefin diet, the crew sets the baits, and your job is to book a reputable operator and then hold a rod for an hour. Barbless circles and 180 lb minimum line are DFO conditions, not preferences.",
  },
  {
    speciesSlug: "bluefin-tuna", method: "spin", kind: "lure", name: "Stickbait or heavy popper",
    sizes: "6–10 in", when: "Fish showing on the surface, on a charter",
    waters: ["salt"], regions: ALL,
    namedWaters: ["North Lake, PEI"], certainty: "local",
    note: "Only where the operator runs it that way, and only with tackle that can take it. Not a shore or small-boat proposition in any version.",
  },
  {
    speciesSlug: "bluefin-tuna", method: "fly", kind: "fly", name: "Large baitfish fly on a 12 wt",
    sizes: "4/0 – 6/0", when: "On a charter, fish up and feeding",
    waters: ["salt"], regions: ["NS", "PEI"], certainty: "local",
    note: "Possible, rare, and demanding of both tackle and angler. Bring a reel that can genuinely stop something.",
  },

  // =========================================================================
  // SHAD & SMELT — the run fisheries
  // =========================================================================
  {
    speciesSlug: "american-shad", method: "spin", kind: "lure", name: "Shad dart",
    sizes: "1/16 – 1/4 oz", when: "Spring run",
    waters: ["river", "estuary"], regions: ["NB", "NS"],
    namedWaters: ["Annapolis River", "Shubenacadie River", "Stewiacke River", "Saint John River at Mactaquac"],
    certainty: "established",
    note: "Cast up or across, let it sink a second, then a slow steady retrieve kept low — shad travel low in the column. Bright colours; they take flash and movement rather than imitation.",
  },
  {
    speciesSlug: "american-shad", method: "spin", kind: "lure", name: "Small casting spoon or curly-tail jig",
    sizes: "1/8 – 1/4 oz", when: "Spring run, faster water",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "Add a split shot to hold depth in current. Work eddies, outside bends and creek mouths where fish rest before pushing on.",
  },
  {
    speciesSlug: "american-shad", method: "fly", kind: "fly", name: "Pink and Silver Shad Fly",
    patternRef: "Pink and Silver Shad Fly",
    sizes: "4 – 8", when: "Spring run, on the swing",
    waters: ["river"], regions: ["NB", "NS"],
    namedWaters: ["Annapolis River"], certainty: "established",
    note: "Weighted and fished across and down, exactly like a small salmon fly. Shad are not feeding — you are putting it in their path repeatedly.",
  },
  {
    speciesSlug: "american-shad", method: "fly", kind: "fly", name: "Shad Dart",
    patternRef: "Shad Dart",
    sizes: "4 – 8", when: "Spring run, deeper lies",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "The dart in fly form — weighted head, bright body, fished dead on the swing.",
  },
  {
    speciesSlug: "rainbow-smelt", method: "spin", kind: "lure", name: "Tiny bucktail jighead",
    sizes: "1/64 – 1/32 oz", when: "Spring run and through the ice",
    waters: ["estuary", "river"], regions: ALL,
    namedWaters: ["Cocagne River", "Shediac River", "Boughton River, PEI", "Portapique River"],
    certainty: "established",
    note: "Cast into the middle of a school and keep it moving — takes come as the lure leaves the school, not while it sits in it. Gentle hookset; a hard one tears out of that small mouth.",
  },
  {
    speciesSlug: "rainbow-smelt", method: "fly", kind: "fly", name: "Small streamer on an ultralight rod",
    sizes: "10 – 14", when: "Spring run at the tide head",
    waters: ["estuary", "river"], regions: ALL, certainty: "established",
    note: "Named in the guide's own gear table alongside the tiny jighead. Undersized terminal tackle is the whole trick with smelt.",
  },

  // =========================================================================
  // PERCH
  // =========================================================================
  {
    speciesSlug: "yellow-perch", method: "spin", kind: "lure", name: "Small jig or teardrop, tipped",
    sizes: "1/16 – 1/8 oz", when: "All season, including through the ice",
    waters: ["lake", "river"], regions: ALL,
    namedWaters: ["French Lake, NB", "Douglas Lake, NB", "First, Second and Third Lakes, NB"],
    certainty: "established",
    note: "Tip it with a minnow head, waxworm or maggot — bare jigs work on an active school, but scent usually out-produces plastic alone. Light shakes, not aggressive snapping.",
  },
  {
    speciesSlug: "yellow-perch", method: "spin", kind: "lure", name: "Small jigging spoon",
    sizes: "1.25–2 in", when: "Through the ice, and over deep summer structure",
    waters: ["lake"], regions: ALL, certainty: "established",
    note: "Start near bottom and work up if you're marking fish higher. Once you find the school, stay on it — perch shoal tight.",
  },
  {
    speciesSlug: "white-perch", method: "spin", kind: "lure", name: "Small jig or inline spinner",
    sizes: "1/16 – 1/4 oz", when: "Summer evenings",
    waters: ["lake", "estuary", "river"], regions: ALL,
    namedWaters: ["Mactaquac headpond", "Maquapit Lake", "Hampton, Kennebecasis River", "Johnstons River, PEI"],
    certainty: "established",
    note: "Fish river mouths, headpond current seams and pond inlets where fresh meets brackish — perch stack up on those transitions.",
  },
  {
    speciesSlug: "white-perch", method: "bait", kind: "bait", name: "Bobber and worm",
    sizes: "Size 6–10 hook", when: "Any time, and the best thing to hand a beginner",
    waters: ["lake", "estuary", "river"], regions: ALL, certainty: "established",
    note: "The guide is direct about this: a simple bobber rig out-produces more complicated presentations for white perch. Small minnows work the same way.",
  },
  {
    speciesSlug: "white-perch", method: "fly", kind: "fly", name: "Small Woolly Bugger or bright streamer",
    patternRef: "Woolly Bugger",
    sizes: "8 – 12", when: "Summer evenings in brackish shallows",
    waters: ["estuary", "lake"], regions: ALL, certainty: "local",
    note: "Not in the guide's gear table, and offered as the fly-rod equivalent of the small jig rather than as established local practice. On a 4–5 wt in a barrier-beach pond it is a very good evening.",
  },

  // =========================================================================
  // TROUT — BROWN & RAINBOW
  // =========================================================================
  {
    speciesSlug: "brown-trout", method: "fly", kind: "fly", name: "Woolly Bugger",
    patternRef: "Woolly Bugger",
    sizes: "4 – 10", when: "After dark, and any low light",
    waters: ["river", "lake"], regions: ["NB", "NS"],
    namedWaters: ["Mersey River, NS"], certainty: "established",
    note: "Browns key on sound and vibration once the light is gone. Swing or strip it slowly through deep pools and undercuts — slow pulsing beats fast stripping after dark.",
  },
  {
    speciesSlug: "brown-trout", method: "fly", kind: "fly", name: "Dave's Hopper",
    patternRef: "Dave's Hopper",
    sizes: "6 – 12", when: "Last hour of daylight, summer",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "A large attractor drifted over an undercut bank at dusk draws a deliberate rise from fish that ignored everything small all afternoon.",
  },
  {
    speciesSlug: "brown-trout", method: "fly", kind: "fly", name: "Muddler Minnow",
    patternRef: "Muddler Minnow",
    sizes: "4 – 10", when: "Full dark, deep pools",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "Enough bulk to push water where a fish can only feel it. Bring a red-mode headlamp and know the water before you fish it in the dark.",
  },
  {
    speciesSlug: "brown-trout", method: "spin", kind: "lure", name: "Inline spinner",
    sizes: "size 1–3", when: "Dusk and dawn, spring and autumn",
    waters: ["river"], regions: ["NB", "NS"],
    namedWaters: ["Saint John River", "MacPhersons Lake, NS", "Garden of Eden Lake, NS"],
    certainty: "established",
    note: "The guide says inline spinners are close to all you need for stream browns — flash and vibration draw strikes even in poor light. Cast upstream into runs and pools.",
  },
  {
    speciesSlug: "brown-trout", method: "spin", kind: "lure", name: "Minnow plug",
    sizes: "2–4 in", when: "Low light, high or stained water",
    waters: ["river"], regions: ["NB", "NS"], certainty: "established",
    note: "Worked across and slightly upstream so it swims past a holding lie rather than straight at it.",
  },
  {
    speciesSlug: "rainbow-trout", method: "fly", kind: "fly", name: "Pheasant Tail Nymph",
    patternRef: "Pheasant Tail Nymph",
    sizes: "12 – 18", when: "Clear water, selective river fish",
    waters: ["river", "lake"], regions: ALL,
    namedWaters: ["Morell River, PEI", "Bras d'Or Lakes"], certainty: "established",
    note: "Named in the guide's gear table. Dead-drifted under an indicator or on a tight line through seams and pocket water.",
  },
  {
    speciesSlug: "rainbow-trout", method: "fly", kind: "fly", name: "Gold-Ribbed Hare's Ear",
    patternRef: "Gold-Ribbed Hare's Ear",
    sizes: "12 – 16", when: "Nothing rising, any water",
    waters: ["river", "lake"], regions: ALL, certainty: "established",
    note: "The other nymph the gear table names. Carry both and let the refusals pick.",
  },
  {
    speciesSlug: "rainbow-trout", method: "fly", kind: "fly", name: "Small streamer",
    patternRef: "Mickey Finn",
    sizes: "6 – 10", when: "Fish actively chasing baitfish",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "Short sharp pulls rather than a steady strip. Stocked lake fish will chase one far more readily than a wary river fish.",
  },
  {
    speciesSlug: "rainbow-trout", method: "spin", kind: "lure", name: "Small inline spinner",
    sizes: "1/16 – 1/8 oz", when: "All season, and the better choice in wind or murk",
    waters: ["river", "lake"], regions: ALL,
    namedWaters: ["Albro Lake, Halifax", "Valleyfield River, PEI", "Naufrage River, PEI"],
    certainty: "established",
    note: "Cast across and slightly upstream and let it swing through the seam — rainbows hit a natural swing harder than a lure stripped straight back. Barbless single hooks are required during PEI's extended season.",
  },
  {
    speciesSlug: "rainbow-trout", method: "spin", kind: "lure", name: "Small spoon",
    sizes: "1/8 – 1/4 oz", when: "Stocked lakes, and deeper river pools",
    waters: ["lake", "river"], regions: ALL, certainty: "established",
    note: "Flash and vibration are the trigger. Lake stockers are far less selective than river fish and will take one readily.",
  },

  // =========================================================================
  // FLOUNDER, DOGFISH, REDFISH — bottom and bycatch
  // =========================================================================
  {
    speciesSlug: "winter-flounder", method: "bait", kind: "bait", name: "Hi-lo bottom rig with sandworm or clam",
    sizes: "Size 6–10 long-shank hooks, pyramid sinker", when: "Spring and early summer, high-to-falling tide",
    waters: ["estuary", "salt"], regions: ALL,
    namedWaters: ["Eastern Passage / McCormacks Beach, NS", "Old Rustico breakwater, PEI", "Northport Harbour, PEI", "Dipper Harbour wharf, NB"],
    certainty: "established",
    note: "The standard Maritime shore setup, straight from the guide. Small baits — flounder pick rather than inhale. Let them mouth it a few seconds, then a firm steady sweep, never a snap.",
  },
  {
    speciesSlug: "winter-flounder", method: "spin", kind: "lure", name: "Small jig tipped with bait",
    sizes: "1/8 – 1/2 oz", when: "Sandy or soft bottom, clear shallow water",
    waters: ["estuary", "salt"], regions: ALL, certainty: "established",
    note: "Bounced slowly along the bottom. Flounder will not chase, so the job is keeping it in front of them, not covering water.",
  },
  {
    speciesSlug: "spiny-dogfish", method: "bait", kind: "bait", name: "Bottom rig with cut bait and a wire leader",
    sizes: "30–50 lb+ leader", when: "Warm months, anywhere you're bottom fishing",
    waters: ["salt", "estuary"], regions: ALL,
    namedWaters: ["Digby Harbour wharf", "Halifax Harbour"], certainty: "established",
    note: "You will not be trying for these. Wire or heavy mono because their teeth cut light leader, a dehooker because they swallow deep, and gloves because of the dorsal spines.",
  },
  {
    speciesSlug: "spiny-dogfish", method: "spin", kind: "lure", name: "Metal jig",
    sizes: "1–4 oz", when: "Summer, deeper water",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "They take a jig meant for cod or pollock readily. Handle carefully — the spines in front of each dorsal fin are venomous.",
  },
  {
    speciesSlug: "acadian-redfish", method: "bait", kind: "bait", name: "Deep dropper rig above a heavy sinker",
    sizes: "2–3 hooks, 8–16 oz sinker", when: "Deep-water charter trips only",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "Incidental on a cod or halibut trip in 150 m+, not a target. Barotrauma is near-certain from that depth — have a descending device aboard and plan release before you drop.",
  },
  {
    speciesSlug: "acadian-redfish", method: "spin", kind: "lure", name: "Heavy diamond or knife jig",
    sizes: "8–16 oz", when: "Shelf-edge jigging for cod and haddock",
    waters: ["salt"], regions: ALL, certainty: "established",
    note: "The same jigs that take cod at depth take redfish as bycatch. Short lifts a few feet off bottom, then reel steadily.",
  },

  // =========================================================================
  // THE BAIT FISHERIES — honest answers rather than blank pages
  // =========================================================================
  {
    speciesSlug: "gaspereau", method: "fly", kind: "fly", name: "Small white streamer",
    sizes: "8 – 12", when: "The spring run, commonly May",
    waters: ["river", "estuary"], regions: ALL,
    namedWaters: ["Gaspereau River, NS", "Miramichi River", "Boughton River, PEI"],
    certainty: "established",
    note: "Cast across or slightly downstream and swing it back at a swift, consistent pace — these are aggressive active fish during the run, not finesse targets. They fight and jump well above their weight.",
  },
  {
    speciesSlug: "gaspereau", method: "spin", kind: "lure", name: "Small light jighead",
    sizes: "1/32 – 1/16 oz", when: "The spring run at a fishway or current seam",
    waters: ["river", "estuary"], regions: ALL, certainty: "established",
    note: "Small terminal tackle for a small mouth. Work the pinch points where fish stack up waiting to move upstream.",
  },
  {
    speciesSlug: "atlantic-herring", method: "bait", kind: "bait", name: "Sabiki / herring rig under a wharf light",
    sizes: "Size 10–14 hooks", when: "After dark, summer and autumn",
    waters: ["salt"], regions: ALL,
    namedWaters: ["Halifax Harbour", "Herring Cove, NS", "Grand Manan Island", "Cocagne breakwater", "Souris Wharf, PEI"],
    certainty: "established",
    note: "Smaller hooks than a mackerel rig — herring have smaller mouths. Cast just outside the lit circle into the shadow line, let it sink, then short sharp wrist flicks. They hold deeper under the light than mackerel do.",
  },
  {
    speciesSlug: "american-eel", method: "bait", kind: "bait", name: "Cut bait on a simple bottom rig",
    sizes: "Size 4 – 1/0 hook, small egg sinker", when: "After dark, summer",
    waters: ["estuary", "river"], regions: ALL,
    namedWaters: ["Saint John River", "Bras d'Or Lakes", "Shubenacadie River", "Three Rivers, PEI"],
    certainty: "established",
    note: "Cast to soft bottom near cover and let it sit completely still. Oily cut fish — mackerel, herring, gaspereau — or worms. Expect a steady pull rather than a strike, and bring a lidded bucket; they will escape anything open.",
  },
  {
    speciesSlug: "atlantic-tomcod", method: "bait", kind: "bait", name: "Hi-lo rig with small bait strips",
    sizes: "Small hooks, clam or worm", when: "Spring to autumn incidentally; January on the run",
    waters: ["estuary"], regions: ALL,
    namedWaters: ["Shubenacadie River", "Cocagne River", "Shediac River"],
    certainty: "established",
    note: "The same flounder setup in deeper estuary channels, retrieved slowly with pauses on the bottom. The bite is subtle, like a flounder's. In January they push into the river mouths to spawn.",
  },
  {
    speciesSlug: "cunner", method: "bait", kind: "bait", name: "Small baited hook beside structure",
    sizes: "Size 6–10 hook, one split shot", when: "Any summer day, any wharf",
    waters: ["salt"], regions: ALL,
    namedWaters: ["Shediac Harbour", "Halifax Harbour", "Georgetown waterfront, PEI"],
    certainty: "established",
    note: "Clam strip or worm, dropped straight down beside a piling. No casting, no retrieve. When the striper fishing is slow this is how you keep a rod bent.",
  },
  {
    speciesSlug: "sculpin", method: "bait", kind: "bait", name: "Hi-lo bottom rig, or a bait-tipped jig",
    sizes: "Small hooks or 1/8–1/4 oz jig", when: "Any time you're bottom fishing an estuary",
    waters: ["estuary", "salt"], regions: ALL,
    namedWaters: ["Bay of Fundy and St. Mary's Bay", "Cocagne Cove", "Boughton Bay, PEI"],
    certainty: "established",
    note: "Incidental on flounder gear. In clear shallow water they can be sight-fished — drop a small bait-tipped jig right beside one and it will lunge. Keep a rag handy; the head and gill-cover spines will prick you.",
  },
];

// ---------------------------------------------------------------------------
// What each recommendation is called on a package
// ---------------------------------------------------------------------------

/**
 * The words someone might actually have typed into their Tackle Box for each thing.
 *
 * A fly has one true name and the pattern library holds it, so flies need nothing here.
 * A lure does not: "Metal casting spoon" is a description, and the item in your box is
 * called a Kastmaster, a Little Cleo, or "silver spoon 3/4". Matching the description
 * word-for-word would never fire, and matching any single word of it ("small", "metal")
 * would fire on everything. So each descriptive recommendation carries the trade names
 * and archetype words that mean it, and an item matches if it contains any one of them.
 *
 * Brand names are here as vocabulary, not endorsement — they're the words that end up on
 * a label, which is the only reason they're useful.
 *
 * Keyed by the exact `name` on the recommendation, so a name used for several species
 * (an inline spinner is an inline spinner) is described once. scripts/validate-matcher.mjs
 * checks both directions: no orphan keys, and nothing left undescribed.
 */
export const GEAR_ALIASES: Record<string, string[]> = {
  // --- spinners and spinnerbaits -------------------------------------------
  "Inline spinner": ["inline spinner", "spinner", "mepps", "panther martin", "blue fox", "vibrax", "rooster tail"],
  "Small inline spinner": ["inline spinner", "spinner", "mepps", "panther martin", "blue fox", "vibrax", "rooster tail"],
  "Small jig or inline spinner": ["inline spinner", "spinner", "marabou jig", "jig head", "jighead"],
  Spinnerbait: ["spinnerbait", "spinner bait", "buzzbait", "buzz bait"],
  "Large bucktail spinner": ["bucktail", "double cowgirl", "musky spinner", "double blade"],

  // --- spoons ---------------------------------------------------------------
  "Metal casting spoon": ["spoon", "kastmaster", "hopkins", "casting jig", "krocodile"],
  "Small casting spoon": ["spoon", "little cleo", "dardevle", "daredevle", "krocodile", "phoebe"],
  "Small spoon": ["spoon", "little cleo", "phoebe", "krocodile", "acme"],
  "Trolling spoon": ["trolling spoon", "spoon", "sutton", "mooselook", "dardevle", "daredevle"],
  "Small jigging spoon": ["jigging spoon", "swedish pimple", "kastmaster", "spoon"],
  "Small casting spoon or metal jig": ["spoon", "metal jig", "casting jig", "mackerel jig", "kastmaster", "hopkins"],
  "Small casting spoon or curly-tail jig": ["spoon", "curly tail", "curlytail", "grub", "crappie jig", "mister twister"],
  "Metal jig or casting spoon": ["metal jig", "casting jig", "spoon", "mackerel jig", "kastmaster", "hopkins"],

  // --- jigs -----------------------------------------------------------------
  "Tube jig": ["tube"],
  "Metal jig": ["metal jig", "diamond jig", "casting jig", "vertical jig"],
  "Diamond jig": ["diamond jig", "hammered jig", "norwegian", "cod jig"],
  "Heavy diamond or knife jig": ["diamond jig", "knife jig", "speed jig", "butterfly jig"],
  "Bucktail jig with a soft-plastic trailer": ["bucktail", "swimbait trailer", "hair jig"],
  "Tiny bucktail jighead": ["bucktail", "micro jig", "ice jig", "teardrop", "jighead", "jig head"],
  "Small light jighead": ["jighead", "jig head", "marabou jig", "micro jig"],
  "Small jig or teardrop, tipped": ["teardrop", "ice jig", "micro jig", "tungsten jig", "jighead", "jig head"],
  "Small jig tipped with bait": ["jighead", "jig head", "bucktail"],
  "Teaser fly on a dropper above the jig": ["teaser", "dropper"],

  // --- soft plastics --------------------------------------------------------
  "Paddletail soft plastic on a jig head": ["paddletail", "paddle tail", "swimbait", "soft plastic", "shad body", "z-man", "keitech"],
  "Soft plastic worm, Texas rigged": ["texas rig", "senko", "stick worm", "plastic worm", "creature", "ribbon tail", "worm hook"],
  "Hollow-body frog": ["frog"],

  // --- hard baits -----------------------------------------------------------
  "Small crankbait": ["crankbait", "squarebill", "crank", "shad rap"],
  "Crankbait along a drop-off": ["crankbait", "crank", "deep diver", "deep crank"],
  "Minnow plug": ["minnow", "rapala", "jerkbait", "countdown", "x-rap"],
  "Swimming plug / minnow bait": ["swimming plug", "minnow", "jerkbait", "rapala", "x-rap", "husky", "bomber long a"],
  "Small jerkbait or spoon": ["jerkbait", "spoon", "dardevle", "daredevle", "husky jerk"],
  "Large jerkbait or glide bait": ["glide bait", "glidebait", "jerkbait", "glider", "musky"],
  "Topwater popper or walker": ["popper", "topwater", "walker", "spook", "whopper plopper"],
  "Topwater popper or walking plug": ["popper", "topwater", "walk the dog", "spook", "stickbait", "pencil popper"],
  "Topwater walker": ["topwater", "walker", "spook", "popper", "zara"],
  "Stickbait or heavy popper": ["stickbait", "popper", "gt popper", "sinking stickbait"],
  "Shad dart": ["shad dart", "dart"],

  // --- rigs and bait --------------------------------------------------------
  "Fresh-cut mackerel or gaspereau on a bottom rig": ["bottom rig", "fish finder", "egg sinker", "circle hook", "bait rig"],
  "Worm on a light rig": ["worm", "bait hook", "split shot"],
  "Bobber and worm": ["bobber", "float rig", "worm", "bait hook"],
  "Sabiki / feather rig": ["sabiki", "feather rig", "mackerel rig", "bait rig"],
  "Sabiki / herring rig under a wharf light": ["sabiki", "herring rig", "bait rig", "mackerel rig"],
  "High-low rig with fresh cut bait": ["high low", "hi lo", "high-low", "dropper loop", "bottom rig", "bank sinker", "pyramid sinker"],
  "Hi-lo bottom rig with sandworm or clam": ["hi lo", "high low", "high-low", "bottom rig", "flounder rig"],
  "Hi-lo rig with small bait strips": ["hi lo", "high low", "high-low", "bottom rig"],
  "Hi-lo bottom rig, or a bait-tipped jig": ["hi lo", "high low", "high-low", "bottom rig", "jighead", "jig head"],
  "Bottom rig with cut bait and a wire leader": ["bottom rig", "wire leader", "wire trace"],
  "Cut bait on a simple bottom rig": ["bottom rig", "egg sinker", "bait hook"],
  "Deep dropper rig above a heavy sinker": ["dropper", "bottom rig", "bank sinker", "deep drop"],
  "Small baited hook beside structure": ["bait hook", "split shot"],
  "Oily herring strip on a bottom or float rig": ["bottom rig", "float rig", "herring"],
  "Live or fresh mackerel, set by the crew": ["circle hook", "live bait", "mackerel bait"],

  // --- flies with no single canonical pattern -------------------------------
  "Small white streamer": ["white streamer", "streamer", "bucktail"],
  "Small streamer on an ultralight rod": ["streamer", "bucktail", "smelt fly"],
  "Large baitfish fly on a 12 wt": ["baitfish fly", "deceiver", "brush fly", "tuna fly"],
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function forSpecies(slug: string): Recommendation[] {
  return RECOMMENDATIONS.filter((r) => r.speciesSlug === slug);
}

/** Every distinct lure, fly or rig named, for browsing the other way round. */
export interface GearEntry {
  name: string;
  kind: Recommendation["kind"];
  method: Method;
  patternRef?: string;
  species: string[];
  recommendations: Recommendation[];
}

export function allGear(): GearEntry[] {
  const map = new Map<string, GearEntry>();
  for (const r of RECOMMENDATIONS) {
    const entry =
      map.get(r.name) ??
      { name: r.name, kind: r.kind, method: r.method, patternRef: r.patternRef, species: [], recommendations: [] };
    if (!entry.species.includes(r.speciesSlug)) entry.species.push(r.speciesSlug);
    entry.recommendations.push(r);
    map.set(r.name, entry);
  }
  return [...map.values()].sort(
    (a, b) => b.species.length - a.species.length || a.name.localeCompare(b.name)
  );
}

/**
 * Where each named water actually is.
 *
 * A water cannot inherit its province from the fish. Striped bass are recommended for all
 * three provinces, so taking the province of "Mactaquac headpond" from the recommendation
 * it appears on files a New Brunswick headpond under PEI — which is exactly what the first
 * version of this did, and what the province filter on the waters tab was quietly
 * reporting. A few genuinely span a boundary (the Northumberland Strait has all three
 * shores) and carry more than one.
 *
 * scripts/validate-matcher.mjs checks both directions, so a named water can't be added to
 * a recommendation without being placed here.
 */
export const WATER_PROVINCE: Record<string, Province[]> = {
  "Albro Lake, Halifax": ["NS"],
  "Anagance River": ["NB"],
  "Annapolis River": ["NS"],
  "Bay of Fundy and St. Mary's Bay": ["NB", "NS"],
  "Beaver Harbour": ["NB"],
  "Belleisle Bay": ["NB"],
  "Blacks Harbour": ["NB"],
  "Boughton Bay, PEI": ["PEI"],
  "Boughton River, PEI": ["PEI"],
  "Bras d'Or Lakes": ["NS"],
  "Cocagne Cove": ["NB"],
  "Cocagne River": ["NB"],
  "Cocagne breakwater": ["NB"],
  "Digby Harbour wharf": ["NS"],
  "Dipper Harbour wharf, NB": ["NB"],
  "Douglas Lake, NB": ["NB"],
  "East Point, PEI": ["PEI"],
  "Eastern Passage / McCormacks Beach, NS": ["NS"],
  "First, Second and Third Lakes, NB": ["NB"],
  "French Lake, NB": ["NB"],
  "Garden of Eden Lake, NS": ["NS"],
  "Gaspereau River, NS": ["NS"],
  "Georgetown waterfront, PEI": ["PEI"],
  "Grand Lake, Halifax County NS": ["NS"],
  "Grand Lake, NB": ["NB"],
  "Grand Manan Island": ["NB"],
  "Halifax Harbour": ["NS"],
  "Hampton, Kennebecasis River": ["NB"],
  "Herring Cove, NS": ["NS"],
  "Hillsborough River, Charlottetown": ["PEI"],
  "Johnstons River, PEI": ["PEI"],
  "Little Lepreau": ["NB"],
  "Little River, Salisbury NB": ["NB"],
  "Loch Lomond, NB": ["NB"],
  "MacPhersons Lake, NS": ["NS"],
  "Mactaquac headpond": ["NB"],
  "Malpeque Bay": ["PEI"],
  "Maquapit Lake": ["NB"],
  "Margaree River": ["NS"],
  "Martins Wharf": ["NB"],
  "Mersey River, NS": ["NS"],
  "Middle and Upper Tetagouche Lake, NB": ["NB"],
  "Miramichi River": ["NB"],
  "Miramichi River estuary": ["NB"],
  "Morell River, PEI": ["PEI"],
  "Naufrage River, PEI": ["PEI"],
  "North Lake, PEI": ["PEI"],
  "Northport Harbour, PEI": ["PEI"],
  "Northumberland Strait": ["NB", "NS", "PEI"],
  "Old Rustico breakwater, PEI": ["PEI"],
  "Oromocto Lake": ["NB"],
  "Pointe-du-Chêne Wharf": ["NB"],
  "Pollett River": ["NB"],
  "Portapique River": ["NS"],
  "Prosser Brook": ["NB"],
  "Restigouche River": ["NB"],
  "Reversing Falls West shuttle dock": ["NB"],
  "Rustico and Cavendish beaches, PEI": ["PEI"],
  "Saint John River": ["NB"],
  "Saint John River at Mactaquac": ["NB"],
  "Shediac Harbour": ["NB"],
  "Shediac River": ["NB"],
  "Shubenacadie River": ["NS"],
  "Souris Wharf, PEI": ["PEI"],
  "St. Andrews, NB": ["NB"],
  "Stewiacke River": ["NS"],
  "Three Rivers, PEI": ["PEI"],
  "Valleyfield River, PEI": ["PEI"],
  "Washademoak Lake": ["NB"],
  "West Point / Jacques Cartier beach, PEI": ["PEI"],
};

/** Every named water mentioned, with what's been reported there and on what. */
export interface WaterEntry {
  water: string;
  species: string[];
  gear: string[];
  regions: Province[];
}

export function allNamedWaters(): WaterEntry[] {
  const map = new Map<string, WaterEntry>();
  for (const r of RECOMMENDATIONS) {
    for (const w of r.namedWaters ?? []) {
      const entry =
        map.get(w) ?? { water: w, species: [], gear: [], regions: WATER_PROVINCE[w] ?? [] };
      if (!entry.species.includes(r.speciesSlug)) entry.species.push(r.speciesSlug);
      if (!entry.gear.includes(r.name)) entry.gear.push(r.name);
      map.set(w, entry);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.species.length - a.species.length || a.water.localeCompare(b.water)
  );
}

// ---------------------------------------------------------------------------
// Matching against what's actually in your boxes
// ---------------------------------------------------------------------------

/**
 * Whether something in your boxes plausibly *is* this recommendation.
 *
 * Best-effort by design, and the interface says so. Gear is named by hand — "Clouser
 * chart/white 1/0", "green machine size 6", "silver spoon 3/4 oz" — so an exact match
 * would almost never fire. Two rules, because named patterns and described lures behave
 * differently:
 *
 *   a fly with a pattern name — every distinctive word of the pattern must appear. "Grey
 *     Ghost" needs both words, so an olive Woolly Bugger in grey doesn't claim it.
 *   anything described rather than named — any one of its aliases is enough, since the
 *     item in your box is called a Kastmaster rather than "metal casting spoon".
 *
 * It will occasionally be generous. It's a badge that saves you a trip to the garage, not
 * an inventory audit, and OWNED_CAVEAT says so on screen.
 */
export interface OwnedLike {
  name: string;
  category?: string;
  specs?: Record<string, string | boolean>;
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Words too common to carry a match on their own.
 *
 * Includes the fly *type* words — nymph, streamer, wet — because nobody writes the full
 * name on a compartment lid. A box labelled "Pheasant Tail #16" is a Pheasant Tail Nymph,
 * and "Clouser chart/white" is a Clouser Deep Minnow. Dropping those words is what makes
 * the badge fire on real inventories rather than only on textbook ones.
 */
const STOP = new Set([
  "jig", "fly", "lure", "small", "large", "soft", "plastic", "metal", "casting",
  "spoon", "or", "and", "on", "a", "an", "the", "with", "head", "rig", "bait",
  "pattern", "above", "beside", "under", "from", "for", "tipped", "light", "heavy",
  "deep", "nymph", "streamer", "wet", "dry", "size", "hook",
]);

function haystack(item: OwnedLike): string {
  return normalise(
    [item.name, item.specs?.fly_pattern, item.specs?.lure_type, item.specs?.other_kind]
      .filter((v): v is string => typeof v === "string")
      .join(" ")
  );
}

export function ownsMatch(item: OwnedLike, rec: Recommendation): boolean {
  const hay = haystack(item);
  if (!hay) return false;

  if (rec.patternRef) {
    // A real pattern name: every distinctive word of it, in any order. "Clouser Deep
    // Minnow" matches "Clouser minnow chartreuse" but not "deep diving crankbait".
    const words = normalise(rec.patternRef)
      .split(" ")
      .filter((w) => w.length > 2 && !STOP.has(w));
    if (words.length === 0) return hay.includes(normalise(rec.patternRef));
    return words.every((w) => hay.includes(w));
  }

  const aliases = GEAR_ALIASES[rec.name];
  if (aliases) return aliases.some((a) => hay.includes(normalise(a)));

  // No aliases written for it yet — fall back to the strict rule rather than to a
  // guess, so a gap in the table shows up as a missing badge, not a false one.
  const words = normalise(rec.name)
    .split(" ")
    .filter((w) => w.length > 2 && !STOP.has(w));
  if (words.length === 0) return false;
  return words.every((w) => hay.includes(w));
}

export function matchOwned<T extends OwnedLike>(items: T[], rec: Recommendation): T[] {
  return items.filter((i) => ownsMatch(i, rec));
}

/** How much of what works for a species you already own. */
export function coverage(items: OwnedLike[], recs: Recommendation[]): { owned: number; total: number } {
  return {
    owned: recs.filter((r) => items.some((i) => ownsMatch(i, r))).length,
    total: recs.length,
  };
}

export const MATCHER_CAVEAT =
  "Starting points, not rules. Region-level guidance holds broadly; anything tied to a named water is a report rather than a promise, and worth confirming locally before you drive three hours on it.";

export const OWNED_CAVEAT =
  "Matched by name against your Tackle Box and Fly Box, so it depends on what you called things. A miss here means the name didn't match, not necessarily that you don't own one.";
