// The physical craft: casting, reading water, hooking, playing, landing, releasing.
//
// The gap this fills. Everything else in this app answers *what* and *where* — which fly,
// which wharf, which tide. None of it answers *how*, and how is what separates knowing
// about fishing from being able to fish. Someone can read every species guide here and
// still line-slap the pool, strike a soft take out of the fish's mouth, and lose it at the
// net. Those are learnable, and none of them are species-specific.
//
// Deliberately transferable rather than regional. A seam behaves the same on the Pollett
// as anywhere else; drag is drag. That is also what makes this section honest to write at
// length — it is established craft, not local claims I would have to source river by
// river. Where something genuinely varies here, it says so and points at the guide that
// covers it.
//
// One video per lesson, each checked with scripts/verify-videos.mjs.

export type SkillStage = "casting" | "flycasting" | "water" | "presentation" | "hooked" | "conditions";

export interface SkillStageInfo {
  id: SkillStage;
  title: string;
  blurb: string;
}

export const SKILL_STAGES: SkillStageInfo[] = [
  {
    id: "casting",
    title: "Casting a spinning rod",
    blurb:
      "Accuracy first, distance second. Almost everyone tries to muscle a cast and gets less distance than a relaxed one — the rod is a spring, not a club.",
  },
  {
    id: "flycasting",
    title: "Casting a fly rod",
    blurb:
      "A different problem: the line carries the fly, not the other way round. Three casts cover almost everything you'll ever need on Maritime water.",
  },
  {
    id: "water",
    title: "Reading water",
    blurb:
      "The highest-leverage skill in fishing. A good angler on average water out-fishes a poor one on great water, every time, because they can see where the fish are.",
  },
  {
    id: "presentation",
    title: "Making it look alive",
    blurb:
      "Retrieve cadence, depth control and the pause. Most lures are fished too fast and too shallow by people who haven't been told otherwise.",
  },
  {
    id: "hooked",
    title: "Hooked, played, landed, released",
    blurb:
      "The three minutes where trips are won and lost. Drag, rod angle, and the discipline not to rush the net.",
  },
  {
    id: "conditions",
    title: "Reading the day",
    blurb:
      "Light, wind, water clarity and temperature. Deciding where to go and when, before you've made a cast.",
  },
];

export interface SkillLesson {
  stage: SkillStage;
  n: number;
  title: string;
  /** The one-line statement of what this lesson makes you able to do. */
  skill: string;
  steps: string[];
  /** Concrete practice, so a lesson isn't just reading. */
  drill?: string;
  watchOut: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
}

export const SKILL_LESSONS: SkillLesson[] = [
  // --- Spinning cast --------------------------------------------------------
  {
    stage: "casting", n: 1,
    title: "The overhead cast",
    skill: "Putting a lure where you aimed, repeatably",
    steps: [
      "Reel the lure to about 15–30 cm below the rod tip. Much longer and it swings; much shorter and the rod can't load.",
      "Trap the line on the pad of your index finger, then open the bail with the other hand. Finger first, always — open the bail first and the lure is already falling.",
      "Face the target with the rod pointing at it, roughly at eye level.",
      "Bring the rod back to about 1 o'clock in one unhurried movement, and let the lure's weight bend the rod. That bend is the cast; your arm is only the handle.",
      "Come forward and release the line as the rod passes about 10 o'clock — early, not late. A lure released late goes into the water in front of you.",
      "Follow through so the rod finishes pointing at the target, then feather the line with your finger to stop the lure exactly where you want it.",
    ],
    drill:
      "Put a bucket lid at 10 m on grass and cast a practice weight at it thirty times. Count hits. Do it again at 15 m. Accuracy at short range is worth more than distance you can't place.",
    watchOut:
      "Powering the forward stroke. The rod only casts what it has loaded, so a hard swing with no load goes nowhere and cracks off lures. If your lure whistles, you are working too hard.",
    videoId: "mZSIvpKVA4c",
    videoTitle: "Fishing 101 Made Easy with Simple Spinning Reel Casting",
    videoChannel: "Joshua Taylor",
  },
  {
    stage: "casting", n: 2,
    title: "The casts that aren't overhead",
    skill: "Fishing where trees, wind and wharves are in the way",
    steps: [
      "Sidearm: the same stroke rotated flat. Keeps the lure under branches and under the wind, and it's the cast for a brook with alders over it.",
      "Pitch: no back cast at all. Hold the lure in your free hand, load the rod against it, release, and swing it underhand to a target inside 10 m. Quiet entry, which matters in shallow water.",
      "Flip: line pulled out by hand and swung on a pendulum, for dropping a lure into a gap in cover with almost no splash.",
      "Backhand: the sidearm cast across your body, for when your casting side is against the bank.",
      "Into wind, cast lower and harder; downwind, cast higher and let it ride. A high cast into wind is the commonest reason for a bird's nest of slack.",
    ],
    drill:
      "Fish a whole session with the overhead cast banned. You'll be clumsy for twenty minutes and then have four casts instead of one for the rest of your life.",
    watchOut:
      "Only owning one cast. Most good water in this region is under something — alders on the Pollett, a wharf rail, a headwind off the Strait — and the overhead cast is the one that can't be used there.",
    videoId: "D6dztaE3jkQ",
    videoTitle: "How to cast a Spinning Reel — Top 5 casts every spin fisherman should know",
    videoChannel: "Capt. Chris Myers",
  },

  // --- Fly cast -------------------------------------------------------------
  {
    stage: "flycasting", n: 3,
    title: "Pick up and lay down",
    skill: "The cast that is 80% of fly fishing",
    steps: [
      "Start with about 9 m of line straight on the water and the rod tip low, almost touching the surface. Slack is the enemy before you begin.",
      "Accelerate smoothly back to a stop at about 1 o'clock. The stop is the cast — the line loop is thrown by the rod stopping, not by the rod moving.",
      "Wait. The line must straighten behind you before you come forward, and waiting is the single hardest thing for a beginner to do.",
      "Accelerate forward to a crisp stop at about 10 o'clock, and let the line straighten in the air.",
      "Lower the rod tip as the line falls, so line and leader land more or less together.",
    ],
    drill:
      "Cast on grass with a piece of yarn instead of a fly and watch the loop behind you by turning your head. A tight candy-cane loop is right; a wide open loop or a cracking noise means you're not stopping the rod.",
    watchOut:
      "Not waiting for the back cast. The crack you sometimes hear is the leader breaking the sound barrier because you came forward early — and that's what snaps flies off.",
    videoId: "3oZXeJ7MPuw",
    videoTitle: "Fly Casting 101: The Pick Up and Lay Down",
    videoChannel: "MidCurrent",
  },
  {
    stage: "flycasting", n: 4,
    title: "The roll cast",
    skill: "Casting with a wall of alders behind you",
    steps: [
      "Draw the rod slowly back until the line hangs in a D-shape from rod tip to water behind your shoulder. Slow, so the line stays on the surface — this is not a back cast.",
      "Pause with the tip high and slightly outside your shoulder.",
      "Punch forward and down to a hard stop, as though hammering a nail at chest height.",
      "The loop rolls out along the water and turns the leader over.",
    ],
    drill:
      "Stand with your back a metre from a fence and make twenty roll casts. If you can do it there you can fish every brushy brook in the province.",
    watchOut:
      "Rushing the draw-back. If the line lifts off the water behind you the anchor is gone, and the cast collapses in a heap.",
    videoId: "NSTshveV59Q",
    videoTitle: "Fly Casting Lessons — Making a Roll Cast",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "flycasting", n: 5,
    title: "The double haul",
    skill: "Distance and line speed, for wind and for salt",
    steps: [
      "Learn it only after the pick up and lay down is comfortable. It amplifies a good cast and amplifies a bad one just as well.",
      "As the rod accelerates back, pull sharply down on the line with your free hand — a short haul, 20–30 cm, not a long drag.",
      "Let your hand drift back up toward the reel as the line straightens behind you.",
      "As the rod accelerates forward, haul again, then release the line to shoot.",
      "The rhythm is down-up-down-shoot, and it must match the rod's stroke, not lead it.",
    ],
    drill:
      "Practise the haul on its own with the rod held still and the line in your hand, until the timing is automatic. Then add the rod back.",
    watchOut:
      "Hauling continuously instead of sharply. It's a snap that adds line speed, not a tug-of-war.",
    videoId: "d8idd4kgXY4",
    videoTitle: "Fly Casting Lessons — The Double Haul",
    videoChannel: "The Orvis Company",
  },

  // --- Reading water --------------------------------------------------------
  {
    stage: "water", n: 6,
    title: "Rivers: where a fish actually sits",
    skill: "Walking up to strange water and knowing where to cast first",
    steps: [
      "A fish in current wants food delivered without paying for it, so it sits in slow water immediately beside fast water. That boundary is a seam, and it is the single most productive feature in any river.",
      "Read a pool in three parts. The head, where fast water breaks in, holds the most active fish and is where to start. The body is deep and holds the most fish but the wariest. The tail-out is shallow and holds fish that are feeding hard, and they spook easily — fish it before you wade near it.",
      "Riffles are shallow, broken and oxygen-rich; they hold feeding fish in summer and their broken surface hides you completely.",
      "Anything that breaks the current makes a cushion: a boulder has a slow pocket in front of it as well as behind, and the front one gets fished far less.",
      "Undercut banks, log jams and overhanging alders hold the biggest fish in most small Maritime brooks, because cover and food arrive in the same place.",
      "Fish face upstream. Approach from downstream and you're behind them; approach from upstream and you're in their field of view.",
    ],
    drill:
      "Before your first cast on any new pool, stand back and name out loud the seam, the head, the tail-out and one piece of cover. Then fish them in that order.",
    watchOut:
      "Walking to the water's edge to look. On a small brook the tail-out fish sees you from ten metres and every fish in the pool knows about it. Look from back and low.",
    videoId: "lwiguP6SzPE",
    videoTitle: "How To Find Trout In A River — Reading Water 101",
    videoChannel: "Ventures Fly Co.",
  },
  {
    stage: "water", n: 7,
    title: "Pocket water and small brooks",
    skill: "Fishing the broken water most people walk past",
    steps: [
      "Pocket water is a boulder field: dozens of fist-to-car-sized slack spots, each of which may hold a fish.",
      "Fish it close. Cast a metre or two, not fifteen — the broken surface means you can stand almost on top of the fish.",
      "Work upstream, taking each pocket in turn, and give each one only a few drifts before moving. These are reaction fish; they take at once or not at all.",
      "Keep as much line off the water as you can. Drag from conflicting currents is the reason drifts fail here, and short line is the cure.",
      "On a brook, treat every pool as one or two fish. Take them and move — a small pool does not reward twenty minutes.",
    ],
    drill:
      "Fish 100 m of broken water with a rule that you may not make more than three casts in any one spot. It teaches you to keep moving, which is how brook trout are caught.",
    watchOut:
      "Fishing pocket water like a pool. Long casts and long drifts guarantee drag, and drag in fast water is instantly obvious to the fish.",
    videoId: "3sRd0H86U2A",
    videoTitle: "How to Read Pocketwater and Find Trout",
    videoChannel: "Tactical Fly Fisher",
  },
  {
    stage: "water", n: 8,
    title: "Lakes and ponds",
    skill: "Finding fish in water with no current to read",
    steps: [
      "With no current, structure and depth change do the work. Find the edges: a drop-off, a weed line, a point running out from shore, a submerged rockpile, an inlet or outlet.",
      "Points are the most reliable feature in a strange lake. Fish travel along them, and the deep water beside one lets fish move up and down without crossing open water.",
      "Weed lines are a wall of food and cover at once. Cast parallel to the edge rather than into it, so the lure stays in the productive zone for the whole retrieve.",
      "In summer a lake stratifies: warm on top, cold and often oxygen-poor at the bottom, with a narrow band between. Trout and landlocked salmon drop into that band and will not be found shallow in the heat of the day.",
      "Inlets bring cool oxygenated water and food in summer, and outlets concentrate both. Both are worth the walk.",
      "At ice-out and again in late autumn the whole lake is roughly the same temperature and fish can be anywhere — which is when shorelines and shallow bays fish best.",
    ],
    drill:
      "On a lake you know, mark the drop-off with a lure that ticks bottom: cast, count it down, and note the count where it stops hitting. Two or three fan casts give you the shape of the edge without a sounder.",
    watchOut:
      "Fishing the middle. Open water in the middle of a small lake is the least likely place to hold anything, and it's where beginners cast because it's easy.",
    videoId: "wGqmb5EpJjM",
    videoTitle: "How to Read the Water to Find Trout",
    videoChannel: "The New Fly Fisher",
  },

  // --- Presentation ---------------------------------------------------------
  {
    stage: "presentation", n: 9,
    title: "Retrieve cadence by lure family",
    skill: "Fishing each lure the way it was designed to work",
    steps: [
      "Inline spinner: retrieve just fast enough to feel the blade turning, and no faster. If you can't feel it, it isn't spinning. Cast across and let it swing.",
      "Spoon: a steady wobble on a slow retrieve, or let it flutter down on a slack line — most spoon takes come on the drop.",
      "Soft plastic on a jig head: cast, let it sink on a controlled line, then lift-and-drop. Watch the line on every fall; that's when the fish takes it.",
      "Crankbait: crank it down until it's ticking bottom or cover, then vary the speed. Deflection off something solid triggers more strikes than a clean retrieve.",
      "Topwater: far slower than feels right. Walk it, pause it, count to three, twitch it again. The pause is what gets eaten.",
      "Streamer on a fly rod: strip in short sharp pulls with pauses, and let it swing at the end of the drift — the swing takes plenty of fish that ignored the strip.",
      "Dead-drift (nymph or dry): no retrieve at all. The job is a drag-free drift at exactly the speed of the current, achieved with mends and slack.",
    ],
    drill:
      "Fish one lure for a whole session and change only the retrieve — fast, slow, with pauses, with rod-tip twitches. You'll learn more about that lure than a year of changing lures every ten minutes.",
    watchOut:
      "Retrieving everything at the same medium speed. It's the default when nobody has told you otherwise, and it's wrong for most lures in the box.",
  },
  {
    stage: "presentation", n: 10,
    title: "Depth control",
    skill: "Fishing where the fish are, not where the lure wants to be",
    steps: [
      "Count it down. Cast, then count as the lure sinks before starting the retrieve. Found fish at eight? Cast to eight every time. This one habit catches more fish than any lure choice.",
      "Weight changes depth more than retrieve speed does. In current, go heavier rather than slower — a light jig swept off the bottom is fishing nothing.",
      "A faster retrieve rides higher, a slower one runs deeper. Use that to hold a depth as the bottom rises or falls.",
      "On a fly rod the line does this job: floating for the top, intermediate for just under, sink-tip to get down in current.",
      "In cold water fish sit lower and move less. Slow down and get deeper before you change anything else.",
    ],
    drill:
      "Take one weight of jig and catch fish at three different counts in the same spot. Then take three weights and hold one count. Both teach the same lesson from different sides.",
    watchOut:
      "Changing lure colour when the problem is depth. Colour is the last variable worth adjusting and the first one most people reach for.",
  },

  // --- Hooked ---------------------------------------------------------------
  {
    stage: "hooked", n: 11,
    title: "Setting the drag",
    skill: "Letting the fish take line before it takes your leader",
    steps: [
      "Set it before you fish, not with a fish on. Adjusting under load is how leaders part.",
      "Rule of thumb: roughly a quarter to a third of your line's breaking strain. For 15 lb braid that's about 4–5 lb of pull.",
      "Check it by hand: pull line straight off the reel through the rod's guides with the rod bent as it would be in a fight. It should give steadily under firm pressure, not lock or slip freely.",
      "On a fly reel the drag mostly matters for a fish that runs into the backing; for trout, palming the rim is often enough.",
      "Back the drag off for storage so the washers aren't held compressed for months, and set it again next trip.",
    ],
    drill:
      "Tie your line to a spring scale, set the rod at fighting angle, and pull until line slips. Now you know what your setting actually is rather than what it feels like.",
    watchOut:
      "A drag set from the reel's own resistance while the rod is straight. The rod's bend adds friction through the guides — always test with the rod loaded.",
    videoId: "pXVwFfhlsn8",
    videoTitle: "How to Set Drag Correctly on Any Spinning Reel",
    videoChannel: "Capt. Chris Myers",
  },
  {
    stage: "hooked", n: 12,
    title: "The take and the hookset",
    skill: "Converting a bite into a hooked fish",
    steps: [
      "Match the set to the hook. Trebles on a hard bait need only a firm sweep — they're sharp, numerous, and a violent strike tears them out. A single worm hook in a bass's bony mouth needs a hard sweeping set.",
      "Circle hooks are the exception: do not strike at all. Reel down steadily until the line comes tight and the hook finds the corner of the jaw by itself. Striking pulls it straight out.",
      "On a fly rod, dry flies and nymphs need a lift of the rod, not a heave. For streamers and for salmon, a strip-strike — pulling with the line hand — keeps the fly in the fish's mouth where a rod-lift snatches it away.",
      "Braid has no stretch, so the set is immediate and needs less force. Monofilament stretches, so at range you need a longer, harder sweep to take up the slack first.",
      "Set sideways rather than straight up. It drives the hook into the jaw's hinge instead of pulling it toward the fish's mouth opening.",
      "A soft, weighty, 'just heavier' feeling is a take. So is a line that stops drifting, or twitches, or moves upstream. Set on anything unexplained — it costs nothing.",
    ],
    drill:
      "Fish a session where you set on every single suspicion, however faint. Count how many turn out to be fish. Most beginners find it's more than they expected.",
    watchOut:
      "Striking a salmon or a big fish on the fly the instant you see the take. Let the fish turn down with the fly first; the classic advice is to wait until you feel weight, and it exists because generations of people pulled the fly away.",
    videoId: "afN9i6gEhec",
    videoTitle: "Fly Fishing Lessons — Setting The Hook And Fighting Fish",
    videoChannel: "The Orvis Company",
  },
  {
    stage: "hooked", n: 13,
    title: "Playing and landing",
    skill: "Not losing it in the last three metres",
    steps: [
      "Keep the rod at roughly 45° and bent. The bend is a shock absorber; a rod pointed at the fish makes the leader take everything.",
      "Let a running fish run against the drag. Trying to stop a first run is how leaders break and hooks pull.",
      "Pump to recover line: lift the rod smoothly, then reel as you lower it. Never reel against a running drag — that just twists the line.",
      "Pull sideways rather than up. Low sideways pressure turns a fish's head and tires it far faster than lifting, and it keeps the fish away from snags.",
      "Land it as fast as you reasonably can. A long fight in warm water is what kills released fish, and the fish is not enjoying an extended battle either.",
      "Net head-first, in the water, with the net stationary. Chasing a fish with the net is the classic last-second loss.",
    ],
    drill:
      "Have someone hold the end of your line and walk away while you fight them. You'll feel immediately how much more control low sideways pressure gives than a high rod.",
    watchOut:
      "Lifting the fish's head at the net with a short line and a locked drag. That is the exact moment most good fish are lost, because there's no line left to absorb a lunge.",
    videoId: "E5M7JfVtmZA",
    videoTitle: "Tips on Using your Drag, Fish Fighting Tips, and Rod Positioning",
    videoChannel: "Thundermist Lure Company",
  },
  {
    stage: "hooked", n: 14,
    title: "Releasing a fish that lives",
    skill: "Catch-and-release that actually releases",
    steps: [
      "Decide before you land it. If it's going back, have wet hands, pliers and a rubber net ready before the fish arrives.",
      "Keep it in the water. Every second in air costs it, and a fish held up for a photo has usually been out far longer than the angler thinks.",
      "Wet your hands or gloves first. Dry hands strip the slime coat that keeps a fish free of infection.",
      "Never hold it by the gills, and don't squeeze the belly. Support it horizontally under the body — a big fish held vertically by the jaw can be damaged by its own weight.",
      "Use a rubber or knotless net. Knotted mesh takes scales and slime off, and tangles hooks besides.",
      "If it's hooked deep, cut the leader close rather than digging. A left hook is survivable; a torn throat usually isn't.",
      "Hold it upright facing into gentle current until it swims off under its own power. Don't push it back and forth — that forces water the wrong way through the gills.",
      "In warm water, think hard about whether to fish at all. Warm water holds less oxygen and release mortality climbs steeply — it's the reason salmon rivers close under a warm-water protocol.",
    ],
    drill:
      "Practise the photo before you need it: net in water, camera ready, fish lifted for three seconds, back in. Rehearsing it dry is how you avoid a minute of fumbling with a live fish.",
    watchOut:
      "The trophy photo. Thirty seconds of arranging a shot is far more damaging than the fight was, and it happens to the biggest and most valuable fish.",
    videoId: "wJ3zz-UCKCo",
    videoTitle: "How to Handle Fish for Safe Catch and Release",
    videoChannel: "Pennsylvania Fish and Boat Commission",
  },

  // --- Conditions -----------------------------------------------------------
  {
    stage: "conditions", n: 15,
    title: "Light, wind and weather",
    skill: "Choosing when to go, and what to expect when you get there",
    steps: [
      "Low light is the reliable edge. Dawn, dusk, and overcast days spread fish out and bring them shallow; bright midday sun pushes them to depth, shade and cover.",
      "Wind is your friend more often than not. It breaks up the surface so fish can't see you, and it stacks plankton and baitfish on the downwind shore — the uncomfortable bank is usually the productive one.",
      "A falling barometer ahead of a front often coincides with a strong feeding window; the bluebird high-pressure day right after a front passes is usually the hardest fishing of the week.",
      "Rain that lifts and colours a river can switch fish on, especially for brown trout and salmon. Rain that blows it out to mud switches them off.",
      "Cold fronts in autumn put fish down for a day or two, then trigger heavy feeding as the water settles.",
      "Almost none of this beats simply being on the water. The best conditions you can fish are the ones on the day you can go.",
    ],
    watchOut:
      "Treating solunar tables and pressure trends as rules. They're weak tendencies stacked on top of much stronger factors — season, water temperature and whether there's food present.",
  },
  {
    stage: "conditions", n: 16,
    title: "Water clarity and temperature",
    skill: "Adjusting lure, depth and expectation to the water in front of you",
    steps: [
      "Clear water: go smaller, more natural, longer leader, and fish further away from where you stand. Clear water fish see everything, including you.",
      "Stained or tea-coloured water — which is most of this region's brooks — favours contrast and vibration: gold blades, dark silhouettes, a spinner they can feel before they see.",
      "Muddy water after rain: bright, big, slow and noisy. Get close, because they can only find it from a short distance.",
      "Temperature drives everything about activity. Cold fish are slow and deep and want a slow presentation; as water warms toward a species' preferred band they become aggressive and shallow; past it they go deep and off the feed.",
      "Brook trout are a cold-water fish and get stressed as water climbs through the low twenties Celsius — that's when to fish the spring holes, the inlets, or leave them alone.",
      "Carry a cheap thermometer. Water temperature explains more slow days than any other single measurement, and almost nobody checks it.",
    ],
    drill:
      "Take the temperature every trip and write it in the catch log next to what happened. After a season you'll have your own local table, which beats anyone else's general advice.",
    watchOut:
      "Assuming the air temperature tells you the water temperature. A warm afternoon in May sits on top of water that's still near ice-out, and the fish are living in the water.",
  },
];

// ---------------------------------------------------------------------------
// Reference
// ---------------------------------------------------------------------------

export interface FaultRow {
  fault: string;
  cause: string;
  fix: string;
}

/** Diagnosis rather than advice — matched to what you can actually observe. */
export const FAULT_TABLE: FaultRow[] = [
  {
    fault: "Casts are short and the lure whistles",
    cause: "Powering the stroke instead of loading the rod",
    fix: "Slow the whole cast down and let the lure's weight bend the rod before you come forward.",
  },
  {
    fault: "Line piles up in loops on the spool and tangles",
    cause: "Reeling against a slipping drag, or closing the bail with the handle",
    fix: "Close the bail by hand, and never reel while line is being pulled out.",
  },
  {
    fault: "Fly line lands in a heap",
    cause: "No stop at the end of the stroke, or coming forward before the back cast straightened",
    fix: "Make the stop crisp and wait longer than feels natural.",
  },
  {
    fault: "A cracking noise on the forward cast",
    cause: "Back cast not straightened — the leader is snapping like a whip",
    fix: "Pause. If you're losing flies, this is why.",
  },
  {
    fault: "Takes felt but not hooked",
    cause: "Blunt hooks, or a set that doesn't match the hook type",
    fix: "Check the point on a thumbnail — it should catch, not slide. Then match the set: sweep for trebles, hard for singles, reel-down for circles.",
  },
  {
    fault: "Fish lost partway through the fight",
    cause: "Slack line, or a rod pointed at the fish",
    fix: "Keep the rod bent and low to one side, and never give slack.",
  },
  {
    fault: "Fish lost at the net",
    cause: "Short line, locked drag, and lifting the head",
    fix: "Leave a rod's length of line out, keep the drag as set, and let the fish come to a still net head-first.",
  },
  {
    fault: "Nothing at all, on water you know holds fish",
    cause: "Almost always depth or speed, rarely colour",
    fix: "Count it down deeper and slow the retrieve before you change lures.",
  },
];

export interface TempBand {
  band: string;
  celsius: string;
  what: string;
}

/**
 * General temperature bands, not species tables.
 *
 * Deliberately coarse. Precise per-species optima vary by population and by what a study
 * was measuring, and a table of exact numbers would imply a precision this app can't
 * source. What holds everywhere is the shape: too cold means slow and deep, a middle band
 * means active, too warm means stressed.
 */
export const TEMP_BANDS: TempBand[] = [
  { band: "Very cold", celsius: "under ~4 °C", what: "Fish are deep and barely moving. Presentations must be slow to the point of feeling silly. Ice fishing territory." },
  { band: "Cold", celsius: "~4–10 °C", what: "Feeding but unhurried. Slow retrieves, deeper water, smaller profiles. Early spring and late autumn." },
  { band: "Prime", celsius: "~10–18 °C", what: "The band most Maritime fresh water sits in through spring and autumn, and where cold-water species feed hardest." },
  { band: "Warm", celsius: "~18–22 °C", what: "Bass and pickerel thrive. Trout and salmon become stressed toward the top of this band and move to springs, inlets and depth." },
  { band: "Too warm", celsius: "over ~22 °C", what: "Cold-water species are in trouble: less dissolved oxygen, sharply higher release mortality. This is when salmon rivers close under warm-water protocols." },
];

export const SKILLS_CREDIT_NOTE =
  "Every video is somebody else's work, linked and credited by channel — nothing here is hosted or mirrored. Each was checked with scripts/verify-videos.mjs when it was added, which confirms it's public and returns its real title. Links rot; re-run the script rather than trusting this note.";

export const SKILLS_SCOPE_NOTE =
  "This section is deliberately general craft rather than local claims — a seam behaves the same on the Pollett as anywhere else, and drag is drag. Where something genuinely varies in this region, the species guides and the Saltwater section carry it, and this points there instead of guessing.";
