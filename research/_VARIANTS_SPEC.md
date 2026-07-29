# Adding `variants` to species JSON files

Each `research/<slug>.json` gets a new top-level `"variants"` array, inserted after
`"quick_reference"`. This powers a "Forms & Lookalikes" section on each species page.

## What counts as a variant

Most Maritime fish have no true taxonomic subspecies. What matters to an angler standing
on a wharf or streambank is:

| `kind` | Meaning | Example |
|---|---|---|
| `form` | Same species, different life-history strategy | Sea-run ("salter") vs. resident brook trout |
| `stock` | Same species, genetically/managed as separate population | Miramichi/sGSL vs. Bay of Fundy striped bass |
| `life-stage` | A stage anglers encounter and name separately | Glass eel / elver / yellow eel / silver eel |
| `lookalike` | A *different* species commonly confused with it | Juvenile striped bass mistaken for white perch |
| `related-species` | A close relative sharing the same name/habitat | Grubby vs. longhorn sculpin; alewife vs. blueback herring |

**Include a `lookalike` whenever misidentifying it has a real consequence** — a different
bag limit, a protected species, a mandatory-retention invasive, or a fish that must be
released (e.g. Atlantic salmon parr in a trout stream, undersized striped bass mistaken
for white perch). These are the highest-value entries in the whole feature.

## Shape

```json
"variants": [
  {
    "name": "Sea-Run Brook Trout (\"Salter\")",
    "kind": "form",
    "scientific_name": null,
    "how_to_tell": "Bright chrome-silver flanks with washed-out spotting compared to the vivid marbling of a resident stream fish; the red spots with blue halos are still visible up close. Reverts to typical brook trout colouring within days of re-entering fresh water.",
    "where_found": "Tidal and estuary reaches of coastal rivers across all three provinces — the Cocagne and Shediac (NB), Boughton and Morell (PEI), and most NS coastal systems.",
    "notes": "Best targeted May through early July as fish gorge on estuary baitfish and shrimp. Falls under the same provincial licence and limits as resident brook trout — there is no separate sea-run category.",
    "image_query": "Salvelinus fontinalis"
  }
]
```

### Field rules

- **`name`** — what an angler would call it, not a textbook name.
- **`kind`** — exactly one of: `form`, `stock`, `life-stage`, `lookalike`, `related-species`.
- **`scientific_name`** — only for `lookalike` / `related-species` (a genuinely different
  species). `null` for `form` / `stock` / `life-stage`.
- **`how_to_tell`** — the most important field. Concrete, visible field marks: fin shape,
  spot pattern, lateral line, jaw length, tail fork, colour. Write it so someone holding a
  wet fish can act on it. Never vague ("looks similar but different").
- **`where_found`** — real NB/NS/PEI waters where this specifically turns up. Say "region-wide"
  only if that's genuinely true.
- **`notes`** — regulatory or practical consequence. **If misidentification affects what's
  legal to keep or release, say so explicitly here.**
- **`image_query`** — a Wikimedia Commons search term, usually the scientific name. For
  `form`/`life-stage` entries where no distinct photo exists, use `null`.

## Rules

1. **2-5 variants per species.** If a species genuinely has none worth listing, use an empty
   array `[]` rather than padding it with filler.
2. **Verify identification details** via WebSearch/WebFetch against DFO species pages,
   provincial ID guides, or FishBase — don't write field marks from memory. Getting a
   distinguishing feature backwards is worse than omitting the variant.
3. Do not touch any other field in the JSON files. Only add the `variants` array.
4. Keep the existing house style: direct, concrete, no hedging filler, no em dashes.
5. The file must remain valid, parseable JSON.

## Known high-value entries (research and confirm these specifically)

- **gaspereau** — "gaspereau" covers *two* species, alewife (*Alosa pseudoharengus*) and
  blueback herring (*A. aestivalis*). Explain how to tell them apart (eye size, peritoneum
  colour) since they're managed and run together.
- **white-perch** — juvenile striped bass are routinely mistaken for white perch. Stripes,
  body depth, and tooth patches on the tongue distinguish them. A kept undersize striper is
  a real offence.
- **brook-trout** — Atlantic salmon parr in the same streams must be released immediately.
- **sculpin** — grubby, longhorn, and shorthorn sculpin plus sea raven are all encountered.
- **acadian-redfish** — *S. fasciatus*, *S. mentella*, and *S. norvegicus* are separate species.
- **chain-pickerel / muskellunge** — plus northern pike and redfin pickerel. Mandatory-retention
  invasive rules make correct ID legally consequential in some NB fishery areas.
- **atlantic-cod / pollock / atlantic-tomcod** — the gadid trio, routinely confused, with
  different retention rules (pollock is zero-retention in the Gulf Region).
- **winter-flounder** — vs. yellowtail flounder, witch flounder, American plaice.
- **american-eel** — the four named life stages.
- **atlantic-salmon** — grilse vs. multi-sea-winter, plus parr and smolt.
- **bluefin-tuna** — "school" vs. "giant" size classes, plus yellowfin/bigeye/albacore.
- **spiny-dogfish** — vs. smooth dogfish; note the venomous dorsal spines for handling.
