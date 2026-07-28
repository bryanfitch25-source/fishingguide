// Editorial month-by-month activity map per species (region-wide approximation).
// Months are 1-12. "months" = when a shore/boat angler realistically targets this
// species in NB/NS/PEI, drawn from the season/timing sections of each guide.
// This drives the "Fish Near Me" page; the species page regulations remain authoritative.

export interface Seasonality {
  months: number[];
  note?: string;
}

export const SEASONALITY: Record<string, Seasonality> = {
  "atlantic-mackerel": { months: [7, 8, 9, 10], note: "Inshore mainly August into fall" },
  "striped-bass": { months: [4, 5, 6, 7, 8, 9, 10], note: "Peak May-October along the coast" },
  "atlantic-salmon": { months: [6, 7, 8, 9], note: "Catch-and-release fly fishery; check river-specific seasons" },
  "brook-trout": { months: [4, 5, 6, 7, 8, 9], note: "Best spring and fall; slower in summer heat" },
  "rainbow-trout": { months: [4, 5, 6, 7, 8, 9, 10, 11], note: "PEI runs an extended fall season" },
  "brown-trout": { months: [4, 5, 6, 7, 8, 9], note: "Dusk and after-dark best" },
  "landlocked-salmon": { months: [5, 6, 7, 8, 9], note: "Spring and early summer troll/cast windows" },
  "smallmouth-bass": { months: [4, 5, 6, 7, 8, 9], note: "Fall feeding window is reliably aggressive" },
  "largemouth-bass": { months: [5, 6, 7, 8, 9] },
  "chain-pickerel": { months: [5, 6, 7, 8, 9], note: "Also a popular ice-fishing target where open in winter" },
  "muskellunge": { months: [6, 7, 8, 9, 10], note: "Saint John River specialty fishery" },
  "yellow-perch": { months: [1, 2, 5, 6, 7, 8, 9, 12], note: "Open-water summer plus a classic ice fishery" },
  "white-perch": { months: [5, 6, 7, 8, 9, 10] },
  "american-shad": { months: [5, 6], note: "Short spring run — timing varies with water temperature" },
  "gaspereau": { months: [5, 6], note: "Spring river run, a few weeks after the smelt" },
  "rainbow-smelt": { months: [1, 2, 4, 5, 11, 12], note: "Spring spawning run plus winter ice fishery" },
  "american-eel": { months: [6, 7, 8, 9, 10] },
  "atlantic-cod": { months: [7, 8], note: "Short DFO windows — confirm current-year dates before going" },
  "pollock": { months: [6, 7, 8, 9, 10], note: "Zero-retention in the Gulf Region — NS Atlantic/Fundy side only" },
  "atlantic-herring": { months: [5, 6, 7, 8, 9, 10, 11], note: "Jigged around lit wharves after dark" },
  "winter-flounder": { months: [5, 6, 7, 8, 9] },
  "acadian-redfish": { months: [], note: "Deepwater species — not a realistic shore/inshore recreational target" },
  "spiny-dogfish": { months: [7, 8, 9] },
  "cunner": { months: [5, 6, 7, 8, 9, 10] },
  "atlantic-tomcod": { months: [1, 2, 12], note: "A winter ice/estuary tradition; incidental catch in summer" },
  "sculpin": { months: [5, 6, 7, 8, 9, 10], note: "Mostly an incidental/bonus catch" },
  "bluefin-tuna": { months: [7, 8, 9, 10], note: "Licensed charter fishery — not a DIY target" },
};

export function isInSeason(slug: string, month: number): boolean {
  return SEASONALITY[slug]?.months.includes(month) ?? false;
}
