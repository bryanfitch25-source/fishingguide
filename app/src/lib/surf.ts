// Surf fishing: the beach as its own discipline.
//
// WHY IT'S SEPARATE FROM /saltwater
//
// The Saltwater section is written from a wharf. You stand on a fixed structure over deep
// water, the fish come past, and the main variables are the tide and what's schooling.
// Almost none of that survives the walk to a beach.
//
// On a beach there is no structure — you have to find it under the water, by reading the
// surface. The fish are in a band a few metres wide that moves with the tide. Distance
// suddenly matters, which changes the rod, the line and the terminal tackle. And the sea
// is actively trying to knock you over, which turns safety from a paragraph into a
// section.
//
// So this covers what the wharf pages can't: reading a beach, timing a tide against a
// bar-and-trough system, casting into wind and swell, and the specific way beaches
// drown people.
//
// WHAT'S DELIBERATELY NOT HERE
//
// Named beaches. Sandbars move — a cut that fished beautifully last September may not
// exist this year, because the bar it drained through has migrated. Publishing "fish the
// third cut at X" would be both wrong within a season and a decent way to send someone to
// a spot they can't read. What's here instead is how to read any beach, which is durable
// and transfers.
//
// Access rules are also left to ACCESS_NOTES and to the provincial guides rather than
// restated per beach, for the same reason they aren't restated in the fly course: one
// source, linked, or the two copies drift.

import type { Province } from "@/types/content";

export type SurfTopic =
  | "different"
  | "reading"
  | "tide"
  | "conditions"
  | "gear"
  | "rigs"
  | "targets"
  | "safety";

export interface SurfSection {
  id: SurfTopic;
  title: string;
  blurb: string;
}

export const SURF_SECTIONS: SurfSection[] = [
  { id: "different", title: "What's different", blurb: "Why a beach isn't a wharf with sand." },
  { id: "reading", title: "Reading a beach", blurb: "The whole skill. Find the structure under the water from the surface." },
  { id: "tide", title: "Timing the tide", blurb: "Scout at low, fish at high — and why that order matters more here than anywhere." },
  { id: "conditions", title: "Wind, swell and water", blurb: "Some surf is the point. Too much is unfishable, and flat calm is hard." },
  { id: "gear", title: "Gear", blurb: "Longer rods, heavier line, and what a stripping basket is for." },
  { id: "rigs", title: "Rigs and lures", blurb: "Holding bottom in moving water, and what to throw when you're not." },
  { id: "targets", title: "What you'll meet", blurb: "What's actually catchable from a Maritime beach, honestly ranked." },
  { id: "safety", title: "Staying alive", blurb: "The feature that concentrates the fish is the one that drowns people." },
];

// ---------------------------------------------------------------------------
// What's different
// ---------------------------------------------------------------------------

export interface SurfDifference {
  heading: string;
  body: string;
}

export const SURF_DIFFERENCES: SurfDifference[] = [
  {
    heading: "There is no visible structure, so you have to read it",
    body: "A wharf tells you where to stand — beside the pilings, off the end, in the current. A beach looks identical for two kilometres and is not. Everything about surf fishing follows from learning to see the bars, troughs and cuts that are under the water, from the way the waves break over them.",
  },
  {
    heading: "The fish are in a narrow band, and it moves",
    body: "Most surf fish feed in the trough between the beach and the first bar, or along the edges of a cut draining through it. That band can be ten metres wide, and it shifts as the tide rises and falls. Being in the right place matters far more than casting far — which is the opposite of what most beginners assume.",
  },
  {
    heading: "Distance is a real constraint, sometimes",
    body: "Sometimes the fish are at your feet and a long cast lands beyond them. Sometimes the bar is 60 m out and you genuinely cannot reach it with trout gear. Surf tackle exists for the second case: longer rods, thinner braid and heavier leads, all in service of putting a bait or lure somewhere you otherwise couldn't.",
  },
  {
    heading: "The sea is doing something to your line at all times",
    body: "Waves push your line sideways, sweep sinkers down the beach, and pile slack at your feet. Holding bottom, keeping contact and detecting a take in moving water is a skill in itself, and it's why surf rigs look nothing like a lake rig.",
  },
  {
    heading: "It's mostly a dawn, dusk and night fishery",
    body: "Beaches are shallow and bright. Predators come in close when the light goes, and the same beach that was dead at noon can be alive at last light. If you only fish the middle of the day you will conclude, wrongly, that there's nothing there.",
  },
  {
    heading: "The consequences of a mistake are higher",
    body: "A wharf is a solid platform. Surf is moving water, uneven footing, cold, and a tide that can cut off the way you walked in. See the safety section — it's not a formality here.",
  },
];

// ---------------------------------------------------------------------------
// Reading a beach — the core skill
// ---------------------------------------------------------------------------

export interface BeachFeature {
  name: string;
  looks: string;
  why: string;
  fish: string;
}

/**
 * Beach anatomy, read from the surface.
 *
 * The visual cues here are the durable part of surf fishing and they're the same on any
 * sand beach anywhere: white water is shallow, flat dark water is deep, and the places
 * where those meet are where the fish are. Learn this and you can fish a beach you have
 * never seen before, which is the whole point.
 */
export const BEACH_FEATURES: BeachFeature[] = [
  {
    name: "The bar",
    looks: "A line of waves breaking well out from the beach, often with calmer water on both sides of it.",
    why: "A raised ridge of sand running roughly parallel to the shore. Waves feel the bottom there and break over it.",
    fish: "Not usually where the fish sit, but it's the landmark everything else is described from. The bar's edges — where it drops off — are worth a cast.",
  },
  {
    name: "The trough",
    looks: "A strip of darker, flatter water between the breaking waves and the beach itself.",
    why: "The channel scoured out between the beach and the bar. Deeper than either, and it runs the length of the beach.",
    fish: "The single most productive water on most beaches. Fish cruise it looking for anything the surf has dislodged, and it is often much closer in than people expect — sometimes within a rod length.",
  },
  {
    name: "The cut",
    looks: "A gap in the line of breaking waves. Flat, darker, often slightly discoloured, with white water on either side.",
    why: "Water pushed over the bar by waves has to get back out, and it drains through gaps in the bar. That outflow scours the gap deeper and keeps it open.",
    fish: "The best feature on any beach. It funnels every bit of dislodged food out through one narrow gap, and predators sit at its mouth and edges waiting. Fish the sides of a cut rather than the middle of the flow.",
  },
  {
    name: "The point",
    looks: "Anywhere the beach juts out and the waves wrap around it.",
    why: "It deflects current and creates a shear line between moving and slack water — the marine equivalent of a river seam.",
    fish: "Reliable, and easy to identify without reading anything. Fish the down-current side where the water is confused.",
  },
  {
    name: "Hard structure",
    looks: "Rock, groynes, breakwaters, mussel beds, wrecks, or a dark patch that never breaks the same way twice.",
    why: "Anything that isn't sand holds weed, holds crabs and small fish, and breaks the current.",
    fish: "Concentrates everything. Also eats terminal tackle — go heavier on leader and expect to lose some rigs.",
  },
  {
    name: "River and estuary mouths",
    looks: "Obvious. Often with a visible colour change and a line of foam where fresh meets salt.",
    why: "Fresh water carries food out, the temperature and salinity change over a short distance, and migratory fish stage there.",
    fish: "Arguably the best surf fishing in this region, particularly for striped bass and for sea-run trout in spring. Check the regulations carefully — estuary mouths often have their own rules and closures.",
  },
];

export const READING_STEPS = [
  "Walk the beach at dead low tide before you ever fish it. At low water the bars are exposed or nearly so, the cuts are obvious channels, and the troughs are visible as darker water. You are looking at the map of the place. Two hours of this beats a season of casting blind.",
  "Mark the cuts. Take a photo, drop a pin, or line them up against something permanent on land — a house, a headland, a gap in the dunes. At high tide the whole thing is underwater and featureless, and your landmark is how you find it again.",
  "Learn the two-colour rule: white, broken water is shallow; flat, dark water is deep. Where a line of white water stops and dark water starts, the bottom drops away — and that edge is worth a cast.",
  "Watch a set of waves all the way in. A wave breaks where it feels the bottom, so the pattern of where it breaks and where it doesn't draws the bottom for you.",
  "Look for the water going back out. Foam, weed and discoloured sand moving seaward through a gap is a cut doing its job, and it's carrying food with it.",
  "Look up. Diving terns and gulls, or bait flicking at the surface, override everything above — go there.",
  "Then fish close first. The trough is often within 15 m, and the standard beginner's mistake is a 60 m cast straight over the fish.",
];

// ---------------------------------------------------------------------------
// Tide
// ---------------------------------------------------------------------------

export interface SurfTideWindow {
  window: string;
  what: string;
}

export const SURF_TIDE_WINDOWS: SurfTideWindow[] = [
  {
    window: "Dead low",
    what: "The scouting window, not the fishing one. Walk it, photograph it, mark the cuts. Some beaches do fish at low, particularly deep ones and around river mouths, but the reconnaissance is worth more.",
  },
  {
    window: "The flood",
    what: "Usually the best of it. Rising water pushes fish over the bar and into the trough to feed on everything the earlier low water stranded. The last two or three hours of the flood are the classic window.",
  },
  {
    window: "High slack",
    what: "Often slower — the water stops moving and so does the food. Worth resting, moving, or eating something.",
  },
  {
    window: "The first of the ebb",
    what: "Frequently excellent and widely under-fished. Water draining off the flats and out through the cuts concentrates bait into a narrow outflow, and predators know it.",
  },
  {
    window: "Late ebb",
    what: "Fish drop back out. Follow them seaward if the beach lets you do that safely, and be very clear about your exit before you commit to standing anywhere.",
  },
];

export const SURF_TIDE_NOTES = [
  "Moving water beats slack water almost every time. If you can only fish two hours, take two hours of movement over four hours spanning a slack.",
  "Combine the tide with the light. A flooding tide arriving at dawn or dusk is the best of both, and it's worth planning a trip around.",
  "Tide times are for a station, not for your beach. Check the nearest station in Tides and expect the beach itself to run a little different — record what you actually see and your own notes will beat the table within a season.",
  "The tide is also your exit. Know when it turns before you walk out onto a bar or around a point.",
];

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

export interface SurfCondition {
  condition: string;
  verdict: "Good" | "Workable" | "Hard" | "Stay off";
  detail: string;
}

export const SURF_CONDITIONS: SurfCondition[] = [
  {
    condition: "Moderate surf — waves breaking, some white water",
    verdict: "Good",
    detail: "This is what you want. Breaking waves stir sand, dislodge worms and crabs, oxygenate the water and hide you completely. Fish move in close and feed with confidence.",
  },
  {
    condition: "Onshore wind",
    verdict: "Good",
    detail: "Pushes surface food and bait toward the beach and puts a chop on the water. Harder to cast into, and worth it. Go heavier and shorter on the leader rather than fighting it.",
  },
  {
    condition: "Coloured water after a blow",
    verdict: "Good",
    detail: "A day or two after weather, when the water has some colour but you can still see a hand's depth, is often the best fishing of the month. Use something with more vibration or a darker silhouette.",
  },
  {
    condition: "Dead flat calm and gin clear",
    verdict: "Hard",
    detail: "Nothing is being dislodged, and the fish can see everything including you. Go at night or first light, go finer and longer, and fish further out.",
  },
  {
    condition: "Offshore wind",
    verdict: "Workable",
    detail: "Flattens the surf and helps you cast a long way. It also usually means less bait movement in the shallows. Good for distance work to the bar, less good in the trough.",
  },
  {
    condition: "Heavy weed in the water",
    verdict: "Hard",
    detail: "You'll spend the session clearing your hooks after every cast. Move to a beach with a different aspect, or come back. Some weed is fine; a green tide is not fishable.",
  },
  {
    condition: "Big storm surf",
    verdict: "Stay off",
    detail: "Unfishable and genuinely dangerous — you cannot hold bottom, the water is full of weed, and the sea takes people off beaches and rocks in these conditions every year. Wait for it to drop.",
  },
];

// ---------------------------------------------------------------------------
// Gear
// ---------------------------------------------------------------------------

export interface SurfGearRow {
  item: string;
  spin: string;
  fly: string;
}

export const SURF_GEAR: SurfGearRow[] = [
  {
    item: "Rod",
    spin: "9–11 ft for most beach work, up to 12 ft if you genuinely need to reach a distant bar or hold line above heavy surf. A 9 ft rod covers the trough and the cuts, which is most of the fishing.",
    fly: "9 ft, 8–10 wt. Nine weight is the sensible middle for striped bass off a beach — enough to turn over a big fly into wind without being a chore all evening.",
  },
  {
    item: "Reel",
    spin: "4000–6000 size, ideally sealed. Sand and salt spray destroy bearings, and a beach reel takes far more abuse than a boat reel.",
    fly: "Large arbor with a sealed disc drag, and backing that matters. A striper will get you well into it.",
  },
  {
    item: "Line",
    spin: "20–30 lb braid. Thin for distance, no stretch so you feel a take at 50 m, and it cuts through the wave push far better than mono.",
    fly: "Intermediate for most of it — it sinks slowly, stays under the surface chop and doesn't get dragged around by every wave. A floating line is largely useless in surf.",
  },
  {
    item: "Leader",
    spin: "A shock leader is not optional if you're casting heavy lead: roughly 10 lb of leader per ounce of sinker, long enough for several turns on the spool before the cast. It absorbs the shock of the cast, and without it heavy lead goes off like a slingshot.",
    fly: "Short and stout — 6–9 ft, 15–20 lb. Long fine leaders don't turn over big flies in wind, and nothing in the surf is leader-shy.",
  },
  {
    item: "The one thing people forget",
    spin: "A rod holder or a sand spike, so the reel isn't sitting in wet sand while you re-bait. Sand in a reel ends the trip.",
    fly: "A stripping basket, and it's close to mandatory. Without one, your loose line washes around your legs, wraps your feet and stops every cast dead. A cheap plastic tub with a belt is fine.",
  },
  {
    item: "On you",
    spin: "Headlamp with a red mode, a wading belt if you're in waders, pliers, and a bag rather than a box — you're moving.",
    fly: "The same, plus keep the fly box closed. Wind and a beach lose flies permanently.",
  },
];

// ---------------------------------------------------------------------------
// Rigs and lures
// ---------------------------------------------------------------------------

export interface SurfRig {
  name: string;
  what: string;
  when: string;
}

export const SURF_RIGS: SurfRig[] = [
  {
    name: "Fish-finder rig",
    what: "A sliding sinker on the main line above a swivel, then a leader and a hook. The fish takes the bait and pulls line through the sinker without feeling the weight.",
    when: "The default bait rig for anything cautious, striped bass especially. If you fish bait from a beach and learn one rig, learn this one.",
  },
  {
    name: "High-low (dropper) rig",
    what: "Two hooks on short droppers above the sinker, so both baits sit off the bottom.",
    when: "When you're searching, or when small bottom fish are the target. Two baits at two heights doubles what you learn per cast. Check hook-number rules first.",
  },
  {
    name: "Pyramid sinker",
    what: "A four-sided lead that digs into sand and holds against wave push.",
    when: "Standard on a sand beach with moderate movement. Go heavier than feels right — a sinker that rolls is a rig sweeping down the beach into someone else's line.",
  },
  {
    name: "Breakaway / sputnik sinker",
    what: "A sinker with wire arms that grip the bottom and release under a firm pull.",
    when: "Strong current or big surf, where a pyramid won't stay put.",
  },
  {
    name: "Metal jigs and spoons",
    what: "Dense, aerodynamic, and they cast further than anything else you own.",
    when: "When you need to reach a bar, when mackerel are within range, or when it's windy. The distance tool.",
  },
  {
    name: "Swimming plugs and soft plastics",
    what: "Minnow-profile plugs and paddle-tails or jerkbaits on a jighead.",
    when: "The trough and the cuts, at dawn, dusk and night. A soft plastic on a 1/2–1 oz head, cast into a cut and worked slowly along its edge, is the classic striped bass presentation from a beach.",
  },
  {
    name: "Surface poppers",
    what: "Noisy floating plugs worked in a series of chugs.",
    when: "Low light and calm-ish water over a shallow bar. The most exciting take in the sport and the easiest one to miss — wait until you feel weight before you set.",
  },
  {
    name: "Flies",
    what: "Clousers, Deceivers and slim sand eel patterns in white, olive or chartreuse, 2–2/0.",
    when: "Any of the above, close in. Fly range on a beach is short, so it's a trough and cut method rather than a bar method — which is fine, because that's where the fish are.",
  },
];

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

export interface SurfTarget {
  slug: string;
  name: string;
  likelihood: "The reason you're here" | "Common" | "Seasonal" | "Bycatch";
  season: string;
  where: string;
  regions: Province[];
  note: string;
}

/**
 * Ranked by what a beach angler in this region will actually meet.
 *
 * Every entry has a species guide in research/, and nothing is listed that doesn't. The
 * temptation in a surf section is to list everything that has ever been caught from a
 * beach anywhere; what's useful is the short list you'll genuinely encounter here.
 */
export const SURF_TARGETS: SurfTarget[] = [
  {
    slug: "striped-bass", name: "Striped bass", likelihood: "The reason you're here",
    season: "Late spring through autumn, with the estuaries busiest early",
    where: "Troughs, cuts, points and river mouths — and much closer to the beach than you'd think",
    regions: ["NB", "NS", "PEI"],
    note: "The Maritime surf fish. Fish low light, fish the cuts, and fish close before you fish far. Check the current retention rules carefully — they change, and they differ by area and by size slot.",
  },
  {
    slug: "atlantic-mackerel", name: "Atlantic mackerel", likelihood: "Common",
    season: "Summer, once the schools are in",
    where: "Anywhere they come within casting range of the beach, usually where it shelves quickly",
    regions: ["NB", "NS", "PEI"],
    note: "Not a classic surf target — they're usually a wharf fish — but when a school pushes close to a steep beach they're reachable with a metal, and they're superb fun on light gear.",
  },
  {
    slug: "brook-trout", name: "Sea-run brook trout", likelihood: "Seasonal",
    season: "Spring, close to river and brook mouths",
    where: "The salt immediately around a river mouth, often in very shallow water",
    regions: ["NB", "NS", "PEI"],
    note: "A genuinely Maritime fishery and one many people never try. Sea-run fish are silver, hard-fighting and take small flies and spoons. Seasons and river-mouth closures apply — check before you go.",
  },
  {
    slug: "winter-flounder", name: "Winter flounder", likelihood: "Seasonal",
    season: "Cooler months, in sheltered bays rather than open surf",
    where: "Sand and mud bottom in bays and estuaries, on bait",
    regions: ["NB", "NS", "PEI"],
    note: "A bottom fish rather than a surf fish. Worth knowing about because they're catchable from shore on a simple bait rig when nothing else is happening.",
  },
  {
    slug: "pollock", name: "Pollock", likelihood: "Seasonal",
    season: "Cooler water, around rock rather than sand",
    where: "Rocky shorelines, breakwaters and headlands rather than open beach",
    regions: ["NB", "NS"],
    note: "If your 'beach' is actually a rocky shore, this is the fish that changes the trip. They hit metal hard and fight the whole way in.",
  },
  {
    slug: "spiny-dogfish", name: "Spiny dogfish", likelihood: "Bycatch",
    season: "Warmer months",
    where: "Anywhere you're fishing bait on the bottom",
    regions: ["NB", "NS", "PEI"],
    note: "You will catch these whether you meant to or not. Handle with real care — they have sharp spines in front of both dorsal fins and they twist. Use pliers, keep your hand away from the back, and don't grip them like a fish.",
  },
];

export const SURF_LIKELIHOOD_ORDER: SurfTarget["likelihood"][] = [
  "The reason you're here",
  "Common",
  "Seasonal",
  "Bycatch",
];

// ---------------------------------------------------------------------------
// Safety
// ---------------------------------------------------------------------------

export interface SurfHazard {
  hazard: string;
  detail: string;
  what: string;
}

/**
 * The section that isn't a formality.
 *
 * Note the tension stated openly in the rip current entry: the cut that concentrates fish
 * and the rip current that drowns swimmers are the same piece of water. An app that
 * teaches people to seek out cuts owes them that sentence.
 */
export const SURF_HAZARDS: SurfHazard[] = [
  {
    hazard: "Rip currents",
    detail: "A cut is a rip. The outflow that funnels bait through a gap in the bar is exactly the current that carries swimmers out to sea, and this section has just spent a page telling you to find them. Standing beside one is fine; being knocked into one is not.",
    what: "Never wade into or across the flow of a cut. If you are ever caught in one, do not swim against it — swim parallel to the beach until you're out of the outflow, then come in. Rips are narrow; the way out is sideways.",
  },
  {
    hazard: "Waders in surf",
    detail: "Waders that fill with water make swimming very hard and standing up in moving water harder still. This is the single most dangerous thing about beach fishing in waders.",
    what: "Always wear a wading belt, cinched tight at the waist. It traps air and dramatically slows flooding. Better still, wear shorts and boots in summer and keep the waders for calm estuary work.",
  },
  {
    hazard: "Being cut off by the tide",
    detail: "Bars, points and rocky ledges that you walk to on a low tide can become islands. People are rescued from this every year, and it happens gradually enough that it doesn't feel alarming until it is.",
    what: "Check the turn of the tide before you walk out, set an alarm on your phone for the time you must leave, and know your exit route. Never rely on retracing your steps.",
  },
  {
    hazard: "Cold water",
    detail: "Maritime sea temperatures are cold even in August, and cold water shock is immediate — an involuntary gasp underwater is what kills, not hypothermia. See the Safety section for the full cold-water sequence.",
    what: "Assume any unplanned entry into the water is serious. Fish with someone, or tell someone exactly where you are and when you'll be back.",
  },
  {
    hazard: "Footing and the wave you didn't see",
    detail: "Wet rock, weed-covered ledges and steep shingle are all treacherous, and sets of waves are irregular — the seventh one is bigger.",
    what: "Never turn your back on the sea. Watch a full ten minutes of wave sets before you commit to a rock, and assume a bigger one is coming than the ones you've watched.",
  },
  {
    hazard: "Night fishing",
    detail: "The best surf fishing is in the dark, which multiplies every hazard above and adds getting lost.",
    what: "Headlamp plus a spare, phone charged, a fixed exit plan, and tell someone. Walk the beach in daylight first — never fish a beach at night that you haven't seen at low tide in the light.",
  },
  {
    hazard: "Casting weight",
    detail: "A 4 oz pyramid sinker on a shock leader travelling at casting speed will do serious damage to a person, and beaches have other people on them.",
    what: "Look behind you every single cast. Keep a wide margin from anyone, and never cast heavy lead with people downwind of you.",
  },
];

export const ACCESS_NOTES = [
  "Most Maritime beaches allow public access below the high-water mark, but the route to the beach may cross private land — use marked accesses and car parks rather than cutting through property.",
  "Provincial and national parks have their own rules, and some have seasonal closures for nesting shorebirds. Piping plover nesting areas in particular are fenced and signed on beaches across all three provinces, and are legally protected — stay outside them and keep dogs out.",
  "Estuary and river mouths often carry separate regulations from the open coast, including closures. Check the provincial angling guide and the DFO notices for the area before you fish one.",
  "Take everything out, including line. Discarded monofilament on a beach kills birds and seals, and it's the single most visible thing anglers leave behind.",
  "Give other anglers room — in surf that means enough space that a swept sinker won't cross their line, which is more than it sounds like when there's current running down the beach.",
];

export const SURF_CAVEAT =
  "General practice for beach fishing in this region. Named beaches are deliberately absent because sandbars and cuts move between seasons — what's here is how to read any beach rather than where to stand on a particular one. Seasons, retention rules and access change: confirm against DFO and your provincial angling guide before you fish.";
