// Safety reference for Maritime waters.
//
// Sources, all primary:
//   • Transport Canada, Safe Boating Guide TP 511E (2026 edition) — the minimum
//     equipment tables, the notes that qualify them, the distress-call format and the
//     sail-plan fields are transcribed from it rather than paraphrased. The numbers are
//     the law; rewording them in friendlier language is how people end up carrying the
//     wrong thing.
//   • Canadian Red Cross — ice thickness guidance.
//   • Canadian Coast Guard — Joint Rescue Coordination Centre Halifax covers all three
//     Maritime provinces, which is the one thing here worth memorising.
//
// The point of this living inside a fishing app rather than a bookmark is that the app
// already knows things a static page can't: the water temperature where you fish, the
// state of the tide, and how long until it turns. Those turn general advice into a
// specific answer about today. See lib/safety-assessment.ts for that part.

export const JRCC_HALIFAX = {
  name: "Joint Rescue Coordination Centre Halifax",
  toll: "1-800-565-1582",
  direct: "902-427-8200",
  covers: "New Brunswick, Nova Scotia and Prince Edward Island",
};

export interface EquipmentItem {
  label: string;
  detail?: string;
  /** Conditions under which the requirement doesn't apply, quoted from TP 511E's notes. */
  exemption?: string;
}

export interface VesselClass {
  id: string;
  label: string;
  blurb: string;
  categories: { heading: string; items: EquipmentItem[] }[];
}

// Transcribed from TP 511E's minimum-equipment tables. The notes are attached to the
// items they qualify, because a requirement read without its exemption is how someone
// ends up buying a radar reflector for a canoe.
export const VESSEL_CLASSES: VesselClass[] = [
  {
    id: "paddle",
    label: "Canoe, kayak or paddleboard",
    blurb: "Human-powered craft, any length.",
    categories: [
      {
        heading: "Lifesaving",
        items: [
          { label: "1 lifejacket or PFD for each person on board" },
          {
            label: "1 reboarding device",
            exemption: "Only if you'd have to climb more than 0.5 m (1'8\") to get back in.",
          },
          { label: "1 buoyant heaving line at least 15 m (49'3\") long" },
        ],
      },
      {
        heading: "Visual signals",
        items: [
          {
            label: "1 watertight flashlight, or 3 flares (at most 1 a smoke signal)",
            detail: "Or 1 electronic visual distress signal plus 1 smoke signal.",
            exemption:
              "Flares aren't required on a river, canal or lake where you can never be more than 1 nautical mile (1.852 km) from shore.",
          },
        ],
      },
      {
        heading: "Vessel safety",
        items: [
          {
            label: "1 bailer or manual bilge pump",
            exemption:
              "Not required if the craft can't hold enough water to capsize it, or its compartments are sealed.",
          },
        ],
      },
      {
        heading: "Navigation",
        items: [
          { label: "1 sound-signalling device" },
          {
            label: "Navigation lights",
            exemption: "Only if used after sunset, before sunrise, or in poor visibility.",
          },
          {
            label: "1 magnetic compass",
            exemption: "Not required at 8 m (26'3\") or under if you stay within sight of navigation marks.",
          },
        ],
      },
    ],
  },
  {
    id: "under6",
    label: "Boat up to 6 m",
    blurb: "Most tin boats, skiffs and small runabouts — under 19'8\".",
    categories: [
      {
        heading: "Lifesaving",
        items: [
          { label: "1 lifejacket or PFD for each person on board" },
          {
            label: "1 reboarding device",
            exemption: "Only if the climb back aboard from the water is more than 0.5 m (1'8\").",
          },
          { label: "1 buoyant heaving line at least 15 m (49'3\") long" },
        ],
      },
      {
        heading: "Visual signals",
        items: [
          {
            label: "1 watertight flashlight, or 3 flares (at most 1 a smoke signal)",
            detail: "Or 1 electronic visual distress signal plus 1 smoke signal. Motorised boats only.",
            exemption:
              "Flares aren't required where you can never be more than 1 nautical mile from shore on a river, canal or lake.",
          },
        ],
      },
      {
        heading: "Vessel safety",
        items: [
          { label: "1 manual propelling device, or an anchor with at least 15 m (49'3\") of cable, rope or chain" },
          {
            label: "1 bailer or manual bilge pump",
            exemption: "Not required if the boat can't hold enough water to capsize it.",
          },
        ],
      },
      {
        heading: "Navigation",
        items: [
          { label: "1 sound-signalling device" },
          { label: "Navigation lights", exemption: "Only if used after dark or in poor visibility." },
          {
            label: "1 magnetic compass",
            exemption: "Not required at 8 m or under if you stay within sight of navigation marks.",
          },
          {
            label: "1 radar reflector",
            exemption:
              "Not required in limited traffic, daylight and good weather, or where the boat is too small to fit one.",
          },
        ],
      },
      {
        heading: "Fire fighting",
        items: [
          {
            label: "1 5BC fire extinguisher",
            exemption:
              "Only if the boat has an inboard engine, a fixed fuel tank of any size, or a fuel-burning cooking, heating or refrigerating appliance.",
          },
        ],
      },
    ],
  },
  {
    id: "six-to-nine",
    label: "Boat 6–9 m",
    blurb: "19'8\" to 29'6\".",
    categories: [
      {
        heading: "Lifesaving",
        items: [
          { label: "1 lifejacket or PFD for each person on board" },
          { label: "1 reboarding device", exemption: "Only if the climb from the water exceeds 0.5 m." },
          {
            label: "1 buoyant heaving line at least 15 m long, OR 1 lifebuoy on a buoyant line at least 15 m long",
          },
        ],
      },
      {
        heading: "Visual signals",
        items: [
          {
            label: "1 watertight flashlight AND 6 flares (at most 2 smoke signals)",
            detail: "Or 1 electronic visual distress signal plus 1 smoke signal.",
            exemption:
              "Halve the flare count if you carry a VHF radio, satellite phone, cell phone in coverage, a 406 MHz PLB worn by the operator, or an EPIRB.",
          },
        ],
      },
      {
        heading: "Vessel safety",
        items: [
          { label: "1 manual propelling device, or an anchor with at least 15 m of cable, rope or chain" },
          { label: "1 bailer or manual bilge pump" },
        ],
      },
      {
        heading: "Navigation",
        items: [
          { label: "1 sound-signalling device" },
          { label: "Navigation lights", exemption: "Only if used after dark or in poor visibility." },
          {
            label: "1 magnetic compass",
            exemption: "Not required at 8 m or under if within sight of navigation marks.",
          },
          { label: "1 radar reflector", exemption: "See the exemptions for limited traffic and good visibility." },
        ],
      },
      {
        heading: "Fire fighting",
        items: [
          {
            label: "1 5BC fire extinguisher",
            exemption:
              "Only if the boat has an inboard engine or a fuel-burning cooking, heating or refrigerating appliance.",
          },
        ],
      },
    ],
  },
  {
    id: "nine-to-twelve",
    label: "Boat 9–12 m",
    blurb: "29'6\" to 39'4\".",
    categories: [
      {
        heading: "Lifesaving",
        items: [
          { label: "1 lifejacket or PFD for each person on board" },
          { label: "1 reboarding device" },
          { label: "1 buoyant heaving line at least 15 m long" },
          { label: "1 lifebuoy attached to a buoyant line at least 15 m long" },
        ],
      },
      {
        heading: "Visual signals",
        items: [
          {
            label: "1 watertight flashlight AND 12 flares (at most 6 smoke signals)",
            detail: "Or 1 electronic visual distress signal plus 1 smoke signal.",
            exemption: "Halve the flare count if you carry a two-way radio, PLB or EPIRB.",
          },
        ],
      },
      {
        heading: "Vessel safety",
        items: [
          { label: "1 anchor with at least 30 m (98'5\") of cable, rope or chain" },
          { label: "1 manual bilge pump or bilge-pumping arrangements" },
        ],
      },
      {
        heading: "Navigation",
        items: [
          { label: "1 sound-signalling device" },
          { label: "Navigation lights" },
          { label: "1 magnetic compass" },
          { label: "1 radar reflector" },
        ],
      },
      {
        heading: "Fire fighting",
        items: [
          { label: "1 10BC fire extinguisher if the boat has a motor" },
          {
            label: "1 10BC fire extinguisher if it has a fuel-burning cooking, heating or refrigerating appliance",
          },
        ],
      },
    ],
  },
  {
    id: "shore",
    label: "Fishing from shore",
    blurb: "No vessel — wading, wharf, beach or riverbank.",
    categories: [
      {
        heading: "Nothing is legally required",
        items: [
          {
            label: "Transport Canada's equipment rules apply to vessels, not to people standing in water",
            detail:
              "Which is exactly why shore anglers drown: nobody hands you a checklist. The list below is what actually kills people here.",
          },
        ],
      },
      {
        heading: "Worth carrying anyway",
        items: [
          {
            label: "A wading belt, worn tight",
            detail:
              "Cinched at the waist it keeps waders from filling. Waders don't drag you under the way folklore says, but a bootful of cold water ends your ability to walk out.",
          },
          { label: "A charged phone in a waterproof pouch, and someone who knows where you are" },
          {
            label: "A wading staff",
            detail: "Three points of contact on a rocky Maritime river bottom is not optional in current.",
          },
          { label: "An inflatable PFD if you wade deep, fish alone, or fish at night" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Cold water
// ---------------------------------------------------------------------------

export interface ColdWaterStage {
  window: string;
  title: string;
  what: string;
  doThis: string[];
}

/**
 * The 1-10-1 principle, as Transport Canada publishes it.
 *
 * Presented with its limits stated, because the numbers are a memory aid rather than a
 * clock. The National Center for Cold Water Safety argues the "1 hour" is misleading —
 * adults generally take well over an hour to become severely hypothermic, and believing
 * you have only sixty minutes has caused searches to be called off and victims to give
 * up. The first minute, on the other hand, is the part that is well established and the
 * part that actually kills: people drown during cold shock, they do not freeze.
 */
export const COLD_WATER_STAGES: ColdWaterStage[] = [
  {
    window: "1 minute",
    title: "Cold shock",
    what:
      "You gasp involuntarily, then hyperventilate at 6 to 10 times your normal rate. It is automatic and it happens to strong swimmers exactly as it happens to everyone else. If your head is under when you gasp, you drown here.",
    doThis: [
      "Keep your airway above water — nothing else matters for this minute",
      "Don't fight it. Float and let the breathing settle",
      "Do not try to swim until it does",
    ],
  },
  {
    window: "10 minutes",
    title: "Cold incapacitation",
    what:
      "Your hands, then arms and legs, stop doing what you tell them. You lose the ability to swim, to hold onto the boat, to handle a flare, to put on a PFD you weren't already wearing.",
    doThis: [
      "Use this window for self-rescue — it is the only window you get",
      "If you can't get out, get as much of your body onto anything that floats",
      "H.E.L.P. position alone; huddle if there are others",
    ],
  },
  {
    window: "1 hour+",
    title: "Hypothermia",
    what:
      "Core temperature drops below 35°C. Shivering, slurred speech, a weak or hard-to-find pulse. This is the slow part — far slower than most people assume.",
    doThis: [
      "Keep still; movement pumps warm blood to cold limbs",
      "Stay with the boat if it floats — it's easier to spot than a head",
      "Rescuers: handle gently and horizontally, and don't stop because someone looks gone",
    ],
  },
];

export const COLD_WATER_CAVEAT =
  "1-10-1 is a memory aid, not a countdown. The one-minute figure is the well-established part and the part that kills — people drown during cold shock rather than freezing. Survival past an hour is common, and both rescuers and casualties should assume there is more time than the slogan suggests, not less.";

/** Below this, Transport Canada advises thermal protection. */
export const COLD_WATER_THRESHOLD_C = 15;

// ---------------------------------------------------------------------------
// Ice
// ---------------------------------------------------------------------------

export interface IceGuide {
  minCm: number;
  label: string;
}

/** Canadian Red Cross figures, for clear blue ice on fresh water. */
export const ICE_THICKNESS: IceGuide[] = [
  { minCm: 15, label: "One person walking, skating or skiing" },
  { minCm: 20, label: "A group — several people spread out" },
  { minCm: 25, label: "A snowmobile or ATV" },
  { minCm: 30, label: "A car or light truck" },
];

export const ICE_NOTES = [
  "Those numbers are for clear blue or black ice. White or opaque snow ice is roughly half as strong — double the thickness. Grey ice has water in it and holds nothing.",
  "Ice over salt or brackish water is weaker than the same thickness over fresh, which matters on every estuary smelt fishery in the province.",
  "Thickness is never uniform. Current, springs, a river mouth, a bridge piling or a shoal all thin it locally. Measure as you go out, not once at the shore.",
  "Nobody else's tracks are evidence. They tell you the ice held a different weight at a different hour.",
];

// ---------------------------------------------------------------------------
// Distress
// ---------------------------------------------------------------------------

export const DISTRESS_SCRIPT_FIELDS = [
  "Your position — latitude and longitude, or a bearing and distance from a named landmark",
  "The nature of the emergency",
  "The help you need",
  "How many people are aboard, and the condition of anyone injured",
  "A description of the boat and whether it's still seaworthy",
];

export const MAYDAY_VS_PANPAN = [
  {
    term: "MAYDAY",
    when: "Immediate danger to life",
    examples: "Sinking, fire aboard, someone overboard in cold water, a life-threatening medical emergency",
  },
  {
    term: "PAN-PAN",
    when: "Urgent, but nobody is dying yet",
    examples: "Lost power and drifting toward a shipping lane, navigation lights failed, a non-critical injury",
  },
];

export const SAIL_PLAN_STORAGE_KEY = "ma_float_plan";
