// Saltwater, as its own thing.
//
// Split out because salt is not fresh water with a different fish in it. The tide decides
// when you go rather than the clock; the fish move rather than hold; almost all the access
// is a wharf or a beach someone else controls; and the water actively destroys your gear
// between trips. None of that has an equivalent in a trout stream.
//
// Covers both rods deliberately. A spinning angler and a fly angler on the same wharf are
// solving the same problem — find moving water, find bait, be there on the right half of
// the tide — and only diverge at the last two feet of line. Splitting salt into a spinning
// section and a fly section would repeat the first three quarters of every page.
//
// What's here is regional and grounded: the species, wharves, bays and rivers named all
// come from research/*.json. What isn't here: offshore, which in this region means a
// charter, and the charter operator's briefing beats anything an app can tell you.

import type { Province } from "@/types/content";

export type SaltTopic = "different" | "tide" | "where" | "gear" | "targets" | "access" | "care";

export interface SaltSection {
  id: SaltTopic;
  title: string;
  blurb: string;
}

export const SALT_SECTIONS: SaltSection[] = [
  { id: "different", title: "What's different", blurb: "Why salt isn't fresh water with bigger fish in it." },
  { id: "tide", title: "Reading the tide", blurb: "The single biggest variable, and the one you can plan around." },
  { id: "where", title: "Where to stand", blurb: "Structure, current and bait — how to pick a spot you've never seen." },
  { id: "gear", title: "Gear", blurb: "Spinning and fly, side by side, and what salt demands of both." },
  { id: "targets", title: "What you'll meet", blurb: "The Maritime saltwater quarry, honestly ranked by how likely you are to catch one." },
  { id: "access", title: "Wharves and access", blurb: "Working harbours have rules, and most of them are unwritten." },
  { id: "care", title: "Afterwards", blurb: "The ten minutes that decide whether your gear lasts five years or one." },
];

// ---------------------------------------------------------------------------
// What's different
// ---------------------------------------------------------------------------

export interface Difference {
  heading: string;
  body: string;
}

export const DIFFERENCES: Difference[] = [
  {
    heading: "The fish are moving, not holding",
    body: "A trout picks a lie behind a rock and stays in it. A school of mackerel is somewhere else in twenty minutes, and striped bass follow bait up an estuary on the flood and back down on the ebb. You are not casting to a spot, you are intercepting a route — which is why local knowledge in salt is about timing at least as much as it is about place.",
  },
  {
    heading: "The water level is the variable, not the weather",
    body: "In a river you check the flow before you go. In salt you check the tide, and the difference between the right two hours and the wrong two hours at the same wharf is total. The Bay of Fundy end of this region has among the largest tides on earth; the Northumberland Strait side is far smaller but still decides everything.",
  },
  {
    heading: "Bait is visible, and it tells you what to do",
    body: "Diving birds, nervous water, mackerel skipping clear — surface signs in salt are the most reliable information you will get all day, and they have no real freshwater equivalent. When you can see what the fish are eating, matching the size of it matters more than matching the colour.",
  },
  {
    heading: "Salt destroys tackle, slowly, between trips",
    body: "Not while you fish — afterwards, in the box, in the car. Bearings, hook points, split rings, reel seats, guide frames. This is the single most common way Maritime anglers ruin gear, and it is entirely preventable in ten minutes. See Afterwards.",
  },
  {
    heading: "The rules come from a different place",
    body: "Freshwater angling here is provincial. Tidal water is federal — DFO — and the two have different licences, different seasons and different bag limits for fish that swim between them. Striped bass and Atlantic salmon are the obvious cases: the same fish is governed by different rules on either side of the tide line.",
  },
  {
    heading: "It is more exposed than it looks",
    body: "A breakwater with a metre of chop over it, a beach with an outgoing tide and a wind against it, or an unfamiliar wharf ladder at night are all genuinely hazardous in a way a riverbank is not. Cold water is the underlying reason — see the Safety section, which is built around exactly this.",
  },
];

// ---------------------------------------------------------------------------
// Tide
// ---------------------------------------------------------------------------

export interface TideWindow {
  window: string;
  what: string;
  why: string;
}

/**
 * Why moving water and not high water.
 *
 * The common beginner mistake is to plan around "high tide" as a moment. What matters is
 * flow: fish feed when water is moving because moving water delivers food past a fixed
 * position and disorients it on the way. Slack is the dead part of the cycle at both ends.
 */
export const TIDE_WINDOWS: TideWindow[] = [
  {
    window: "Last two hours of the flood",
    what: "Usually the best window on a beach, flat or estuary",
    why: "Water is pushing bait up onto ground that was dry an hour ago, and predators come with it. On a sandbar or a flat this is when fish arrive within casting range of where you're standing.",
  },
  {
    window: "High slack",
    what: "The quiet half-hour",
    why: "Nothing is moving, so nothing is being delivered anywhere. Eat your sandwich, move to your next spot, or fish deeper water where the change matters less.",
  },
  {
    window: "First three hours of the ebb",
    what: "The best window at a river mouth or a channel",
    why: "Everything the flood pushed up is now being drained back through a narrow gap, and predators sit in that gap and wait. A river mouth on the ebb is the most reliable pattern in Maritime striped bass fishing.",
  },
  {
    window: "Low slack",
    what: "Worst on the flats, best for reading the ground",
    why: "Almost always slow. It is, however, the only time you can see the structure you have been fishing blind — walk the exposed bottom and note the channels, bars and rockpiles for next time.",
  },
];

export const TIDE_NOTES = [
  "Fish the moving water, not the number. The height at the top of the tide matters far less than whether it is running.",
  "A bigger tide moves more water in the same six hours, so spring tides around the new and full moon push harder than neap tides — more current, better feeding, and more of both than you may want on an exposed rock.",
  "Wind against tide stands the water up. It is a good sign for feeding and a bad one for standing anywhere with waves.",
  "The tide turns later the further up an estuary you go — sometimes by an hour or more from the harbour mouth. The published station time is the harbour, not your spot.",
];

// ---------------------------------------------------------------------------
// Where
// ---------------------------------------------------------------------------

export interface SpotType {
  kind: string;
  read: string;
  fish: string;
}

export const SPOT_TYPES: SpotType[] = [
  {
    kind: "River mouth / estuary",
    read: "Look for the seam where river water meets salt — usually a visible colour or texture line. Fish the edge of it, not the middle.",
    fish: "Striped bass, sea-run brook trout, gaspereau on the spring run, smelt, flounder in the channels.",
  },
  {
    kind: "Wharf and breakwater",
    read: "Pilings, the corner where the structure turns, and the current seam that forms downtide of it. Fish tight to the structure first — most people cast past everything.",
    fish: "Mackerel, pollock, cunner around the pilings, striped bass on the seams, flounder on the sand nearby.",
  },
  {
    kind: "Rocky point or ledge",
    read: "Points force current around them and create a rip. The slack pocket behind the point is where fish sit; the rip is where you swing a lure or fly through.",
    fish: "Pollock, striped bass, mackerel when the schools are close.",
  },
  {
    kind: "Sand beach and bar",
    read: "Look for the trough between the beach and the first bar, and any cut through the bar where water drains on the ebb. Both are travel lanes.",
    fish: "Striped bass, flounder, mackerel when they push in.",
  },
  {
    kind: "Harbour flats and channel edges",
    read: "Soft mud or sand in shallow water, with a channel edge to drop into. Fish the edge on the falling tide.",
    fish: "Winter flounder above all, plus tomcod and sculpin on the same bottom rig.",
  },
];

// ---------------------------------------------------------------------------
// Gear
// ---------------------------------------------------------------------------

export interface GearRow {
  item: string;
  spin: string;
  fly: string;
}

/**
 * Deliberately a comparison rather than two lists.
 *
 * Someone who fishes one and is curious about the other learns more from seeing the same
 * job solved twice than from two separate pages that never mention each other.
 */
export const GEAR_COMPARISON: GearRow[] = [
  {
    item: "Rod",
    spin: "7–9 ft medium-heavy for stripers off a beach or wharf; 6–7 ft light for mackerel and flounder. Length buys casting distance, which off a beach is most of the game.",
    fly: "8–9 wt for stripers and general salt; 6–8 wt is plenty for mackerel and pollock off a wharf. A 10 wt only if you are casting into real wind all day.",
  },
  {
    item: "Reel",
    spin: "Sealed or at least salt-rated, with a smooth drag and 150+ yards of 15–20 lb braid. A cheap freshwater reel will work for a season and then seize.",
    fly: "Large-arbor with a genuine sealed drag and 150+ yards of backing. In salt the reel stops being a line holder and starts doing real work.",
  },
  {
    item: "Line",
    spin: "15–20 lb braid with a 20–30 lb fluorocarbon or mono leader. Braid's thin diameter and lack of stretch matter for distance and for feeling a take at range.",
    fly: "Intermediate line covers the most water here; a floater for topwater and shallow flats, a fast sinker for jigging structure. A cold-water line goes stiff and coils in Maritime salt — buy one rated for temperate water.",
  },
  {
    item: "The last two feet",
    spin: "Swap trebles for single inline hooks on anything you'll use for striped bass — barbless singles are mandatory there — and check hook points constantly. Salt blunts and rusts them fast.",
    fly: "Straight 20–30 lb fluorocarbon is a perfectly good salt leader; there is no need for a delicate taper. Add a short heavy bite section only for pickerel or mackerel, which will cut through light material.",
  },
  {
    item: "Carrying it",
    spin: "A shoulder bag with a few boxes beats a tackle box you have to set down on a wet wharf.",
    fly: "A stripping basket is close to essential off a beach or a wharf — without one your line goes under the rocks, around your feet, or out with the tide.",
  },
  {
    item: "On your feet",
    spin: "Wharf timber and weed-covered rock are far more slippery than they look. Studded soles or boot cleats are worth more than most tackle.",
    fly: "The same, plus the reminder that waders in salt with a running tide is a genuinely different risk calculation than waders in a river. Wear a belt.",
  },
];

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

export interface SaltTarget {
  slug: string;
  name: string;
  difficulty: "Easy" | "Reliable" | "Work for it" | "Charter";
  season: string;
  where: string;
  regions: Province[];
  note: string;
}

/**
 * Ranked by how likely a newcomer is to actually catch one, not by prestige.
 *
 * A guide that leads with bluefin tuna is written for the author. Mackerel and cunner are
 * what a beginner on a wharf will hook, and being honest about that is more useful than
 * being aspirational. Every entry corresponds to a species guide in research/.
 */
export const SALT_TARGETS: SaltTarget[] = [
  {
    slug: "atlantic-mackerel", name: "Atlantic mackerel", difficulty: "Easy",
    season: "Summer, once the schools arrive",
    where: "Any working wharf or breakwater with deep water beside it",
    regions: ["NB", "NS", "PEI"],
    note: "The best first saltwater fish there is. They arrive in numbers, hit almost anything bright moving fast, and fight well above their size. Carry both a spoon and a Sabiki.",
  },
  {
    slug: "cunner", name: "Cunner", difficulty: "Easy",
    season: "All summer",
    where: "Beside any piling, breakwater or rockpile",
    regions: ["NB", "NS", "PEI"],
    note: "Small bait, small hook, dropped straight down. Genuinely no technique required, which makes it the right thing to hand a child while you wait for something else.",
  },
  {
    slug: "winter-flounder", name: "Winter flounder", difficulty: "Reliable",
    season: "Spring and early summer",
    where: "Soft mud or sand flats, channel edges, harbour mouths",
    regions: ["NB", "NS", "PEI"],
    note: "A patient, stationary fishery on a hi-lo rig with sandworm or clam. They will not chase — the job is putting the bait in front of them and resisting the first tap.",
  },
  {
    slug: "pollock", name: "Pollock", difficulty: "Reliable",
    season: "All season, best at dusk",
    where: "Wharves, breakwaters, rocky points and ledges with moving water",
    regions: ["NB", "NS", "PEI"],
    note: "Hard-fighting, willing, and badly under-fished. One of the best saltwater fly targets in the region and almost nobody targets them with one.",
  },
  {
    slug: "striped-bass", name: "Striped bass", difficulty: "Work for it",
    season: "Spring through autumn",
    where: "Estuaries, river mouths, beaches and wharves on the Northumberland Strait",
    regions: ["NB", "NS", "PEI"],
    note: "The region's marquee inshore fish and the reason most people buy a salt rod. Tide-dependent to the point of obsession. Barbless single hooks are mandatory and the retention slot is enforced — measure before you decide anything.",
  },
  {
    slug: "rainbow-smelt", name: "Rainbow smelt", difficulty: "Reliable",
    season: "Spring run, and through the ice in winter",
    where: "River mouths and the tide head of small coastal streams",
    regions: ["NB", "NS", "PEI"],
    note: "Tiny hooks and tiny baits. As much a social occasion as a fishery, especially the winter shack version.",
  },
  {
    slug: "atlantic-herring", name: "Atlantic herring", difficulty: "Reliable",
    season: "Summer and autumn, after dark",
    where: "Any wharf with a working light over the water",
    regions: ["NB", "NS", "PEI"],
    note: "Find the light and you have found the fish — that matters more than any specific spot. Sabiki gear, smaller hooks than for mackerel.",
  },
  {
    slug: "atlantic-tomcod", name: "Tomcod", difficulty: "Reliable",
    season: "Incidental spring–autumn; the run is in January",
    where: "Deeper estuary channels, on flounder gear",
    regions: ["NB", "NS", "PEI"],
    note: "Mostly a bonus on a flounder rig rather than a target. The January spawning run into river mouths is the exception.",
  },
  {
    slug: "sculpin", name: "Sculpin", difficulty: "Easy",
    season: "Any time you're bottom fishing",
    where: "Rocky and mixed bottom, estuary flats",
    regions: ["NB", "NS", "PEI"],
    note: "You will catch these whether or not you meant to. Worth knowing mainly so you handle one without getting spiked — the head and gill-cover spines are sharp.",
  },
  {
    slug: "spiny-dogfish", name: "Spiny dogfish", difficulty: "Reliable",
    season: "Warmer months",
    where: "Anywhere you're bottom fishing in tidal water",
    regions: ["NB", "NS", "PEI"],
    note: "An unwanted regular rather than a target. Wire or heavy leader because they cut light line, a dehooker because they swallow deep, and gloves because the dorsal spines are venomous.",
  },
  {
    slug: "american-eel", name: "American eel", difficulty: "Work for it",
    season: "Summer, after dark",
    where: "Soft bottom near cover in estuaries and tidal rivers",
    regions: ["NB", "NS", "PEI"],
    note: "Cut bait sat completely still. No retrieve, no lure — they hunt by smell. Bring a bucket with a lid that latches.",
  },
  {
    slug: "gaspereau", name: "Gaspereau", difficulty: "Reliable",
    season: "The spring run, commonly May",
    where: "River mouths, fishways and current seams",
    regions: ["NB", "NS", "PEI"],
    note: "A short, intense season. A small white streamer swung fast on light tackle is genuinely good sport, and dip-netting is legal in tidal water during the run in NB and NS.",
  },
  {
    slug: "atlantic-cod", name: "Atlantic cod", difficulty: "Work for it",
    season: "A very limited open season — check before you go",
    where: "Hard bottom and deep water, from a boat or a wharf over depth",
    regions: ["NB", "NS", "PEI"],
    note: "Numbers are a fraction of historical levels and the season is short and specific. Confirm the current open dates with DFO rather than assuming.",
  },
  {
    slug: "american-shad", name: "American shad", difficulty: "Work for it",
    season: "The spring run",
    where: "Tidal rivers — the Annapolis, Shubenacadie and Saint John systems",
    regions: ["NB", "NS"],
    note: "Not feeding on the run, so it is about putting a dart in their path repeatedly rather than fooling them. Fifty-fish days are reported on the Annapolis in the right week.",
  },
  {
    slug: "bluefin-tuna", name: "Bluefin tuna", difficulty: "Charter",
    season: "July – October",
    where: "Off North Lake, PEI, and the wider southern Gulf",
    regions: ["NB", "NS", "PEI"],
    note: "Book a licensed operator. There is no shore or small-boat version of this, the tackle is theirs, and the conservation fishery has its own hook, line and handling conditions.",
  },
  {
    slug: "acadian-redfish", name: "Acadian redfish", difficulty: "Charter",
    season: "Deep-water trips only",
    where: "150–300 m over the shelf edge",
    regions: ["NB", "NS", "PEI"],
    note: "Bycatch on a deep cod or halibut trip, never a target. Barotrauma from that depth is near-certain, so plan release before you drop.",
  },
];

export const DIFFICULTY_ORDER: SaltTarget["difficulty"][] = ["Easy", "Reliable", "Work for it", "Charter"];

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

export const ACCESS_RULES = [
  "A working wharf is a workplace first. Fishing boats, gear and trucks have priority over you at all times, and nobody will say so politely twice.",
  "Ask the local wharf authority or harbour authority before assuming access, especially on PEI where many wharves are actively commercial. Several of the best-known spots in the species guides carry exactly this caveat.",
  "Park where you're told and never in a turning area. A blocked wharf approach is how public access gets closed to everyone.",
  "Keep clear of ropes, traps and stacked gear, and never cast across a working boat.",
  "Take your line home. Monofilament left on a wharf ends up in a propeller or a bird.",
  "Beach access below the high-water mark is generally public, but the way you get there may cross private land. Use marked accesses.",
];

// ---------------------------------------------------------------------------
// Care
// ---------------------------------------------------------------------------

export interface CareStep {
  step: string;
  detail: string;
}

export const CARE_STEPS: CareStep[] = [
  {
    step: "Rinse the same day",
    detail: "Cool fresh water, low pressure, over the rod blank, guides, reel seat and reel exterior. The damage happens between trips, not during them, so 'I'll do it at the weekend' is how reels die.",
  },
  {
    step: "Never blast a reel",
    detail: "A pressure hose or a hard jet drives salt water past the seals and into the bearings — the exact place you were trying to protect. Gentle flow, or a damp cloth.",
  },
  {
    step: "Back the drag off",
    detail: "Slacken the drag before storage so the washers aren't held compressed for months. Set it again next trip.",
  },
  {
    step: "Dry before it's closed up",
    detail: "A damp box is worse than a wet rod. Leave lure trays open until everything in them is dry, or the hooks rust in place.",
  },
  {
    step: "Check and change hooks",
    detail: "Salt blunts and rusts points fast. Touch up or replace hooks and split rings far more often than you would in fresh water — a lost fish is almost always a hook you should have changed.",
  },
  {
    step: "Rinse your boots and net too",
    detail: "Rubber, mesh and stitching all degrade in salt, and a net bag is the thing you notice has rotted at exactly the wrong moment.",
  },
];

export const SALTWATER_CAVEAT =
  "General practice for this region, drawn from the species and location guides. Seasons, limits and access change — confirm regulations against DFO and your provincial guide, and confirm wharf access locally, before you fish.";
