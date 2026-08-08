// Making jigs, spinners, spinnerbaits and spoons.
//
// Two crafts, deliberately scoped. Jigs involve molten metal; spinners and their relatives
// involve wire, blades and hardware. Soft plastics and wooden plugs are not covered — they
// are their own hobbies with their own solvents, moulds and finishing schedules, and a
// section that gestured at them without teaching them would be worse than not having one.
//
// The lead safety lesson comes first and cannot be skipped in the ordering, because this is
// the only part of this app where following the instructions badly can poison somebody.
// Everything in it is standard practice rather than novel advice, and the section says
// plainly where the line is: if you don't want to handle lead, bismuth and tin alloys pour
// at similar temperatures and buying finished heads is a perfectly good answer.
//
// One video per lesson, each checked with scripts/verify-videos.mjs — see lib/tying.ts for
// why that script exists and what it caught.

export type CraftStage = "safety" | "jigs" | "spinners" | "spoons";

export interface CraftStageInfo {
  id: CraftStage;
  title: string;
  blurb: string;
}

export const CRAFT_STAGES: CraftStageInfo[] = [
  {
    id: "safety",
    title: "Before you melt anything",
    blurb:
      "Molten metal at 320–350 °C, and lead. Read this one properly — it is the only part of this app where doing it wrong hurts you rather than costing you a fish.",
  },
  {
    id: "jigs",
    title: "Jigs",
    blurb:
      "Pouring heads, curing paint, and dressing them with bucktail. The most useful thing you can make, and the cheapest per unit once you're going.",
  },
  {
    id: "spinners",
    title: "Spinners & spinnerbaits",
    blurb:
      "Wire, blades, clevises and beads. No heat, no fumes, and you can start on a kitchen table for the price of a couple of shop-bought spinners.",
  },
  {
    id: "spoons",
    title: "Spoons",
    blurb:
      "Blanks, hardware and finish. The simplest lure in the box and the one most worth tuning to a specific water.",
  },
];

export interface CraftLesson {
  stage: CraftStage;
  n: number;
  title: string;
  skill: string;
  steps: string[];
  materials?: string[];
  watchOut: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
}

export const CRAFT_LESSONS: CraftLesson[] = [
  // --- Safety ---------------------------------------------------------------
  {
    stage: "safety", n: 1,
    title: "Lead, heat and ventilation",
    skill: "Setting up so that nothing here can hurt you",
    steps: [
      "Work outdoors or in a garage with the door open and a fan moving air away from you. Never in a kitchen, never in a room anyone sleeps in.",
      "Keep children, pets and anyone pregnant out of the area entirely, and out of it afterwards until you've cleaned up.",
      "Wear safety glasses, closed shoes and gloves you can shake off fast. Long sleeves in natural fibre — synthetics melt onto skin.",
      "Everything that touches molten lead must be bone dry. A drop of water in a melting pot flashes to steam instantly and throws metal out of the pot; this is the classic serious injury in this hobby and it is entirely avoidable.",
      "Pre-heat moulds. A cold mould gives incomplete pours, and warming it on the pot rim is standard practice.",
      "Never eat, drink or smoke while working, and wash your hands and forearms properly afterwards — soap and cold water, not a wipe.",
      "Collect scrap and dross in a metal tin, not the household bin.",
    ],
    materials: [
      "Melting pot with thermostat",
      "Safety glasses and gloves",
      "A metal tin for dross",
      "A fan and open air",
    ],
    watchOut:
      "Moisture. Damp scrap, a damp mould, a wet ladle — any of them can cause a steam explosion. Dry everything, and add scrap to a cold pot rather than dropping it into molten metal.",
    videoId: "8Y7TAEyH468",
    videoTitle: "Everything You Need To Know About Lead Pouring and Jig Making — Beginners Guide",
    videoChannel: "N2TW_customlures",
  },
  {
    stage: "safety", n: 2,
    title: "If you'd rather not handle lead at all",
    skill: "Knowing the alternatives before you commit",
    steps: [
      "Buy unpainted jig heads and start at the painting and dressing lessons. You lose nothing that matters and skip the melting entirely.",
      "Consider tin or bismuth alloys, which pour at similar temperatures and are far less toxic — heavier on the wallet, lighter for the same volume, so sizes differ from a lead equivalent.",
      "Spinners, spinnerbaits and spoons involve no melting at all. If you want to make tackle and not deal with any of this, start there instead.",
      "Some jurisdictions restrict lead tackle in specific waters or sizes. It is not a general ban in Canada, but it is worth checking your provincial guide before you make two hundred of something.",
    ],
    watchOut:
      "Assuming this section is a formality. Nothing further in the jig lessons is dangerous once the setup is right — and none of it is safe if the setup is wrong.",
  },

  // --- Jigs -----------------------------------------------------------------
  {
    stage: "jigs", n: 3,
    title: "Pouring a jig head",
    skill: "Clean, complete castings",
    steps: [
      "Set the pot to roughly 320–350 °C. Too cool gives incomplete, wrinkled heads; far too hot burns off tin and oxidises quickly.",
      "Flux the melt and skim the dross off the top with a steel spoon into your tin.",
      "Seat a hook in the mould so the eye and shank sit exactly in their recesses — a hook half out of its groove ruins the head and can jam the mould.",
      "Close the mould, hold it firmly, and pour in one steady motion into the sprue until it's slightly proud.",
      "Wait a few seconds, open the mould, and knock the head out. Trim the sprue with side cutters.",
      "Inspect: wrinkles mean the mould or the melt was too cool, gaps mean the pour was too slow or hesitant.",
    ],
    materials: ["Jig mould", "Jig hooks", "Lead or alloy", "Side cutters", "Steel spoon"],
    watchOut:
      "A cold mould. The first three or four pours from any session are usually rejects — that's normal, remelt them, keep going.",
    videoId: "5-EJM9r8UOA",
    videoTitle: "How To Pour Jig Heads (Beginner Bait Making Series)",
    videoChannel: "FishIN with GRAMPS",
  },
  {
    stage: "jigs", n: 4,
    title: "Powder painting and curing",
    skill: "A finish that survives rocks",
    steps: [
      "Clean the head — any oil or release agent and the paint won't key.",
      "Heat the head with a heat gun or over a small flame until it's hot enough to melt powder on contact, but not glowing.",
      "Dip it into powder paint for about a second and pull it straight out. Tap the hook shank to shed excess.",
      "Clear the hook eye immediately with a bodkin or a paperclip while the paint is still soft. Once cured it's a drill job.",
      "Cure in an oven at the powder manufacturer's stated temperature and time — typically around 175 °C for 20 minutes. Uncured powder paint chips off on the first rock.",
      "Add eyes after curing, then a drop of clear coat over each if you want them to stay.",
    ],
    materials: ["Powder paint", "Heat gun", "Toaster oven kept for the purpose", "Bodkin"],
    watchOut:
      "Skipping the oven cure. Dipped-and-cooled paint looks finished and isn't; it's the single most common reason home-painted jigs chip immediately. And use an oven you don't cook in.",
    videoId: "DvZmwEArR2s",
    videoTitle: "How To Powder Coat Jig Heads (The simple way)",
    videoChannel: "Angler West TV",
  },
  {
    stage: "jigs", n: 5,
    title: "Dressing a bucktail jig",
    skill: "Tying hair onto a painted head",
    steps: [
      "Clamp the jig in a vice by the hook bend, head to your right, and start thread on the collar behind the head.",
      "Cut a small bunch of bucktail, clean the underfur out of the butts, and stack the tips if you want them even.",
      "Tie the first bunch under the shank, then a second on top — building around the shank rather than on one side keeps it swimming straight.",
      "Add flash sparsely between bunches.",
      "Build a smooth thread collar, whip finish, and coat it with head cement or UV resin.",
    ],
    materials: ["Painted jig heads", "Bucktail", "Flash", "140 denier thread", "Head cement"],
    watchOut:
      "Too much hair. An over-dressed bucktail doesn't pulse — it just holds a shape and swims like a lump of felt.",
    videoId: "0epn6bSuwUU",
    videoTitle: "How To Tie Bucktail Jigs & Paint Jig Heads",
    videoChannel: "Maine Trout Whisperer",
  },

  // --- Spinners -------------------------------------------------------------
  {
    stage: "spinners", n: 6,
    title: "Forming wire loops",
    skill: "The one skill the whole category rests on",
    steps: [
      "Use 0.024–0.032\" stainless or nickel-titanium spinner wire. Softer wire opens under load.",
      "Grip the wire in round-nose pliers where you want the loop, and roll the pliers rather than bending the wire around them.",
      "Wrap the tag end around the main shaft three or four tight turns, touching, with no gaps.",
      "Trim the tag flush and press the cut end down so it can't catch a finger or a line.",
      "A wire-forming tool makes this repeatable if you're making more than a handful — worth it at about the twentieth spinner, not the second.",
    ],
    materials: ["Spinner wire 0.024–0.032\"", "Round-nose pliers", "Side cutters"],
    watchOut:
      "Loose wraps. A gap in the wrap is where the loop pulls open, and it always happens on the fish rather than in your hand.",
    videoId: "oZxFa5D8vUg",
    videoTitle: "How to use a wire forming tool",
    videoChannel: "CONRANCAT",
  },
  {
    stage: "spinners", n: 7,
    title: "Building an inline spinner",
    skill: "Stacking the components in the right order",
    steps: [
      "Form the front loop on your wire first — that's the line tie.",
      "Thread on a unique bead or two as spacers, then the clevis carrying the blade, with the blade's concave side facing the loop.",
      "Add body beads or a metal body behind the clevis.",
      "Slide on the treble or single hook at the rear and form the closing loop, or fix the hook with a swivel.",
      "Test it in a sink or a bucket: the blade should start turning almost immediately on a slow retrieve. If it doesn't, the blade is on backwards or too big for the shaft.",
    ],
    materials: ["Spinner wire", "Blades (Colorado, Indiana or willow)", "Clevises", "Beads", "Hooks"],
    watchOut:
      "The blade the wrong way round. It's the commonest build error and it stops the spinner working entirely rather than working badly.",
    videoId: "6bs2_-Y528E",
    videoTitle: "How To Build Custom Inline Spinner Lures",
    videoChannel: "Mud Hole Custom Tackle",
  },
  {
    stage: "spinners", n: 8,
    title: "Building a spinnerbait",
    skill: "A safety-pin frame that runs true",
    steps: [
      "Bend the R-bend or twisted-eye frame from spinnerbait wire — the line tie sits at the bend, not at either end.",
      "Slide blade hardware onto the upper arm: swivel, clevis and blades, in the order you want them to run.",
      "Attach the head-and-hook assembly to the lower arm.",
      "Add the skirt over the collar with a skirt band or wire wrap.",
      "Tune it: if it rolls on the retrieve, bend the upper arm slightly toward the vertical until it tracks upright.",
    ],
    materials: ["Spinnerbait wire", "Painted spinnerbait heads", "Blades and swivels", "Silicone skirts"],
    watchOut:
      "A frame out of plane. If the two arms aren't in the same plane the whole lure rolls, and no amount of retrieve speed fixes it.",
    videoId: "sGoN7F2iHsg",
    videoTitle: "How to build your own Spinnerbaits",
    videoChannel: "Roland Martin Outdoors",
  },
  {
    stage: "spinners", n: 9,
    title: "Making your own skirts",
    skill: "The part that's genuinely cheaper to make than to buy",
    steps: [
      "Cut silicone skirt material into a bundle of the length you want, allowing for the collar.",
      "Bunch the strands and hold them around a mandrel — a pen barrel or a dowel works.",
      "Slip a skirt band over the mandrel and onto the middle of the bundle, then release.",
      "Fold the strands back over the band so they all point one way.",
      "Slide it onto the jig or spinnerbait collar. Trim to length last, on the lure rather than off it.",
    ],
    materials: ["Silicone skirt tabs", "Skirt bands", "A pen barrel or skirt tool"],
    watchOut:
      "Trimming before it's on the lure. Skirts always look longer off the jig than on it, and you can't add material back.",
    videoId: "7OHIIOgQeMk",
    videoTitle: "How To Make Your Own Spinnerbait Skirts",
    videoChannel: "The Scoochie Moffit Show",
  },

  // --- Spoons ---------------------------------------------------------------
  {
    stage: "spoons", n: 10,
    title: "From blank to finished spoon",
    skill: "Hardware, balance and finish",
    steps: [
      "Start with a stamped blank rather than cutting your own — the curve is what makes a spoon wobble, and getting it right by hand is a project of its own.",
      "Drill or open the holes at each end if the blank doesn't have them, and deburr both sides.",
      "Finish the face: tape and paint, foil tape, or leave it bare metal and polish it. Cure paint properly the same way as jig heads.",
      "Add split rings at both ends, a swivel at the front and the hook at the rear. A split ring at the hook end lets it swing.",
      "Test the action in water. Too fast a roll means it's too thin or too curved for the retrieve; a slight bend flattens the action out.",
    ],
    materials: ["Spoon blanks", "Split rings and split-ring pliers", "Swivels", "Treble or single hooks"],
    watchOut:
      "Hooking straight to the blank without a split ring. It kills the action and eventually wears through the hole.",
    videoId: "ZJXGsS_C15w",
    videoTitle: "How to build your own spoon lures! Step by step.",
    videoChannel: "Fishing Philosophy",
  },
  {
    stage: "spoons", n: 11,
    title: "A cheap spoon from scratch",
    skill: "Making one with almost no kit",
    steps: [
      "Cut a blank from sheet brass or copper with tin snips — 0.5–0.8 mm is a workable thickness.",
      "Round every edge with a file. A sharp-edged spoon cuts line and fingers.",
      "Form the curve by tapping it into a shallow wooden hollow with a ball-pein hammer, or over a socket.",
      "Drill both ends, deburr, polish or paint.",
      "Fit split rings, swivel and hook, then test and adjust the curve.",
    ],
    materials: ["Sheet brass or copper", "Tin snips", "File", "Ball-pein hammer", "Drill"],
    watchOut:
      "Over-curving. A deep bend makes a spoon spin instead of wobble, which twists your line badly. Go shallower than you think.",
    videoId: "Qm0k3nqbH1o",
    videoTitle: "Make A Salmon Spoon For $2",
    videoChannel: "Natural Selection Angling",
  },
];

// ---------------------------------------------------------------------------
// Reference
// ---------------------------------------------------------------------------

export interface BladeRow {
  shape: string;
  spin: string;
  use: string;
}

export const BLADE_GUIDE: BladeRow[] = [
  {
    shape: "Colorado",
    spin: "Wide, almost at right angles to the shaft",
    use: "Most vibration, most lift, slowest retrieve. Best in stained water and cold water, and the easiest to fish slowly.",
  },
  {
    shape: "Indiana",
    spin: "Moderate — an oval compromise",
    use: "The middle option, and a sensible default if you only stock one shape.",
  },
  {
    shape: "Willow",
    spin: "Tight, close to the shaft",
    use: "Least vibration, most flash, cuts through weed. Wants a faster retrieve; good in clear water.",
  },
];

export interface JigWeightRow {
  weight: string;
  use: string;
}

export const JIG_WEIGHTS: JigWeightRow[] = [
  { weight: "1/64 – 1/32 oz", use: "Smelt, and perch through the ice." },
  { weight: "1/16 – 1/8 oz", use: "Perch, white perch, small stream work." },
  { weight: "1/4 – 3/8 oz", use: "Smallmouth on the bottom, striped bass in light current." },
  { weight: "1/2 – 1 oz", use: "Striped bass in real current, and shore work in wind." },
  { weight: "2 – 6 oz", use: "Vertical jigging for pollock and cod from a boat." },
];

export const LURE_MAKING_ECONOMICS = [
  "Jigs are the clear win: after the mould and pot, a head costs pennies and you can pour the exact weight you keep losing.",
  "Spinners roughly break even on materials and win on customisation — blade, body and hook combinations nobody sells together.",
  "Spinnerbait skirts are cheaper to make than to buy by a wide margin, and take minutes.",
  "Spoons from blanks are about the same price as buying them. Make them because you want a specific size and finish, not to save money.",
];

export const CRAFT_CREDIT_NOTE =
  "Every video is somebody else's work, linked and credited by channel — nothing here is hosted or mirrored. Each was checked with scripts/verify-videos.mjs when it was added, which confirms the video is public and returns its real title. Links still rot; re-run the script rather than trusting this note.";

export const LEAD_WARNING =
  "Lead is toxic and molten metal burns. Everything in the jig lessons assumes you have read the safety lesson and set up accordingly — outdoors or well ventilated, dry everything, eye protection, nobody else in the room. If that isn't practical for you, buy finished heads and start at the painting lesson; you lose nothing that matters.";
