// The appearance options offered in Settings.
//
// Colour lives entirely in CSS — each id here matches a [data-theme="…"] block in
// globals.css, and switching is a single attribute on <html>. Type is the same idea
// with font-family variables. Nothing about either is computed at runtime, so a theme
// change costs one attribute write and no re-render of anything that matters.
//
// The swatches are duplicated from the CSS on purpose: the Settings picker has to draw
// every theme's colours while only one theme's custom properties are live, so it can't
// read them from the cascade.

export type ThemeId =
  | "harbour"
  | "chart"
  | "seaglass"
  | "paper"
  | "buff"
  | "mist"
  | "slate";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  group: "Dark" | "Mid-tone" | "Light";
  note: string;
  /** page, cards, brand, accent — drawn as the preview strip. */
  swatches: [string, string, string, string];
}

export const THEMES: ThemeOption[] = [
  {
    id: "harbour",
    name: "Deep Harbour",
    group: "Dark",
    note: "Night wheelhouse. Hull navy, no white anywhere — the one that won't blind you at 5am.",
    swatches: ["#0E1C28", "#17293A", "#5AD1C8", "#F3B84B"],
  },
  {
    id: "chart",
    name: "Weathered Chart",
    group: "Mid-tone",
    note: "Aged admiralty paper, dark enough to read as an actual colour.",
    swatches: ["#D9CEB6", "#EBE2CC", "#175E66", "#8F4E12"],
  },
  {
    id: "seaglass",
    name: "Sea Glass",
    group: "Mid-tone",
    note: "Surf-worn bottle green. Cool and quiet where the other two are warm.",
    swatches: ["#C3D4CE", "#DDE8E3", "#115B62", "#8C4A16"],
  },
  {
    id: "paper",
    name: "Chart Paper",
    group: "Light",
    note: "Warm off-white. The default, and the palest of the set.",
    swatches: ["#F1ECE3", "#FAF7F1", "#0E7490", "#D97706"],
  },
  {
    id: "buff",
    name: "Chart Buff",
    group: "Light",
    note: "Deeper buff. Set aside first time round because its amber failed contrast — darkened here to clear it.",
    swatches: ["#E8DFC9", "#F5F0E6", "#116069", "#8A4A10"],
  },
  {
    id: "mist",
    name: "Sea Mist",
    group: "Light",
    note: "Cool grey-blue. Passed over originally for sitting too close to white.",
    swatches: ["#E4EDEE", "#F2F7F7", "#0E6C82", "#8E4C0D"],
  },
  {
    id: "slate",
    name: "Slate Teal",
    group: "Light",
    note: "The deepest of the pale set, and the coolest.",
    swatches: ["#DCE7E9", "#EEF4F5", "#0D6274", "#8F4E10"],
  },
];

export const DEFAULT_THEME: ThemeId = "paper";

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((t) => t.id === value);
}

// --- Type ------------------------------------------------------------------

export type FontId = "instrument" | "charthouse" | "harbourmaster" | "system";

export interface FontOption {
  id: FontId;
  name: string;
  families: string;
  note: string;
}

export const FONTS: FontOption[] = [
  {
    id: "system",
    name: "Current",
    families: "Geist",
    note: "What the app ships with today — a clean neutral grotesk.",
  },
  {
    id: "instrument",
    name: "Instrument",
    families: "IBM Plex Sans + IBM Plex Mono",
    note: "Drawn at IBM for control panels. The numerals are the reason: tide heights and times never shift width as the digits change.",
  },
  {
    id: "charthouse",
    name: "Chart House",
    families: "Fraunces + Source Sans 3",
    note: "Fraunces carries a deliberate wobble from soft-serif wood type, so headings read closer to a hand-lettered chart legend.",
  },
  {
    id: "harbourmaster",
    name: "Harbourmaster",
    families: "Bricolage Grotesque + Public Sans",
    note: "A modern grotesque with the corners knocked off — signage rather than software.",
  },
];

export const DEFAULT_FONT: FontId = "system";

export function isFontId(value: unknown): value is FontId {
  return FONTS.some((f) => f.id === value);
}
