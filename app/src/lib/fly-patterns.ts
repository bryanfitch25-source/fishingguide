// The pattern library.
//
// Two kinds of entry, and the difference is marked rather than blurred:
//
//   named patterns — a real fly with a name someone gave it, and where it's documented,
//     the person who tied it first. The Green Machine and the Bomber are Miramichi flies,
//     the Grey Ghost is Carrie Stevens' 1924 smelt imitation from Rangeley, the Undertaker
//     is Warren Duncan's from Saint John in 1979.
//   styles (`style: true`) — a kind of fly rather than a specific dressing. "Shrimp
//     pattern", "Crayfish pattern", "White Bucktail". These are genuinely what an angler
//     needs in the box and there is no single canonical version, so they're listed and
//     labelled as styles instead of being dressed up with an invented name and a tyer.
//
// That distinction was added after an audit. The header used to claim every entry was "a
// real, documented pattern with a traceable origin", which was not true of the styles, and
// the list also carried entries that were only a colour restatement of a fly already in
// it — a "Chartreuse and White Clouser" beside the Clouser Deep Minnow. Those have been
// folded into their parent entries.
//
// The same audit removed five salmon entries outright — Golden Girl, Conrad, Oriole,
// Dungarvon and "Bear Hair Bug" — because they could not be verified as documented
// Maritime patterns. Golden Girl in particular is Roderick Haig-Brown's British Columbia
// steelhead fly, not an Atlantic salmon pattern, and its note here claimed otherwise. Two
// attributions were wrong and are corrected: the Nine-Three is Dr. Herbert Sanborn's (with
// Emile Letourneau, Belgrade Lakes, 1949), not Herb Welch's — Welch tied the Black Ghost —
// and the Stimulator was designed by Jim Slattery, with Randall Kaufmann refining, naming
// and popularising it.
//
// Where provenance is genuinely disputed the entry says so rather than picking a side.
//
// Weighted toward what actually swims here. Brook trout carries the most entries because
// it spans dries, terrestrials, nymphs, the old Maritime wets and streamers — five ways of
// fishing rather than one. The salmon hairwings are the deepest single category, which is
// as it should be: much of that canon was tied on the Miramichi and the Restigouche.
//
// Several flies appear under more than one quarry on purpose. A Clouser Minnow really is
// both a striper fly and a smallmouth fly — Bob Clouser designed it for the latter — and a
// Grey Ghost is fished for sea-run brook trout and landlocked salmon alike. Duplicating
// them beats making someone guess which group to look in, which is why TOTAL_PATTERNS
// counts distinct names rather than rows.

export type PatternType =
  | "Dry"
  | "Wet"
  | "Nymph"
  | "Streamer"
  | "Hairwing"
  | "Bomber"
  | "Topwater"
  | "Saltwater"
  | "Terrestrial"
  | "Emerger"
  | "Egg";

export interface FlyPattern {
  name: string;
  type: PatternType;
  sizes: string;
  /** Conditions, season, water height — when you'd actually reach for it. */
  when: string;
  note: string;
  /** Named tyer, year or river of origin, where it's documented. */
  origin?: string;
  /** What it's meant to be, where that's a sensible question. */
  imitates?: string;
  /**
   * A kind of fly rather than a specific named dressing — "Shrimp pattern", "White
   * Bucktail". Surfaced in the interface so nobody goes looking for a canonical recipe
   * for something that doesn't have one.
   */
  style?: boolean;
}

export interface PatternGroup {
  quarry: string;
  blurb: string;
  patterns: FlyPattern[];
}

// ---------------------------------------------------------------------------

const ATLANTIC_SALMON: FlyPattern[] = [
  // --- The Maritime core ---------------------------------------------------
  {
    name: "Green Machine",
    type: "Bomber",
    sizes: "2 – 10",
    when: "Low, clear summer water",
    note: "Green floss body, brown deer-hair tufts fore and aft. If you carry one salmon fly on the Miramichi this is arguably it — a local pattern that became a world standard.",
    origin: "Miramichi, New Brunswick",
  },
  {
    name: "Bomber",
    type: "Bomber",
    sizes: "2 – 8",
    when: "Warm low water, bright days",
    note: "Clipped deer-hair body skated across the lie to leave a wake. The rise to a waking Bomber is why people fish dry for salmon at all.",
    origin: "Miramichi, New Brunswick",
  },
  {
    name: "Blue Charm",
    type: "Hairwing",
    sizes: "4 – 12",
    when: "Bright days, clear water",
    note: "Slim, sparse, a touch of blue. The safe first cast on a clear river with a fish that has already seen a season's worth of flies.",
    origin: "Scotland, adopted wholesale in the Maritimes",
  },
  {
    name: "Black Bear Green Butt",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Anywhere, any height",
    note: "Fluorescent green butt, black body, black bear wing. Among the most-fished salmon flies in eastern Canada — if you are unsure, this or a Rat.",
  },
  {
    name: "Black Bear Red Butt",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Coloured water, low light",
    note: "The same fly with the butt changed. Worth carrying both and letting the river decide.",
  },
  {
    name: "Black Bear Orange Butt",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Autumn, tea-stained water",
    note: "The third of the Black Bear set, and the one that comes into its own late in the season.",
  },
  {
    name: "Rusty Rat",
    type: "Hairwing",
    sizes: "2 – 10",
    when: "Anywhere, anytime",
    note: "Perhaps the most famous hairwing ever tied. Orange floss showing through a peacock body, grey fox wing, veiled with a golden pheasant crest.",
    origin: "Clovis Arsenault and Joseph Pulitzer II, Restigouche County, 1949",
  },
  {
    name: "Silver Rat",
    type: "Hairwing",
    sizes: "2 – 10",
    when: "Bright water, bright day",
    note: "The silver-bodied member of the Rat series. The whole family traces to Roy Angus Thompson's RAT flies of the early 1900s.",
  },
  {
    name: "Black Rat",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Dull days, higher water",
    note: "Muskrat body, grey fox wing. The dark end of the Rat range.",
  },
  {
    name: "Cosseboom",
    type: "Hairwing",
    sizes: "2 – 10",
    when: "Late season, coloured water",
    note: "Green-bodied with a grey squirrel wing, and one of the true Maritime standbys. Tied in more colour variants than almost any other salmon fly.",
    origin: "John Cosseboom, Margaree River, Nova Scotia",
  },
  {
    name: "Undertaker",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Coloured or falling water",
    note: "Black with green and red butts and a black bear wing. The dark-day answer when a Blue Charm is too subtle.",
    origin: "Warren Duncan, Saint John, New Brunswick, 1979",
  },
  {
    name: "Copper Killer",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Bright, low water — late summer",
    note: "Copper tinsel body under a squirrel wing. A New Brunswick pattern that shines when the river drops and clears.",
    origin: "New Brunswick",
  },
  {
    name: "Same Thing Murray",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "General, summer",
    note: "Orange-butted and deer-hair winged. The name comes from the day it was first fished, not from a recipe.",
    origin: "Doug Hastings, Little Southwest Miramichi, 1993",
  },
  {
    name: "Shady Lady",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Bright days, low clear water",
    note: "A well-established Miramichi summer fly.",
    origin: "Miramichi, New Brunswick",
  },
  {
    name: "Butterfly",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Summer grilse, riffled water",
    note: "White goat hair set in a splayed V over peacock herl, with a red tail. Often sold as the Ingalls Butterfly. Pump the rod on the swing and the wings pulse — that movement is the whole pattern.",
    origin: "Maurice Ingalls, c. 1956 — a Florida angler, tied for the Main Southwest Miramichi",
  },
  {
    name: "Green Highlander",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "Early season, higher water",
    note: "A classic in full-dress and hairwing forms alike. Green body, yellow and green wing.",
    origin: "Scotland, 1880s",
  },
  {
    name: "Garry Dog",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "High or coloured water, cold",
    note: "Yellow and red bucktail over black. Named for a dog whose coat supplied the original wing.",
    origin: "Scotland",
  },
  {
    name: "Dusty Miller",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "Bright water",
    note: "A silver-bodied classic that survived the move from full-dress to hairwing intact.",
  },
  {
    name: "Blue Doctor",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "Early season, coloured water",
    note: "One of the Doctor series — blue hackle, red tag. Old, and still fished.",
  },
  {
    name: "Silver Doctor",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "Bright, high water",
    note: "The silver-bodied Doctor. Tied both as a salmon fly and, smaller, as a trout wet.",
  },
  {
    name: "Thunder & Lightning",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Dull days, coloured water",
    note: "Orange hackle over a black body. A traditional dark-day fly.",
  },
  {
    name: "Munro Killer",
    type: "Hairwing",
    sizes: "4 – 12",
    when: "Summer, general",
    note: "Black body, yellow and orange hackle, long wing. Scottish, and thoroughly at home here.",
    origin: "John Munro, Scotland",
  },
  {
    name: "Ally's Shrimp",
    type: "Hairwing",
    sizes: "4 – 12",
    when: "Any height, especially autumn",
    note: "Long orange bucktail over a red and black body. Fishes as a shrimp silhouette rather than a baitfish.",
    origin: "Alastair Gowans, Scotland",
    imitates: "Shrimp",
  },
  {
    name: "Willie Gunn",
    type: "Hairwing",
    sizes: "2 – 8",
    when: "Cold, high water — spring and late autumn",
    note: "Black, orange and yellow hair over a black body, often on a tube. A big-water fly.",
    origin: "Scotland",
  },
  {
    name: "Stoat's Tail",
    type: "Hairwing",
    sizes: "6 – 12",
    when: "Low water, summer",
    note: "About as sparse as a salmon fly gets — black body, black wing, and confidence.",
  },
  {
    name: "Blue Rat",
    type: "Hairwing",
    sizes: "4 – 10",
    when: "Clear water, bright light",
    note: "The blue-flanked Rat. Rounds out the set with the Rusty, Silver and Black.",
  },
  {
    style: true,
    name: "Buck Bug",
    type: "Bomber",
    sizes: "4 – 10",
    when: "Warm water, low flow",
    note: "The deer-hair-bodied family the Green Machine belongs to — a slimmer, sparser derivative of the Bomber, trimmed close and fished damp just under the film rather than dry on top. Tied in a range of butt colours.",
    origin: "Rev. Elmer Smith, Miramichi, 1960s — popularised by Jerry Doak of Doaktown",
  },
];

const BROOK_TROUT: FlyPattern[] = [
  // --- Dries ---------------------------------------------------------------
  { name: "Adams", type: "Dry", sizes: "10 – 20", when: "Any hatch you can't identify", note: "The universal grey mayfly. The parachute version is easier to see and floats no worse.", imitates: "Mayfly dun", origin: "Leonard Halladay, Michigan, 1922" },
  { name: "Elk Hair Caddis", type: "Dry", sizes: "12 – 18", when: "All season, riffled water", note: "Floats through broken water and stays visible. Often the right first cast when nothing is showing.", imitates: "Adult caddis", origin: "Al Troth, 1957" },
  { name: "Royal Coachman", type: "Dry", sizes: "10 – 18", when: "Anywhere, especially small streams", note: "Attracts rather than imitates. Created for trout and grayling in 1878 and never really went away.", origin: "John Haily, New York, 1878" },
  { name: "Royal Wulff", type: "Dry", sizes: "10 – 16", when: "Fast water, poor light", note: "The Royal Coachman rebuilt on Lee Wulff's hair-wing frame so it floats in rough water.", origin: "Lee Wulff" },
  { name: "Griffith's Gnat", type: "Dry", sizes: "18 – 24", when: "Flat calm, midging fish", note: "Peacock herl palmered with grizzly. For the rises that ignore everything bigger.", imitates: "Midge cluster", origin: "George Griffith, founder of Trout Unlimited" },
  { name: "Black Gnat", type: "Dry", sizes: "14 – 20", when: "Evening, still water", note: "An old and very simple fly that keeps catching brook trout.", imitates: "Small dark terrestrial" },
  { name: "Blue-Winged Olive", type: "Dry", sizes: "16 – 22", when: "Overcast days, spring and autumn", note: "The hatch that most rewards paying attention. Small, olive, and everywhere.", imitates: "Baetis mayfly" },
  { name: "Light Cahill", type: "Dry", sizes: "12 – 18", when: "Early summer evenings", note: "Pale cream mayfly. A classic eastern hatch-matcher.", imitates: "Pale mayfly dun" },
  { name: "March Brown", type: "Dry", sizes: "10 – 14", when: "Late spring", note: "Big, mottled, and fished when the first substantial mayflies appear.", imitates: "March brown mayfly" },
  { name: "Hendrickson", type: "Dry", sizes: "12 – 16", when: "The first real hatch of spring", note: "The eastern season opener, when the water reaches the low 50s Fahrenheit.", imitates: "Ephemerella subvaria" },
  { name: "Mosquito", type: "Dry", sizes: "14 – 18", when: "Still water, evening", note: "Grizzly-hackled and unglamorous. Brook trout in ponds do not read fashion.", imitates: "Adult mosquito" },
  { name: "Stimulator", type: "Dry", sizes: "8 – 16", when: "Summer, fast water", note: "Big and buoyant. Doubles as a stonefly, a hopper, and a strike indicator.", imitates: "Stonefly / large terrestrial", origin: "Jim Slattery, 1980 — refined, named and popularised by Randall Kaufmann" },
  { name: "Humpy", type: "Dry", sizes: "10 – 16", when: "Broken pocket water", note: "Practically unsinkable. Ugly and effective.", origin: "Western US" },
  { name: "Irresistible", type: "Dry", sizes: "10 – 16", when: "Rough water", note: "Spun deer-hair body for flotation. An old high-float answer.", origin: "Joe Messinger" },

  // --- Terrestrials --------------------------------------------------------
  { style: true, name: "Foam Ant", type: "Terrestrial", sizes: "14 – 20", when: "Midsummer, overhanging banks", note: "Trout eat far more ants than anyone fishes. Worth a cast under every alder.", imitates: "Ant" },
  { style: true, name: "Foam Beetle", type: "Terrestrial", sizes: "12 – 18", when: "Hot, still afternoons", note: "Drops in with an audible plop, which is the point.", imitates: "Beetle" },
  { name: "Dave's Hopper", type: "Terrestrial", sizes: "6 – 12", when: "Late summer, grassy banks", note: "Fished tight to the bank on a windy day.", imitates: "Grasshopper", origin: "Dave Whitlock" },

  // --- Nymphs --------------------------------------------------------------
  { name: "Gold-Ribbed Hare's Ear", type: "Nymph", sizes: "10 – 18", when: "When nothing is rising", note: "Buggy enough to be several insects at once. Beadhead for depth.", imitates: "Mayfly / caddis nymph" },
  { name: "Pheasant Tail Nymph", type: "Nymph", sizes: "12 – 20", when: "Clear water, selective fish", note: "Slim and sparse where the Hare's Ear is scruffy. Carry both.", imitates: "Mayfly nymph", origin: "Frank Sawyer, England" },
  { name: "Prince Nymph", type: "Nymph", sizes: "10 – 16", when: "Fast water, all season", note: "Peacock body and white biots. Nobody agrees what it imitates and it does not matter.", origin: "Doug Prince" },
  { name: "Copper John", type: "Nymph", sizes: "12 – 18", when: "When you need to get down fast", note: "Wire body makes it heavy — often used as the anchor in a two-fly rig.", origin: "John Barr" },
  { name: "Zebra Midge", type: "Nymph", sizes: "16 – 22", when: "Winter and cold water", note: "About as simple as tying gets: thread, wire, bead.", imitates: "Midge pupa" },
  { name: "Squirmy / San Juan Worm", type: "Nymph", sizes: "10 – 14", when: "High, dirty water after rain", note: "Inelegant, and the thing that works when the river is the colour of tea with milk.", imitates: "Aquatic worm" },
  { style: true, name: "Stonefly Nymph", type: "Nymph", sizes: "6 – 12", when: "Rocky, oxygenated water", note: "Big and heavy. Where stoneflies live, brook trout know them well.", imitates: "Stonefly nymph" },
  { style: true, name: "Caddis Pupa", type: "Nymph", sizes: "12 – 18", when: "Just before an evening caddis hatch", note: "The stage fish key on while everyone else is fishing the adult.", imitates: "Caddis pupa" },

  // --- Wets, the Maritime tradition ---------------------------------------
  { name: "Montreal", type: "Wet", sizes: "8 – 14", when: "Spring, coloured water", note: "A Canadian brook-trout wet from the 1830s that was one of the best-selling commercial flies in the country by mid-century, and still catches.", origin: "Peter Cowen, eastern Canada, 1830s" },
  { name: "Parmachene Belle", type: "Wet", sizes: "8 – 14", when: "Spring and early summer", note: "Red-and-white wing over a yellow floss body — said to imitate a brook trout's own fin.", origin: "Henry Wells, 1870s" },
  { name: "Professor", type: "Wet", sizes: "8 – 14", when: "Lakes and slow water", note: "Yellow body, mallard wing. One of the dozen wets every old Maritime box carried.", origin: "John Wilson, Scotland" },
  { name: "Coachman (wet)", type: "Wet", sizes: "8 – 16", when: "Evening, any water", note: "Invented in the 1830s. Older than most rivers' road access.", },
  { name: "Leadwing Coachman", type: "Wet", sizes: "10 – 16", when: "Fished deep, early season", note: "The Coachman with a grey quill wing, and a good imitation of a drowned caddis.", },
  { name: "Silver Doctor (wet)", type: "Wet", sizes: "8 – 14", when: "Bright water", note: "The salmon classic scaled down for trout.", },
  { name: "Dark Montreal", type: "Wet", sizes: "8 – 14", when: "Tea-stained water", note: "A separately documented pattern rather than a shade of the Montreal — Ray Bergman carried its own dressing in Trout. For bog-stained Maritime rivers.", origin: "Recorded in Ray Bergman's Trout, 1938" },
  { name: "Scarlet Ibis", type: "Wet", sizes: "8 – 14", when: "Coloured water, spring", note: "All red. An old attractor from the era when brook trout were plentiful and unfussy.", },
  { name: "Cow Dung", type: "Wet", sizes: "10 – 16", when: "Windy days", note: "Named without ceremony. Imitates a terrestrial fly blown onto the water.", },
  { name: "Alexandra", type: "Wet", sizes: "8 – 14", when: "Still water", note: "Peacock sword wing over silver. Effective enough that some clubs once banned it.", },
  { name: "Partridge and Orange", type: "Wet", sizes: "12 – 16", when: "Rising water, hatching caddis", note: "A north-country soft hackle — sparse, mobile, and deadly swung across a run.", origin: "Yorkshire soft-hackle tradition" },
  { name: "Partridge and Green", type: "Wet", sizes: "12 – 16", when: "Caddis time", note: "The green-bodied soft hackle. Same idea, different day.", },

  // --- Streamers -----------------------------------------------------------
  { name: "Muddler Minnow", type: "Streamer", sizes: "4 – 12", when: "Coloured or falling water", note: "A sculpin, a small baitfish or a grasshopper depending entirely on how you fish it.", imitates: "Sculpin / baitfish", origin: "Don Gapen, Nipigon River, Ontario, 1937" },
  { name: "Mickey Finn", type: "Streamer", sizes: "6 – 12", when: "Spring high water", note: "Yellow-red-yellow bucktail. A long-standing Maritime spring fly for brookies and sea-run trout.", imitates: "Small baitfish" },
  { name: "Woolly Bugger", type: "Streamer", sizes: "4 – 12", when: "Any time nothing is on top", note: "Black or olive. Catches everything in this app, which is why every box holds a dozen.", },
  { name: "Black Ghost", type: "Streamer", sizes: "4 – 10", when: "Lakes and deep pools", note: "Black body, white wing. A New England smelt streamer that travelled north and stayed.", imitates: "Smelt", origin: "Herbert Welch, Rangeley, Maine — public debut 1927" },
  { name: "Grey Ghost", type: "Streamer", sizes: "2 – 8", when: "Cold water, spring and autumn", note: "Carrie Stevens tied the first one on 1 July 1924 to imitate a smelt, and fished it at Upper Dam the same day.", imitates: "Smelt", origin: "Carrie Stevens, Rangeley, Maine, 1924" },
  { name: "Nine-Three", type: "Streamer", sizes: "2 – 8", when: "Landlocked salmon, cold water", note: "Green over white bucktail. Named for the 9 lb 3 oz landlocked salmon it took the morning after it was tied.", imitates: "Smelt", origin: "Dr. Herbert Sanborn and Emile Letourneau, Belgrade Lakes, Maine, 1949" },
  { name: "Supervisor", type: "Streamer", sizes: "2 – 8", when: "Ice-out, cold lakes", note: "Blue and green over white. A classic New England smelt fly.", imitates: "Smelt", origin: "Joseph Stickney, Maine" },
  { name: "Magog Smelt", type: "Streamer", sizes: "2 – 8", when: "Cold water, lakes", note: "Named for Lake Memphremagog. Purple, yellow and white over silver.", imitates: "Smelt" },
  { name: "Warden's Worry", type: "Streamer", sizes: "4 – 10", when: "Spring, lakes and river mouths", note: "Orange-bodied Maine streamer, and a good sea-run trout fly.", origin: "Joseph Stickney, Maine" },
];

const STRIPED_BASS: FlyPattern[] = [
  { name: "Clouser Deep Minnow", type: "Saltwater", sizes: "2/0 – 4", when: "Anywhere, any tide", note: "Dumbbell eyes ride it hook-up over structure. Chartreuse/white first, olive/white second — those two colourways cover most Maritime water between them. Arguably the most effective striper fly ever tied.", imitates: "Baitfish", origin: "Bob Clouser, late 1980s" },
  { name: "Lefty's Deceiver", type: "Saltwater", sizes: "3/0 – 2", when: "When they're on larger bait", note: "Holds a deep baitfish profile without fouling. The other half of the Clouser answer.", imitates: "Herring, mackerel, peanut bunker", origin: "Lefty Kreh, 1950s" },
  { name: "Half and Half", type: "Saltwater", sizes: "2/0 – 1", when: "Deep water, current", note: "A Clouser head on a Deceiver tail — weight and profile at once. A go-to for many saltwater striper anglers.", imitates: "Baitfish", origin: "Lefty Kreh and Bob Clouser" },
  { name: "Gurgler", type: "Topwater", sizes: "1/0 – 4", when: "Calm water, low light", note: "Pushes a wake and makes a commotion. Worth doing badly for a season to learn to do well.", imitates: "Struggling bait, shrimp, crab", origin: "Jack Gartside, late 1980s" },
  { name: "Surf Candy", type: "Saltwater", sizes: "1/0 – 4", when: "Sand eels, clear water", note: "Epoxy-bodied, slim and translucent. When sand eels are about, slim beats bulky.", imitates: "Sand eel, silverside", origin: "Bob Popovics" },
  { name: "Crease Fly", type: "Topwater", sizes: "2/0 – 2", when: "Bright days, surface feeding", note: "Folded foam that pops and darts. Casts better than it looks like it should.", origin: "Joe Blados" },
  { name: "Bob's Banger", type: "Topwater", sizes: "2/0 – 1", when: "Blitzes, choppy water", note: "A foam popper head on a simple tail. Loud, and easy to see at distance.", origin: "Bob Popovics" },
  { name: "EP Baitfish", type: "Saltwater", sizes: "3/0 – 1", when: "Big bait, clear water", note: "Synthetic fibre brushed to a broad baitfish profile that sheds water and casts light for its size.", imitates: "Bunker, herring", origin: "Enrico Puglisi" },
  { name: "Hollow Fleye", type: "Saltwater", sizes: "4/0 – 1", when: "Big fish on big bait", note: "Bucktail tied in reversed layers for volume without weight. The large-fly solution.", imitates: "Bunker, herring", origin: "Bob Popovics" },
  { style: true, name: "Sand Eel", type: "Saltwater", sizes: "1/0 – 4", when: "Sand eels in the wash", note: "Long, thin, and unadorned. Sand eels are the Northumberland Strait's overlooked staple.", imitates: "Sand lance" },
  { style: true, name: "Gaspereau / Alewife pattern", type: "Saltwater", sizes: "2/0 – 1", when: "Spring, on the bait runs", note: "When the gaspereau run the Miramichi, matching them matters more than usual.", imitates: "Gaspereau (alewife)" },
  { style: true, name: "Smelt pattern", type: "Saltwater", sizes: "1/0 – 4", when: "Early spring, estuaries", note: "Smelt are the first real bait of the year in Maritime estuaries and the stripers know it.", imitates: "Rainbow smelt" },
  { style: true, name: "Shrimp pattern", type: "Saltwater", sizes: "2 – 6", when: "Back-estuary, low light", note: "Small and subtle, for fish grubbing the flats rather than chasing bait.", imitates: "Grass shrimp" },
];

const SMALLMOUTH: FlyPattern[] = [
  { style: true, name: "Popper", type: "Topwater", sizes: "2 – 8", when: "Summer mornings and evenings", note: "The reason a lot of people own a 6 wt in the first place.", },
  { name: "Woolly Bugger", type: "Streamer", sizes: "4 – 10", when: "Any time nothing is on top", note: "Black or olive, weighted. Catches smallmouth reliably enough to be boring.", },
  { name: "Clouser Deep Minnow", type: "Streamer", sizes: "2 – 8", when: "Deep pools, current seams", note: "Bob Clouser designed it for smallmouth on the Susquehanna before anyone put it in salt.", imitates: "Baitfish", origin: "Bob Clouser" },
  { style: true, name: "Crayfish pattern", type: "Streamer", sizes: "4 – 8", when: "Rocky bottom, late summer", note: "Fished slow and on the bottom. Smallmouth eat more crayfish than anything else.", imitates: "Crayfish" },
  { name: "Murdich Minnow", type: "Streamer", sizes: "2 – 6", when: "Clear water, following fish", note: "Flashy and mobile with a big head-wake on the strip.", origin: "Bill Murdich" },
  { name: "Sneaky Pete", type: "Topwater", sizes: "4 – 8", when: "Calm evenings", note: "A slider rather than a popper — subtler, and better for wary fish.", },
  { name: "Dahlberg Diver", type: "Topwater", sizes: "2 – 6", when: "Weed edges, low light", note: "Dives and swims on the strip, then floats back up. Deer-hair head.", origin: "Larry Dahlberg" },
  { name: "Gamechanger", type: "Streamer", sizes: "1/0 – 4", when: "Big fish, cold water", note: "Articulated to swim with a genuine S-motion at rest.", origin: "Blane Chocklett" },
  { style: true, name: "Hellgrammite pattern", type: "Nymph", sizes: "4 – 8", when: "Rocky rivers, all season", note: "Dobsonfly larvae live in exactly the water smallmouth do.", imitates: "Hellgrammite" },
];

const LANDLOCKED_AND_SEARUN: FlyPattern[] = [
  { name: "Grey Ghost", type: "Streamer", sizes: "2 – 8", when: "Ice-out and cold water", note: "Carrie Stevens' 1924 smelt imitation, and still the first streamer many people tie on at ice-out.", imitates: "Smelt", origin: "Carrie Stevens, Rangeley, Maine, 1924" },
  { name: "Black Ghost", type: "Streamer", sizes: "2 – 8", when: "Deep, cold water", note: "Black body, white wing, yellow hackle. Fishes well trolled or cast.", imitates: "Smelt", origin: "Herbert Welch, Rangeley, Maine — public debut 1927" },
  { name: "Nine-Three", type: "Streamer", sizes: "2 – 8", when: "Spring, cold lakes", note: "Green over white — named for the 9 lb 3 oz landlocked salmon taken on it from Messalonskee Lake the day after it was tied.", imitates: "Smelt", origin: "Dr. Herbert Sanborn and Emile Letourneau, Belgrade Lakes, Maine, 1949" },
  { name: "Supervisor", type: "Streamer", sizes: "2 – 8", when: "Ice-out", note: "Blue and green over white. Built for the weeks when smelt run and salmon follow.", imitates: "Smelt", origin: "Joseph Stickney, Maine" },
  { name: "Magog Smelt", type: "Streamer", sizes: "2 – 8", when: "Cold water", note: "A durable, flashy smelt dressing from Lake Memphremagog.", imitates: "Smelt" },
  { name: "Joe's Smelt", type: "Streamer", sizes: "2 – 8", when: "Spring, river mouths", note: "A simple and effective smelt imitation from the same New England tradition.", imitates: "Smelt" },
  { name: "Mickey Finn", type: "Streamer", sizes: "4 – 10", when: "Spring, high water", note: "Bright enough to find fish in stained water. A Maritime spring staple.", },
  { name: "Warden's Worry", type: "Streamer", sizes: "4 – 10", when: "Spring", note: "Orange-bodied Maine streamer that doubles as a sea-run brook trout fly.", origin: "Joseph Stickney, Maine" },
  { name: "Muddler Minnow", type: "Streamer", sizes: "4 – 10", when: "All season", note: "Works on sea-run trout as reliably as on resident brookies.", imitates: "Sculpin", origin: "Don Gapen, 1937" },
];

const SHAD_AND_OTHER: FlyPattern[] = [
  { style: true, name: "Shad Dart", type: "Streamer", sizes: "4 – 8", when: "Spring shad run, on the swing", note: "Small, bright, weighted. Shad take flash and movement rather than imitation.", },
  { style: true, name: "Pink and Silver Shad Fly", type: "Streamer", sizes: "4 – 8", when: "Shad, mid-river current", note: "Pink is the traditional shad colour for reasons nobody has fully explained.", },
  { style: true, name: "Mackerel fly (silver tinsel)", type: "Saltwater", sizes: "2 – 6", when: "Summer, mackerel schools off the wharves", note: "Mackerel will hit almost anything bright and fast. A strip of tinsel on a hook does it.", imitates: "Small bait" },
  { style: true, name: "White Bucktail", type: "Saltwater", sizes: "1/0 – 4", when: "Anywhere, any schooling fish", note: "The simplest saltwater fly there is, and it still catches everything from mackerel to stripers.", imitates: "Generic baitfish" },
  { style: true, name: "Chain Pickerel Streamer", type: "Streamer", sizes: "1/0 – 4", when: "Weedy bays, summer", note: "Big, flashy, and tied on wire or heavy fluorocarbon — pickerel teeth end tippets.", imitates: "Small baitfish" },
];

export const PATTERN_GROUPS: PatternGroup[] = [
  {
    quarry: "Atlantic salmon",
    blurb:
      "Fly-only by law, barbless, and every fish released. Summer fish in low clear water want small and sparse; autumn fish in height of water want more of everything. Much of the hairwing canon below was tied on the Miramichi and the Restigouche.",
    patterns: ATLANTIC_SALMON,
  },
  {
    quarry: "Brook trout",
    blurb:
      "The most available fly fish in the Maritimes — every county has water holding them. They are rarely selective; presentation beats pattern nearly always. The wet flies are the old Maritime tradition and still work.",
    patterns: BROOK_TROUT,
  },
  {
    quarry: "Striped bass",
    blurb:
      "The Miramichi estuary and the Northumberland Strait hold enormous numbers. Saltwater fly fishing on a freshwater doorstep — fish the tide rather than the clock.",
    patterns: STRIPED_BASS,
  },
  {
    quarry: "Smallmouth bass",
    blurb: "Warm-water fly fishing on the Saint John system and elsewhere, and the most reliable summer sport going.",
    patterns: SMALLMOUTH,
  },
  {
    quarry: "Landlocked & sea-run",
    blurb:
      "Landlocked salmon and sea-run brook trout, which both eat smelt and both come to the same century-old New England streamers. Fish them at ice-out and again in autumn.",
    patterns: LANDLOCKED_AND_SEARUN,
  },
  {
    quarry: "Shad, mackerel & pickerel",
    blurb:
      "The fisheries nobody plans a trip around and everybody enjoys. Shad on the spring run, mackerel off any wharf in July, pickerel in the weeds — all of them will take a fly.",
    patterns: SHAD_AND_OTHER,
  },
];

/** Every distinct type present, for the filter. */
export const PATTERN_TYPES: PatternType[] = [
  ...new Set(PATTERN_GROUPS.flatMap((g) => g.patterns.map((p) => p.type))),
].sort() as PatternType[];

/**
 * Distinct flies, not rows.
 *
 * Ten patterns are deliberately listed under more than one quarry — a Clouser Minnow
 * appears three times, a Grey Ghost twice — so summing the group lengths overcounts. The
 * old version did exactly that and reported 118 for a library that held fewer.
 */
export const TOTAL_PATTERNS = new Set(
  PATTERN_GROUPS.flatMap((g) => g.patterns.map((p) => p.name))
).size;

/** How many of those are a style rather than a specific named dressing. */
export const TOTAL_STYLES = new Set(
  PATTERN_GROUPS.flatMap((g) => g.patterns.filter((p) => p.style).map((p) => p.name))
).size;
