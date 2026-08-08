// Salt, fresh, or fine in both.
//
// A property of a piece of gear, not of a box. It cuts across the fly/conventional split
// on purpose: a 9 wt fly rod and a 7' medium-heavy spinning rod are both salt-water tools
// living in different boxes, and someone packing for a wharf wants both halves of that.
//
// Unset is a real and common state — nothing entered before this existed has an answer,
// and plenty of gear genuinely doesn't need one. The interface says "not said" rather than
// guessing, and the filters treat it as its own bucket rather than lumping it with "both".

export type WaterType = "salt" | "fresh" | "both";

export const WATER_TYPES: { value: WaterType; label: string; short: string; hint: string }[] = [
  {
    value: "salt",
    label: "Salt only",
    short: "Salt",
    hint: "Rinsed after every trip. Salt-rated bearings, coated hooks, or simply something you've decided not to risk in fresh.",
  },
  {
    value: "fresh",
    label: "Fresh only",
    short: "Fresh",
    hint: "Kept out of salt — untreated hooks and unsealed reels don't survive it long.",
  },
  {
    value: "both",
    label: "Both",
    short: "Both",
    hint: "Happily fished either side, given a rinse.",
  },
];

export const WATER_TYPE_LABEL: Record<WaterType, string> = {
  salt: "Salt",
  fresh: "Fresh",
  both: "Salt & fresh",
};

/** Emoji marker used on dense list rows where a word won't fit. */
export const WATER_TYPE_ICON: Record<WaterType, string> = {
  salt: "🌊",
  fresh: "🏞️",
  both: "🔄",
};

export function isWaterType(v: unknown): v is WaterType {
  return v === "salt" || v === "fresh" || v === "both";
}

/**
 * Whether an item is usable in the given water.
 *
 * "both" matches either. Untagged matches nothing — which is the point of the filter: it
 * answers "what have I said is safe in salt", not "what might be". An item you haven't
 * tagged isn't a maybe, it's an unanswered question, and the count line says how many.
 */
export function usableIn(itemWater: string | null | undefined, want: WaterType): boolean {
  if (!isWaterType(itemWater)) return false;
  return itemWater === want || itemWater === "both";
}

/** Column added by 20260810090000_tackle_water_type.sql. */
export const WATER_TYPE_FIELDS = ["water_type"] as const;

export const WATER_TYPE_UNSET_NOTE =
  "Items with no water tag aren't shown by this filter. Nothing entered before the tag existed has one — edit an item to say, or leave it blank.";

/**
 * The care note that actually matters, and the reason this tag is worth keeping.
 *
 * Not a regulation, just the thing that quietly destroys tackle. Salt is corrosive to
 * everything with a bearing, a hook point or a screw in it, and the damage is done between
 * trips rather than during them.
 */
export const SALT_CARE_NOTE =
  "Rinse anything that went in salt with cool fresh water the same day — reel exterior, rod guides and reel seat, hooks and split rings. Cool, not hot, and never under pressure into a reel's bearings. Dry it before it goes back in a closed box, because a damp box is worse than a wet rod.";
