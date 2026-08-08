// Learning to tie flies, as a course and then as a reference.
//
// Ordered rather than alphabetical, because the skills stack. You cannot tie a Bomber
// before you can spin deer hair, and you cannot spin deer hair before you have thread
// control. Each lesson names the skill it adds, so someone can start where they actually
// are instead of at the top.
//
// One video per lesson, and every one of them checked.
//
// `scripts/verify-videos.mjs` resolves each ID through YouTube's oEmbed endpoint, which
// answers exactly the right question — does this resolve to a public, embeddable video —
// and returns the real title and channel so the link can be checked against what the
// lesson claims it shows. The check has already earned its keep: it caught a link that
// returned 403 before it ever shipped.
//
// A link that passes today can rot tomorrow. Re-run the script rather than trusting this
// comment, and if something has died, replace it rather than leaving it.
//
// The videos are other people's work, credited by channel. Nothing here is hosted or
// mirrored; they are links, and they belong to the tyers who made them.

export type TyingStage = "basics" | "trout" | "streamers" | "salmon" | "salt";

export interface TyingStageInfo {
  id: TyingStage;
  title: string;
  blurb: string;
}

export const TYING_STAGES: TyingStageInfo[] = [
  {
    id: "basics",
    title: "Before your first fly",
    blurb:
      "Tools, and the two skills every fly depends on. Rushing this is the single most common reason people give up — a fly that falls apart was never a materials problem.",
  },
  {
    id: "trout",
    title: "Trout flies",
    blurb:
      "Four flies that between them teach dry, nymph, wet and streamer. Tie each one six times before moving on; the sixth is where it starts to look right.",
  },
  {
    id: "streamers",
    title: "Deer hair and streamers",
    blurb:
      "The technique that unlocks the Maritime canon. Spinning and packing deer hair is a genuinely different skill from anything above, and it is the gate to Bombers and buck bugs.",
  },
  {
    id: "salmon",
    title: "Maritime salmon flies",
    blurb:
      "Hairwings, buck bugs and Bombers — the flies that were tied on the Miramichi and the Restigouche and then travelled. Barbless from the vice, because it is the law on this water.",
  },
  {
    id: "salt",
    title: "Saltwater",
    blurb:
      "Bigger hooks, coarser materials, and durability over delicacy. A striper fly that survives twenty fish beats a beautiful one that survives two.",
  },
];

export interface TyingLesson {
  stage: TyingStage;
  n: number;
  title: string;
  skill: string;
  /** What to actually do, in order. */
  steps: string[];
  materials?: string[];
  /** The trap that catches nearly everyone at this stage. */
  watchOut: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
}

export const TYING_LESSONS: TyingLesson[] = [
  // --- Basics ---------------------------------------------------------------
  {
    stage: "basics", n: 1,
    title: "The tools, and which ones matter",
    skill: "Knowing what to buy and what to skip",
    steps: [
      "Buy a vice that holds a hook without slipping and nothing more expensive than that. A rotary vice is a luxury, not a requirement.",
      "Get a ceramic-insert bobbin. A cheap metal one frays thread and will make you think you're doing something wrong.",
      "Fine-tipped scissors, hackle pliers, a bodkin, and a whip-finish tool. That's the whole list.",
      "Set the vice so the hook shank sits at your eye level when you're sitting upright. Working hunched over is why people's backs give out before their patience does.",
      "Light it from the side, not from behind you — side light shows the profile you're actually building.",
    ],
    watchOut:
      "Buying a kit with sixty materials and no thread you like. The bobbin and scissors are what you touch every second; everything else can be upgraded later.",
    videoId: "-iRcDoPI5B0",
    videoTitle: "A Beginners Guide to Fly Tying Tools",
    videoChannel: "Gig Harbor Fly Shop",
  },
  {
    stage: "basics", n: 2,
    title: "Thread control and the whip finish",
    skill: "Starting, holding and finishing — every fly needs all three",
    steps: [
      "Start the thread: hold the tag against the shank and wind back over itself five or six turns, then trim the tag.",
      "Learn that thread torque rotates materials. Thread pulled from the far side twists a material toward you; use it deliberately rather than fighting it.",
      "Practise a pinch wrap — trapping a material exactly where you want it instead of letting it roll around the shank.",
      "Learn the whip finish with a tool first, then by hand. Do it twenty times on a bare hook before you put a material on one.",
      "Finish with head cement or UV resin only after the whip finish, never instead of it.",
    ],
    materials: ["Bare hooks, size 10–12", "70 denier thread", "A whip-finish tool"],
    watchOut:
      "Half hitches instead of a whip finish. They hold until the third fish, which is the worst possible time to find out.",
    videoId: "Xg0QhClfJ3s",
    videoTitle: "Thread Control and Fly Tying Knots Tutorial for beginners",
    videoChannel: "Lou DiGena",
  },

  // --- Trout ----------------------------------------------------------------
  {
    stage: "trout", n: 3,
    title: "Woolly Bugger",
    skill: "Palmered hackle, tail proportion, weighting",
    steps: [
      "Start thread and wrap a base along the shank. Add lead-free wire wraps at the front third if you want it to sink.",
      "Tie in a marabou tail about one shank-length long — no longer, or it fouls around the hook on the cast.",
      "Tie in chenille and a saddle hackle at the rear, tip first.",
      "Wind the chenille forward to just behind the eye and tie off.",
      "Palmer the hackle forward in evenly spaced open turns, tie off, whip finish.",
    ],
    materials: ["Streamer hook size 6–10", "Marabou", "Chenille", "Saddle hackle", "Lead-free wire"],
    watchOut:
      "A tail twice as long as it should be. It looks better in the vice and fouls constantly on the water.",
    videoId: "jXLwvWl5vpM",
    videoTitle: "How to Tie a Perfect Wooly Bugger",
    videoChannel: "Fly Fish Food",
  },
  {
    stage: "trout", n: 4,
    title: "Elk Hair Caddis",
    skill: "Stacking hair, and a wing that floats",
    steps: [
      "Start thread mid-shank and tie in a hackle at the rear.",
      "Dub a slim body forward, then palmer the hackle over it and secure.",
      "Cut, clean and stack a small bunch of elk hair so the tips are even.",
      "Measure the wing to just past the hook bend, then tie down with two soft wraps followed by tightening ones — that order is what stops the hair flaring wildly.",
      "Trim the butts to form a small head, whip finish.",
    ],
    materials: ["Dry fly hook 12–16", "Elk hair", "Dry fly hackle", "Fine dubbing"],
    watchOut:
      "Pulling the first wrap tight. Hollow hair flares under pressure — two soft wraps to position, then tighten.",
    videoId: "gSQmSXC3dHM",
    videoTitle: "How to tie the Elk Hair Caddis | Classic Dry Fly Patterns",
    videoChannel: "AvidMax",
  },
  {
    stage: "trout", n: 5,
    title: "Pheasant Tail Nymph",
    skill: "Working with fine fibres, ribbing, and slimness",
    steps: [
      "Slide a bead on and start thread behind it.",
      "Tie in three or four pheasant tail fibres as a short tail, plus a length of fine copper wire.",
      "Wind the same fibres forward as the body, then rib with the wire in the opposite direction — counter-ribbing is what makes it survive teeth.",
      "Build a small thorax with peacock herl.",
      "Pull a wingcase of pheasant tail over the thorax, tie down, whip finish.",
    ],
    materials: ["Nymph hook 14–18", "Cock pheasant tail fibres", "Fine copper wire", "Peacock herl", "Bead"],
    watchOut:
      "Building it fat. A Pheasant Tail's whole virtue is being slimmer than everything else in the box.",
    videoId: "GmRVKBGxERw",
    videoTitle: "Pheasant Tail — How to Tie Step by Step",
    videoChannel: "Ventures Fly Co.",
  },
  {
    stage: "trout", n: 6,
    title: "Gold-Ribbed Hare's Ear",
    skill: "Dubbing a rough, buggy body",
    steps: [
      "Start thread, tie in a short tail of hare's mask guard hairs and a length of oval gold tinsel.",
      "Dub a tapered body — deliberately rough. Spikiness is the pattern.",
      "Rib forward with the tinsel in open even turns.",
      "Dub a fatter thorax, then pick it out with a bodkin or velcro so fibres stand off the body.",
      "Whip finish. Resist tidying it.",
    ],
    materials: ["Nymph hook 12–18", "Hare's mask dubbing", "Oval gold tinsel"],
    watchOut:
      "Making it neat. A tidy Hare's Ear catches fewer fish than a scruffy one — the picked-out fibres are the point.",
    videoId: "onRxwgr_4lo",
    videoTitle: "Fly Tying Tutorial: Gold Ribbed Hare's Ear",
    videoChannel: "Fly Fish Food",
  },
  {
    stage: "trout", n: 7,
    title: "Soft hackle wet fly",
    skill: "A sparse hackle that breathes",
    steps: [
      "Start thread at the eye and run a thin silk or thread body back and forward.",
      "Tie in a partridge or hen feather by the tip at the front.",
      "Take one and a half turns — no more. Two full turns is already too much.",
      "Stroke the fibres back and secure with a few thread wraps.",
      "Form a tiny head and whip finish.",
    ],
    materials: ["Wet fly hook 12–16", "Partridge or hen hackle", "Silk or fine thread"],
    watchOut:
      "Too much hackle. The fly works because a handful of fibres pulse in the current; a dense collar just makes it stiff.",
    videoId: "EjPqtRw_LFU",
    videoTitle: "Tying a Soft Hackle Wet Fly with Davie McPhail",
    videoChannel: "Davie McPhail",
  },

  // --- Deer hair and streamers ---------------------------------------------
  {
    stage: "streamers", n: 8,
    title: "Spinning deer hair",
    skill: "The gate to every Maritime salmon bug",
    steps: [
      "Use a bare shank and coarse body hair, not fine wing hair — they behave completely differently.",
      "Hold a cleaned, stacked bunch on top of the shank and take two loose wraps.",
      "Pull straight down and let go of the hair as you tighten. It flares and spins around the shank; that is correct.",
      "Pack it back hard with a hair packer or your thumbnail before adding the next bunch. Packing is most of the density.",
      "Repeat forward, whip finish, then trim to shape with curved scissors — bottom flat first, then the sides.",
    ],
    materials: ["Coarse deer body hair", "Strong thread (140 denier or GSP)", "A hair packer", "Curved scissors"],
    watchOut:
      "Thread that snaps. Deer hair needs real tension — go to 140 denier or GSP and stop trying to do it with 70.",
    videoId: "kZiCvL49EbM",
    videoTitle: "Fly Tying: Spinning Deer Hair — Tips and Techniques",
    videoChannel: "Gunnar Brammer",
  },
  {
    stage: "streamers", n: 9,
    title: "Muddler Minnow",
    skill: "A spun and trimmed head with a stacked collar",
    steps: [
      "Tie in a mottled turkey tail slip as the tail, then a flat tinsel body.",
      "Add an underwing of grey squirrel and a matched pair of turkey quill slips as the wing.",
      "Spin a bunch of deer hair immediately in front of the wing, leaving the tips swept back as a collar.",
      "Spin and pack two or three more bunches forward to fill the head.",
      "Trim the head to a broad wedge, leaving the collar untouched.",
    ],
    materials: ["Streamer hook 4–10", "Mottled turkey quill", "Flat gold tinsel", "Grey squirrel", "Deer body hair"],
    watchOut:
      "Trimming the collar off with the head. Mark where the collar ends before the scissors come out.",
    videoId: "udB6vZhDjTU",
    videoTitle: "Muddler Minnow Fly Tying Instructions by Charlie Craven",
    videoChannel: "Charlie's Fly Box",
  },

  // --- Maritime salmon ------------------------------------------------------
  {
    stage: "salmon", n: 10,
    title: "Green Machine",
    skill: "The Miramichi buck bug",
    steps: [
      "Pinch the barb flat at the vice. On salmon water it is a legal requirement, not a preference.",
      "Start thread and tie in a butt of fluorescent green floss or a short deer-hair tuft at the rear.",
      "Wind a green floss body forward.",
      "Spin and trim a slim deer-hair body over it — slim, not bulky. This is fished damp in the film, not floating high.",
      "Add the front tuft, whip finish, and cement the head.",
    ],
    materials: ["Salmon hook 4–10, barbless", "Green floss", "Brown or natural deer hair"],
    watchOut:
      "Trimming it fat like a Bomber. A buck bug that floats high isn't fishing where a Green Machine is meant to fish.",
    videoId: "dsLKqCdNbVE",
    videoTitle: "Fly Tying the Green Machine salmon/steelhead fly with Barry Ord Clarke",
    videoChannel: "The Feather Bender",
  },
  {
    stage: "salmon", n: 11,
    title: "Bomber",
    skill: "A full clipped deer-hair body that skates",
    steps: [
      "Barbless hook, and tie in a calf tail or hackle tail at the rear plus a wing of the same at the front.",
      "Tie in a saddle hackle at the rear to be palmered later.",
      "Spin deer hair the length of the whole shank, packing hard at every step.",
      "Whip finish, then trim to a cigar shape — flat underneath, tapered both ends.",
      "Palmer the hackle forward through the trimmed body and tie off.",
    ],
    materials: ["Salmon hook 2–8, barbless", "Deer body hair", "Calf tail", "Saddle hackle"],
    watchOut:
      "Not packing hard enough. A loose Bomber waterlogs, stops skating, and the whole point of the fly is the wake.",
    videoId: "eYyGOScQukg",
    videoTitle: "Tying a Classic Bomber Dry Fly for Atlantic Salmon and More",
    videoChannel: "CMNH Trout Club TV",
  },

  // --- Saltwater ------------------------------------------------------------
  {
    stage: "salt", n: 12,
    title: "Clouser Deep Minnow",
    skill: "Dumbbell eyes, and a fly that rides hook-up",
    steps: [
      "Tie dumbbell eyes on top of the shank about a third back from the eye, using figure-of-eight wraps and a drop of resin.",
      "Tie a sparse bunch of bucktail in front of the eyes — this becomes the belly when the fly inverts.",
      "Add a few strands of flash.",
      "Turn the hook over in the vice and tie the darker top wing behind the eyes.",
      "Whip finish and coat the head. Chartreuse over white first.",
    ],
    materials: ["Saltwater hook 2–1/0", "Dumbbell eyes", "Bucktail, white and chartreuse", "Flash"],
    watchOut:
      "Too much bucktail. A sparse Clouser swims; a thick one is a paintbrush that pushes water and sinks badly.",
    videoId: "x3TPnVTG13I",
    videoTitle: "Clouser Minnow Fly Tying Instructions — Tied by Charlie Craven",
    videoChannel: "InTheRiffle",
  },
  {
    stage: "salt", n: 13,
    title: "Lefty's Deceiver",
    skill: "Building length without bulk",
    steps: [
      "Tie four to six saddle hackles at the rear of the shank, curving inward so they don't splay.",
      "Add flash along the sides.",
      "Tie in bucktail at the front, on top and underneath, to build the head profile and hide the tie-in.",
      "Keep it sparse — you're building a silhouette, not a volume.",
      "Whip finish, add eyes if you want them, and coat the head.",
    ],
    materials: ["Saltwater hook 1/0–3/0", "Saddle hackles", "Bucktail", "Flash"],
    watchOut:
      "Hackles splaying outward. Set them curve-in at the tie-in point or the fly opens like a hand in the water.",
    videoId: "ed-hyjZtPiI",
    videoTitle: "Lefty's Deceiver Fly Tying Instructions by Charlie Craven",
    videoChannel: "Charlie's Fly Box",
  },
];

// ---------------------------------------------------------------------------
// Reference
// ---------------------------------------------------------------------------

export interface ThreadRow {
  denier: string;
  use: string;
}

export const THREAD_GUIDE: ThreadRow[] = [
  { denier: "70", use: "Small dries and nymphs, size 14 and down. Fine enough to keep heads tiny." },
  { denier: "140", use: "The general-purpose size — wets, streamers, most salmon hairwings." },
  { denier: "210 / GSP", use: "Deer hair. You need tension that will snap anything lighter." },
];

export interface ProportionRow {
  part: string;
  rule: string;
}

/** The proportions that make a fly look like the picture. */
export const PROPORTIONS: ProportionRow[] = [
  { part: "Tail", rule: "One shank length. Longer fouls; shorter looks stubby." },
  { part: "Body", rule: "Two-thirds of the shank, leaving room for hackle and head." },
  { part: "Dry fly hackle", rule: "One and a half to two hook gapes in diameter." },
  { part: "Wing (dry)", rule: "Shank length, standing upright." },
  { part: "Wing (streamer)", rule: "One and a half to two shank lengths." },
  { part: "Head", rule: "Never longer than one hook-eye width. A big head is the giveaway of a rushed fly." },
];

export const COMMON_FAULTS = [
  "Crowding the eye. Stop a full eye-width back from where you think you should — every beginner runs out of room, every time.",
  "Too much material. Nearly every fly that looks wrong has more on it than it needs, not less.",
  "Not enough thread tension, so materials rotate on the shank. Pull harder than feels safe; find where the thread actually breaks so you know the ceiling.",
  "Skipping the whip finish. Half hitches fail on the fish, not at the vice.",
  "Tying one of everything instead of six of one. Repetition is what builds a hand, and the sixth fly is where it starts to look right.",
  "Trying to learn deer hair on 70 denier thread. It cannot be done, and it isn't your technique.",
];

export const TYING_CREDIT_NOTE =
  "Every video is somebody else's work, linked and credited by channel — nothing here is hosted or mirrored. Each link was checked against YouTube's oEmbed endpoint when it was added, which confirms the video is public and returns its real title. Links still rot; scripts/verify-videos.mjs re-checks them all.";

export const TYING_SALMON_NOTE =
  "Pinch the barb at the vice, not on the river with cold hands and a fish waiting. Barbless is the law on every sea-run Atlantic salmon water in New Brunswick and Nova Scotia.";
