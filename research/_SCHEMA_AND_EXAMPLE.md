# Species Guide JSON Spec

Every species guide is one JSON file: `research/<slug>.json`. Follow this shape EXACTLY (it feeds a Supabase seed script). Write in the same voice as the example below: practical, specific, locally-grounded (real place names in NB/NS/PEI), no filler, every factual/regulatory claim backed by a real source you actually looked up via WebSearch/WebFetch.

```json
{
  "slug": "atlantic-mackerel",
  "common_name": "Atlantic Mackerel",
  "scientific_name": "Scomber scombrus",
  "category": "saltwater",
  "provinces": ["NB", "NS", "PEI"],
  "summary": "Fast-swimming schooling baitfish-sized gamefish, best fished around wharves and breakwaters on a moving tide, August through fall.",
  "sections": [
    { "heading": "Know the Fish", "body_md": "...", "sources": [{"label": "NH Fish & Game, Atlantic Mackerel", "url": "https://..."}] },
    { "heading": "When to Go", "body_md": "...", "sources": [...] },
    { "heading": "Where to Find Them", "body_md": "...", "sources": [...] },
    { "heading": "Gear", "body_md": "markdown table with | Item | Recommendation |", "sources": [] },
    { "heading": "Technique", "body_md": "...numbered steps / sub-headings as needed...", "sources": [...] },
    { "heading": "Handling & Release", "body_md": "...", "sources": [...] },
    { "heading": "Conservation & Consumption Notes", "body_md": "...", "sources": [...] }
  ],
  "regulations": [
    { "province": "NB", "water_type": "Tidal/saltwater", "season": "No closed season", "bag_limit": "No specific limit found in DFO notices — fish conservatively", "size_limit": "None", "notes": "No provincial licence needed in tidal water.", "source_url": "https://www.glf.dfo-mpo.gc.ca/...", "last_verified": "2026" }
  ],
  "quick_reference": [
    { "label": "Season", "value": "August through fall inshore" },
    { "label": "Best Time", "value": "Dawn and dusk" },
    { "label": "Tide", "value": "3 hrs before high through 1 hr after" }
  ],
  "sources": [
    { "label": "NH Fish & Game, Atlantic Mackerel", "url": "https://..." },
    { "label": "DFO — Recreational Groundfish Fishery, Southern Gulf of St. Lawrence", "url": "https://www.glf.dfo-mpo.gc.ca/en/recreational-groundfish-fishery-southern-gulf-st-lawrence-0" }
  ]
}
```

## Rules

1. **`regulations` must cover all 3 provinces where the species is legally fishable** (NB, NS, PEI) — pull actual current season dates / bag limits / size limits from official sources: DFO Gulf Region / DFO Maritimes Region notices for tidal/saltwater species, and the relevant provincial angling guide for freshwater species (New Brunswick GNB Fish Regulations Summary, Nova Scotia Anglers' Handbook, PEI Fishing/Hunting/Trapping regs). If a species has no closed season / no specific bag limit in official notices, say so explicitly rather than inventing a number. Always note whether a provincial angling licence is required (freshwater) vs not (tidal saltwater).
2. **Every non-obvious factual claim needs a real source** in that section's `sources` array — a URL you actually found via search, not a guess. If you can't verify something, phrase it as "commonly reported by local anglers" rather than stating it as fact, and cite the forum/site where you saw it.
3. Use real, specific NB/NS/PEI place names for "Where to Find Them" (specific rivers, wharves, lakes, bays) wherever you can source them — general angler forums (novascotiafishing.com, newbrunswickfishing.com), Fishbrain location listings, Outdoor Canada, Fish'n Canada, tourism sites, DFO/provincial pages are all fair game.
4. `body_md` is markdown — use `##`/`###` sub-headings, bullet lists, and pipe tables (`| Col | Col |`) freely within a section.
5. Keep the tone identical to the example: direct, no hedging filler, short paragraphs, technique described as concrete actions ("cast up-and-across, retrieve with short lifts") not vague advice.
6. `slug` is kebab-case, matches filename.
7. Note clearly if a species is catch-and-release only, has a moratorium, is invasive (must-retain in certain zones), or has a mercury/consumption advisory — these matter a lot to NB/NS/PEI anglers and show up in the source docs' style.
8. Write `research/<slug>.json` as valid, parseable JSON (no trailing commas, no comments in the actual file).

## Full worked example

See `research/atlantic-mackerel.json` in this same folder once written — it's the canonical example transcribed from an existing published guide. Match its depth and citation density per species (each section should have 1-3 sources).
