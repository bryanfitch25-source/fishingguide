// How to actually catch each one.
//
// A deliberate separation, and the reason this is its own file rather than more prose in
// research/*.json.
//
//   research/*.json  is sourced regional content — seasons, named waters, regulations,
//                    each with its own citations. Claims about *this place*.
//   this file        is general craft specialised to a species. Where in the column, what
//                    cadence, which hookset, the mistake that costs people fish. Claims
//                    about *this fish*, which hold wherever it swims.
//
// Keeping them apart means the app can say which is which. Padding the research files with
// technique would have blurred a sourced seasonal claim into an un-sourced tactical one,
// and after an audit that removed five invented fly patterns, that is not a line worth
// blurring. The interface labels this block as applied technique.
//
// `season` restates the trigger from that species' own "When to Go" section, so the two
// can't drift; scripts/validate-tactics.mjs checks every slug against research/.

export interface SpeciesTactics {
  slug: string;
  /** The cue that switches this fish on — season, temperature, or run timing. */
  season: string;
  /** Where in the water column to present, and why. */
  column: string;
  /** The retrieve or drift that works, in enough detail to copy. */
  retrieve: string;
  /** How to convert the take, matched to the hook and the fish's mouth. */
  hookset: string;
  /** Time of day, tide or light — the window worth planning around. */
  window: string;
  /** The single thing that costs most people fish on this species. */
  mistake: string;
  /** What to try once the basics are working. */
  stepUp?: string;
}

export const SPECIES_TACTICS: SpeciesTactics[] = [
  {
    slug: "striped-bass",
    season:
      "Available from ice-out in April through to October, with the Northumberland Strait shore fishery peaking May to October. Early season concentrates near the Miramichi before fish disperse along the coast.",
    column:
      "Wherever the bait is, which changes hourly. Start mid-column with a paddletail, go topwater if you see bait showering, and go to the bottom in a deep river hole. Stripers will come up a long way for a lure but rarely go down for one.",
    retrieve:
      "On the swing rather than straight back. Cast across the current, keep a slow steady wind with the rod low, and let the lure arc downstream — most takes come at the end of the swing as it turns. On a flat, a paddletail wants a slow, even retrieve just fast enough to feel the tail thumping.",
    hookset:
      "A firm sweep, not a snap. Barbless single inline hooks are mandatory, and a violent strike on a single hook in a soft mouth pulls it. On topwater, wait until you feel weight — striking at the splash takes the lure away from the fish.",
    window:
      "Dawn and dusk on a moving tide. The last two hours of the flood over a flat, and the first three of the ebb at a river mouth, are the two most reliable windows in the region.",
    mistake:
      "Fishing the tide table's high-water time instead of moving water. Slack high is often the deadest half-hour of the cycle, and people plan their whole trip around it.",
    stepUp:
      "Learn one river mouth properly across a full tide cycle rather than sampling six beaches. Stripers follow the same routes on the same stage of tide, and that pattern is worth more than any lure.",
  },
  {
    slug: "brook-trout",
    season:
      "Rivers and streams open 15 April in New Brunswick through 15 September, lakes from 1 May. Spring right after opening, and again in autumn as water cools, are the most active windows — they're less warm-tolerant than bass and go quiet in a hot summer.",
    column:
      "Near the surface in cool water and close to the bottom in warm. In a small brook, that's usually 30–60 cm down in the deepest part of a small pool.",
    retrieve:
      "A spinner cast up-and-across and retrieved just fast enough to feel the blade — the lure should swing past the lie, not be dragged at it. A worm or a nymph wants no retrieve at all, just a drag-free drift at the current's speed.",
    hookset:
      "A short lift, not a heave. Brook trout have soft mouths, they're often small, and a hard strike on light line either breaks off or tears out.",
    window:
      "First and last light, and any overcast day. Bright midday sun on a small clear brook is the hardest fishing of the day.",
    mistake:
      "Walking to the edge of the pool to look in. On a small brook the fish in the tail-out sees you first and warns the whole pool. Stay back, stay low, and fish the tail before you wade past it.",
    stepUp:
      "Fish upstream. It's harder to cast and control line, but you approach from behind fish that face into the current, and it roughly doubles what a small brook produces.",
  },
  {
    slug: "atlantic-salmon",
    season:
      "By river and by variation order rather than by a single date. Low warm summer water is the dry-fly and small-fly window; higher autumn water takes bigger, brighter patterns on a sink-tip.",
    column:
      "In the top foot for summer fish on a floating line — a salmon will rise a long way to a small fly. In cold or high water, get down to them with a sink-tip instead.",
    retrieve:
      "Almost none. Cast across and slightly down, mend to control the speed, and let the fly swing on a tight line at walking pace. Take a step downstream after each cast and fish the pool systematically. The swing speed is the variable that matters, and mending is how you set it.",
    hookset:
      "Do nothing. Let the fish turn down with the fly and take the line tight itself, then simply lift into weight. Striking at the sight of a rise is the classic way to lose a salmon and everyone does it once.",
    window:
      "Early morning and evening in low water. After rain, as a river drops and clears from a spate, is the best fishing many rivers offer all season.",
    mistake:
      "Fishing too fast and covering the pool twice. A salmon that has refused a fly swung at speed will often take the same fly swung slower, three casts later.",
    stepUp:
      "Learn to mend properly. Controlling swing speed with upstream and downstream mends is most of salmon fishing, and it's the difference between fishing a pool and merely casting into it.",
  },
  {
    slug: "smallmouth-bass",
    season:
      "Pre-spawn from late April into May as fish move into rivers and shallow staging water, spawning May–June, then a strong autumn feed. Pre-spawn and autumn are the two aggressive windows.",
    column:
      "On the bottom, in contact with rock, for most of the year. Topwater in warm water at first and last light is the exception worth taking.",
    retrieve:
      "Tube or jig: cast, let it sink on a controlled line, then drag and hop it along the bottom with the rod rather than the reel, taking up slack as you go. You want to feel every rock. Most takes come as it falls back after a hop.",
    hookset:
      "Hard and sideways. A smallmouth's mouth is bony and a soft set leaves the hook sitting on bone rather than through it.",
    window:
      "Low light in summer, but in spring and autumn the middle of a sunny day can be the best of it — the water is warmest then and they feed on the warm-up.",
    mistake:
      "Losing contact with the bottom. If you can't feel rock you're fishing above them, and in current that means going heavier rather than slower.",
    stepUp:
      "Fish current seams in rivers the way you would for trout. River smallmouth sit behind boulders and on seam edges exactly like trout do, and most people fish them as if it were a lake.",
  },
  {
    slug: "atlantic-mackerel",
    season:
      "August through autumn is the reliable inshore window here, as fish that spawned in the Gulf in June–July spread along the coast. Some years they show earlier — wharf regulars are the best real-time source.",
    column:
      "Right at the surface when they're showing, mid-column when they aren't. If you can see them boiling, fish above them rather than through them.",
    retrieve:
      "As fast as you can wind. Mackerel outrun almost anything and a lure that seems absurdly fast is usually about right. A Sabiki instead wants short sharp lifts with the rig hanging in the school.",
    hookset:
      "Barely needed — they hook themselves at that speed. Just keep winding when you feel weight.",
    window:
      "First light and evening, watching for surface activity and birds. The whole thing can switch on and off within twenty minutes.",
    mistake:
      "Retrieving too slowly because it feels wrong. It's the single most common reason a wharf full of people catches nothing while one person catches steadily.",
    stepUp:
      "Bring a fly rod. A 6–8 wt with a white bucktail off a wharf into a mackerel school is one of the most under-used bits of sport in the region.",
  },
  {
    slug: "pollock",
    season:
      "Spring through autumn, with summer and autumn bringing 'harbour pollock' in thick around wharves and breakwaters.",
    column:
      "They suspend well above the bottom over ledges and wrecks, so work the whole column vertically rather than pinning the lure to the rock.",
    retrieve:
      "Snap-jigging: a sharp 12–18 in lift of the rod tip, then drop the tip and let the lure flutter back on slack line. The fluttering fall is what gets hit, so don't rip it back down. If fish are busting bait on top, a fast steady retrieve with a spoon covers water better.",
    hookset:
      "Usually unnecessary — they hit hard on the drop. Keep steady pressure and don't horse them; they make driving runs and will find any slack near pilings.",
    window:
      "Dusk especially, and any moving tide around structure.",
    mistake:
      "Fishing them on the bottom like cod. Pollock are up in the water and aggressive, and a lure sat on the rock misses them entirely.",
    stepUp:
      "Try them on a fast-sinking fly line with a Clouser. They're one of the most willing saltwater fly targets in the region and almost nobody does it.",
  },
  {
    slug: "winter-flounder",
    season:
      "Spring through early summer, as fish move into shallow flats, estuary mouths and harbours when water reaches roughly 12–15 °C, then drift back to deeper water as summer peaks.",
    column:
      "Flat on the bottom, always. They will not rise for anything, so the bait must sit where they can reach it.",
    retrieve:
      "Effectively none. Cast a hi-lo rig out, let it settle, and leave it. If nothing happens in 10–15 minutes, move a short distance along the flat rather than waiting it out — they aren't evenly spread even in good ground.",
    hookset:
      "Resist the first taps. Flounder peck at bait before committing, so let it mouth for a few seconds, then come tight with a firm steady sweep rather than a snap.",
    window:
      "The high-to-falling tide window. Activity drops off noticeably as a flat empties on a big ebb.",
    mistake:
      "Striking at the first tap. It's the commonest way to lose flounder after flounder and it feels like the right thing to do.",
    stepUp:
      "Use small baits and small hooks. Their mouths are tiny, and going down a hook size converts far more of those pecks.",
  },
  {
    slug: "rainbow-smelt",
    season:
      "The spring spawning run is the event — fish stack at river mouths and push into small coastal streams for a short intense window, roughly April into June depending on water temperature. Winter through the ice is the other half of the year.",
    column:
      "Wherever the school is, usually mid-column. They're a schooling fish, so it's about finding them rather than depth.",
    retrieve:
      "Cast into the middle of a school and keep it moving steadily back. Takes come as the lure leaves the school, not while it hangs in it — a stalled retrieve catches very little.",
    hookset:
      "Gentle. Their mouths are small and delicate and a hard set tears the hook straight back out.",
    window:
      "Night during the run, especially at the tide head of a spawning tributary.",
    mistake:
      "Terminal tackle that's too big. Smelt gear looks comically small and needs to be — undersized hooks and jigs are the whole trick.",
  },
  {
    slug: "chain-pickerel",
    season:
      "Spawn very early, right after ice-out, often before anything else is moving. Pre- and post-spawn fish feed heavily and are at peak weight, pushing into shallow coves they wouldn't otherwise use.",
    column:
      "Just under the surface along weed edges. They ambush upward and rarely chase down.",
    retrieve:
      "Slow and erratic with pauses — an injured baitfish, not a healthy one. Cast parallel to a weed line rather than into it, so the lure stays in the strike zone for the whole retrieve, and expect the take on the pause.",
    hookset:
      "Firm and immediate. Their mouths are hard and bony, and a soft set is a missed fish.",
    window:
      "Warm calm days, any time. They're less light-sensitive than most.",
    mistake:
      "Fishing without a bite guard. Pickerel teeth cut straight through light fluorocarbon, and the fish you lose that way is always a good one.",
    stepUp:
      "Topwater. They hit it harder than their size suggests and miss it often enough to be genuinely entertaining.",
  },
  {
    slug: "largemouth-bass",
    season:
      "Spawn in shallow water in late spring once temperatures climb into the mid-teens Celsius, hold tight to cover through summer feeding hardest at dawn and dusk, then feed heavily again in autumn.",
    column:
      "In and around cover rather than at a depth. Pads, timber, dock pilings — largemouth ambush from cover instead of roaming.",
    retrieve:
      "A weedless soft plastic worked slowly through cover, falling on slack line into every pocket. Most takes happen on the fall, so watch the line rather than the lure. A frog over mats wants a walking cadence with pauses.",
    hookset:
      "A hard sweeping set, and on a frog wait a full beat after the blow-up before you set. Setting on the splash is how nearly everyone misses their first few frog fish.",
    window:
      "First and last light in summer. Midday means going deeper or into heavier shade.",
    mistake:
      "Fishing open water. Largemouth are a cover fish, and the middle of the bay is the least likely place they'll be.",
  },
  {
    slug: "yellow-perch",
    season:
      "A genuine year-round target. Best right after ice-out when they spawn shallow and feed hard beforehand, and again in autumn. Summer pushes them deeper onto structure; ice fishing is a major part of the year.",
    column:
      "Near the bottom more often than not. Start there and work up only if you're marking fish higher.",
    retrieve:
      "Light jiggling shakes and a slow lift-and-pause, not aggressive snapping — especially on pressured schools. Tip the jig with a minnow head, waxworm or maggot; scent usually out-produces bare plastic.",
    hookset: "A short firm lift. Small mouths, small hooks, no drama needed.",
    window:
      "Any time, though a school that's feeding will tell you within a few minutes.",
    mistake:
      "Moving off a school too early. Perch shoal tight — where you catch one there are more, and the productive hole rewards staying put rather than searching away from it.",
  },
  {
    slug: "white-perch",
    season:
      "Move shallow to spawn in spring, which is when they're easiest to find in numbers close to shore. A solid summer-through-autumn target in estuaries and headponds, and an established winter ice fishery on PEI's brackish ponds.",
    column:
      "Mid to near-bottom, in the slower water beside a current rather than in it.",
    retrieve:
      "Simple beats complicated. A small jig worked slowly near the bottom, or a bobber with a piece of worm, out-produces more elaborate presentations on this fish.",
    hookset: "A light lift. They fight modestly and light gear makes it fun.",
    window:
      "Summer evenings, at river mouths, headpond current seams and pond inlets where fresh meets brackish.",
    mistake:
      "Over-thinking it. This is the species where the bobber-and-worm genuinely wins, and where a tackle box full of options is a distraction.",
  },
  {
    slug: "brown-trout",
    season:
      "Rivers roughly May to mid-September in NB, with the Lower Saint John capping brown trout at two fish a day. Populations are localised enough to be worth confirming against the current stocked-water lists before a special trip.",
    column:
      "Deep and tight to cover in daylight; up and hunting after dark. The same fish behaves like two different species either side of dusk.",
    retrieve:
      "After dark, swing or strip a streamer slowly through deep pools and undercuts — browns key on vibration once light is gone, and a slow pulsing retrieve beats a fast one. In daylight, a big attractor dry drifted over an undercut bank at last light draws deliberate rises.",
    hookset:
      "Firm but not violent. Night takes feel enormous and the instinct is to strike far too hard.",
    window:
      "The last hour of daylight and into full dark. Browns are consistently a low-light fish and fishing them at midday is mostly practice.",
    mistake:
      "Going home at sunset. The best hour for this species starts when most people are packing up.",
    stepUp:
      "Fish water you've walked in daylight. Night fishing an unfamiliar bank is both unproductive and genuinely unsafe.",
  },
  {
    slug: "rainbow-trout",
    season:
      "Rivers and streams roughly May to mid-September in NB, 1 April to 30 September in NS. Stocked lakes fish well from ice-out onward, and stocked fish are far less selective than river fish.",
    column:
      "Near the surface for actively feeding fish, near the bottom otherwise. In a stocked lake, count a spinner down until you find the level.",
    retrieve:
      "A spinner cast across and slightly upstream, retrieved just fast enough to keep the blade turning, so it swings naturally through a seam rather than being dragged straight back. A nymph wants a dead drift under an indicator or on a tight line.",
    hookset:
      "A lift rather than a strike, and softer again on light tippet. Barbless single hooks are required during PEI's extended season.",
    window:
      "Early and late in bright weather, all day when it's overcast.",
    mistake:
      "Fishing a spinner straight back to your feet. The swing across the current is what triggers the take, and a straight retrieve throws that away.",
  },
  {
    slug: "landlocked-salmon",
    season:
      "Roughly 1 May to 30 September in NB's designated lakes, 1 April to 30 September in most NS waters, and only in specifically designated waters — landlocked salmon angling is prohibited elsewhere.",
    column:
      "In the warm surface layer at ice-out, dropping to the thermocline or deeper structure as lakes stratify in summer. They follow cool water down and won't be shallow in midday heat.",
    retrieve:
      "Streamers and small spoons worked along shorelines and points in spring — trolled slow and shallow at ice-out, deeper as it warms. On calm evenings they'll rise to a dry fly or a small popper like a trout.",
    hookset:
      "A firm lift, then be ready instantly. They jump repeatedly right after the hookset and a drag set too tight loses them on the first leap.",
    window:
      "Early morning and evening in spring, on shorelines and points.",
    mistake:
      "A drag set too tight for a jumping fish. A controlled loose drag and quick hands land far more than trying to muscle one back to the boat.",
  },
  {
    slug: "american-shad",
    season:
      "Spring is the entire game — fish push into Maritime rivers to spawn as water warms, with the Saint John run around Mactaquac and the Annapolis, Shubenacadie and Stewiacke on a similar spring timetable.",
    column:
      "Low. Shad travel near the bottom, and a dart fished mid-column passes over them.",
    retrieve:
      "Cast up or across, let it sink for a second, then a slow steady retrieve kept low, with a gentle up-and-down jigging motion. Shad aren't feeding, so this is about putting it in their path repeatedly rather than fooling them — persistence and reading the current matter more than lure choice.",
    hookset:
      "A gentle sweep. Shad have famously soft mouths and hard sets tear out, which is where the nickname about paper mouths comes from.",
    window:
      "Dawn and dusk. The light change alone can trigger a short intense window.",
    mistake:
      "Changing lures instead of changing position. If you're not getting hit, you're probably not in the travel lane — move a few metres before you open the box.",
  },
  {
    slug: "gaspereau",
    season:
      "The spring run, commonly May, a few weeks after the smelt. Fish concentrate hard at river mouths, fishways and current seams for a short window.",
    column: "Mid-column in the current seam, wherever fish are stacking against the flow.",
    retrieve:
      "Cast across or slightly downstream and swing it back at a swift consistent pace — these are aggressive active fish during the run and they respond to a steady retrieve rather than finesse.",
    hookset: "A light lift. Small mouths need small hooks and a soft set.",
    window: "Through the run, at any pinch point where fish stack waiting to move upstream.",
    mistake:
      "Missing the window. The run is short, it shifts year to year with water temperature, and a fortnight late means an empty river.",
  },
  {
    slug: "atlantic-herring",
    season:
      "Inshore around wharves from summer into autumn, overlapping heavily with mackerel — many anglers catch both on the same Sabiki drop.",
    column:
      "Deeper under a light than mackerel sit. If nothing hits near the surface, let the rig sink further before you start.",
    retrieve:
      "Short sharp wrist flicks while taking up slack — a tighter, snappier motion than the slow lifts used for mackerel. Cast just outside the lit circle into the shadow line, where bait holds tighter.",
    hookset: "None needed. Keep reeling steadily; multiple fish often come on one drop.",
    window:
      "After dark, and it improves as it gets fully dark. Find a wharf with a working light over the water — that matters more than any specific spot.",
    mistake:
      "Using mackerel-sized hooks. Herring have smaller mouths, and a size 10–14 rig converts far more of the bites.",
  },
  {
    slug: "atlantic-cod",
    season:
      "A short and specific open season — the Gulf Region groundfish season runs mid-April to early October within 50 m of shore, but cod retention is only allowed in a much shorter window inside that. Confirm the current dates with DFO rather than assuming.",
    column:
      "Hard on the bottom, or a foot or two above it. Cod relate to hard bottom, drop-offs and current.",
    retrieve:
      "Drop a diamond jig to the bottom, reel up a foot or two, then sharp 2–3 ft rod sweeps letting it fall back on a controlled semi-slack line — the erratic fall triggers the strike, so don't rip it back down. In heavy current a bottom rig with fresh cut bait out-fishes a jig, because the jig stops fishing properly.",
    hookset:
      "Reel down to take up slack and set with a firm steady lift — no hard fast snap, especially on circle-style bottom rigs.",
    window: "Any time you can hold bottom. Bait presence and manageable current matter more than the clock.",
    mistake:
      "Stale bait. The guide is blunt about it: fresh cut mackerel or herring out-fishes stale by a wide margin, and it's the cheapest edge available.",
    stepUp:
      "Add a teaser fly or scented soft plastic on a dropper 2–3 ft above the jig, especially when cod are keyed on small bait.",
  },
  {
    slug: "american-eel",
    season:
      "Late spring through autumn in warm water. They slow dramatically and effectively stop feeding as water cools, burying into soft bottom for winter.",
    column: "Hard on the bottom, near cover — undercut banks, rocks, weed edges, dock pilings.",
    retrieve:
      "None at all. Cast to soft bottom near cover and let it sit completely still. Eels hunt by smell and don't chase, so movement adds nothing.",
    hookset:
      "Wait for a distinct steady pull rather than a sharp knock — they mouth and swallow rather than hitting. Then a firm steady lift once you feel solid weight.",
    window: "After dark on warm summer nights. This is a nocturnal fishery and daytime is largely wasted.",
    mistake:
      "Fishing it like a lure fishery. Any retrieve at all reduces your chances, which is counter-intuitive enough that people can't leave it alone.",
  },
  {
    slug: "atlantic-tomcod",
    season:
      "Two windows: January during the spawning run into estuaries like the Shubenacadie, and incidentally through the open-water season in deeper estuary channels on flounder gear.",
    column: "On the bottom in deeper estuary channels.",
    retrieve: "Slow, with frequent pauses on the bottom. The bite is subtle, much like a flounder's.",
    hookset: "A gentle steady lift. Small fish, small hooks, small bites.",
    window: "The January run for a targeted trip; otherwise whenever you're already flounder fishing.",
    mistake:
      "Expecting a distinct bite. Most tomcod are noticed as extra weight rather than as a take.",
  },
  {
    slug: "cunner",
    season:
      "Spring through autumn once water has warmed past their winter torpor. No tight seasonal window — a consistent any-warm-day fishery, which is what makes it the reliable fallback.",
    column: "Right beside structure, at whatever depth the structure is. They rarely stray from cover.",
    retrieve:
      "None. Drop a small baited hook straight down beside a piling and hold it there. Genuinely no technique required.",
    hookset: "Quick, because they're expert bait thieves. Re-bait often rather than waiting out slow periods.",
    window:
      "Any summer day, at any wharf or breakwater — there is no window to plan around, which is exactly the point. When the striper or mackerel fishing goes dead, this is what keeps a rod bent.",
    mistake:
      "Hooks that are too big. Cunner have small mouths and steal bait off anything oversized all afternoon.",
  },
  {
    slug: "sculpin",
    season:
      "Present year-round in their structure rather than run-timed. Almost always an incidental catch on flounder or bottom gear rather than a target.",
    column: "On the bottom, over rock, ledge or mixed estuary bottom.",
    retrieve:
      "Slow with pauses on the bottom, same as flounder. In clear shallow water they can be sight-fished — drop a small bait-tipped jig right beside one and it will lunge.",
    hookset:
      "A firm lift — they take confidently and hook themselves more often than not. The care goes into unhooking rather than hooking: use pliers and keep your fingers clear of the head.",
    window: "Any time you're bottom fishing an estuary.",
    mistake:
      "Grabbing one bare-handed. The head and gill-cover spines will prick you, and it's a needless way to end a good day.",
  },
  {
    slug: "spiny-dogfish",
    season: "Warmer months, when they push inshore to feed.",
    column: "On the bottom, wherever you're already fishing for something else.",
    retrieve:
      "Whatever you were doing. They take bottom baits and metal jigs meant for cod and pollock readily — the problem is usually stopping them, not catching them.",
    hookset: "Firm. They take confidently and often deep, which is the whole handling problem.",
    window: "Summer, deeper water. You will not be planning around it.",
    mistake:
      "Handling one without gloves and a dehooker. The dorsal spines are venomous and they swallow hooks deep — both entirely predictable and both worth preparing for.",
  },
  {
    slug: "acadian-redfish",
    season: "Deep-water charter trips only. Not a targeted recreational fishery in this region at all.",
    column: "150–300 m, near the seabed, though they move up in the column daily to feed.",
    retrieve:
      "Short lifts a few feet off the bottom, then reel steadily — the standard deep bottom-jigging retrieve used for cod and haddock at that depth.",
    hookset: "Barely applicable at that depth; the weight of the rig sets the hook.",
    window:
      "Whenever the deep-water charter is running, which in practice means a cod or halibut trip that happens to be over the shelf edge. There is no window you can choose from shore.",
    mistake:
      "Planning to release one without a descending device. Barotrauma from that depth is near-certain, and a fish released without one won't survive.",
  },
  {
    slug: "bluefin-tuna",
    season:
      "July through October, as fish follow mackerel into the southern Gulf. North Lake on PEI's eastern tip is the hub.",
    column: "Wherever the crew sets the baits, usually near the surface behind the boat.",
    retrieve:
      "Not yours to decide. The crew sets live or fresh mackerel, manages the initial hookset, and hands you the rod.",
    hookset:
      "The crew's job. Barbless circle hooks are mandated for the conservation fishery, and circles are not struck — they set themselves.",
    window: "Whenever your charter is booked. There is no shore or small-boat version of this.",
    mistake:
      "Underestimating the physical demand. Fights routinely run well over an hour and it's a full-body effort, not a quick battle.",
  },
  {
    slug: "muskellunge",
    season:
      "A warm-season pursuit on the Saint John River, building through summer into autumn as fish feed ahead of winter. Cooler spring and autumn water tends to produce more aggressive, followable fish.",
    column: "Just under the surface along weed edges, current breaks and drop-offs.",
    retrieve:
      "Fast and steady for bucktails — muskie anglers favour speed over finesse to trigger reaction strikes. Then finish every single retrieve with a wide figure-8 boatside, because muskie follow without committing and the figure-8 is what converts a follow into a bite.",
    hookset: "Hard, repeatedly, with heavy tackle. Their mouths are all bone.",
    window: "Summer and autumn, with cooling water in the autumn being the classic window.",
    mistake:
      "Lifting the lure out at the boat. The follow is the norm rather than the exception, and skipping the figure-8 throws away most of your chances.",
    stepUp:
      "Check the current invasive-species rules before you go — retention requirements in NB have changed and vary by area, and this is the species where that matters most.",
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export function tacticsFor(slug: string): SpeciesTactics | undefined {
  return SPECIES_TACTICS.find((t) => t.slug === slug);
}

/**
 * Species with no tactics entry, and why that's deliberate rather than an omission.
 *
 * Kept as an explicit map so the validator can tell a considered gap from a forgotten one.
 */
export const NO_TACTICS: Record<string, string> = {};

export const TACTICS_BASIS_NOTE =
  "Applied technique — general craft specialised to this fish, so it holds wherever the species swims. The regional detail above it (seasons, named waters, regulations) is separately sourced; this is kept apart rather than mixed in so you can tell which is which. Seasons here restate that guide's own timing.";
