# Maritime Angler — Roadmap Workshop Draft

Status: **all 5 updates shipped** (2026-08-03). Two items were intentionally scoped
out during the build and are worth a look before considering this fully "done":
- **Season-opening push reminders** (Update 2) — skipped. Regulation seasons are
  stored as free text ("Apr 15 – Oct 31") rather than structured start/end dates,
  which isn't reliably parseable for a reminder. License-expiry and gear-maintenance
  reminders both work as designed.
- **Imperial/metric unit toggle** (noted in the final review pass below) — not
  built. Length/weight stay free-text as before.

Everything else in Parts 1-3 below was built as described. This file is kept as
the historical planning record.

---

Original status note (kept for context): **theoretical only** — nothing here gets built until you say so. This is a
discussion document: 20 raw ideas → refined into 10 objectives → combined into 5
update paths. Everything listed only uses tools/data that are free with no API key
or paid tier required, and fits the current stack (Next.js on Vercel, Supabase,
browser-native APIs). Nothing here needs a native mobile app, a paid API, or
infrastructure beyond what's already running.

---

## Part 1 — 20 Raw Ideas

Grouped loosely by theme, not yet filtered or merged.

**Environmental data (all free, no API key)**
1. Tide charts on location/Near Me pages, from Canada's Integrated Water Level
   System (CHS/DFO) — free public API, ~800 Canadian stations, covers the Maritimes.
2. Current conditions + short forecast from Environment Canada's MSC GeoMet API —
   anonymous, free, no key.
3. Sunrise/sunset times computed locally (same kind of math already used for moon
   phase) — no API needed at all.
4. A "Good Fishing Day" indicator combining moon phase (already built) + tide
   window + barometric pressure trend from EC data.

**Reliability & app infrastructure**
5. PWA support — installable icon, offline caching of the guide content so it works
   with no signal at the wharf.
6. Web Push notifications (self-hosted, free — browser standard, no third-party
   service) for license renewal and season-opening reminders.
7. Full data export/backup — one-click JSON download of your tackle, trays, and
   catches, so your data is never locked in.

**Media & gear**
8. Multi-photo galleries per catch or tackle item, not just one photo.
9. Auto-fill catch location from a photo's embedded GPS (EXIF) instead of the
   manual "Use my location" button — via the free `exifr` library, confirmed on npm.
10. Gear maintenance log — service dates / line-change reminders per rod or reel.

**Species guide tools**
11. Seasonality calendar as a visual heatmap instead of the current text list.
12. Species side-by-side comparison tool.
13. Knot-tying & rigging reference section (static content, same pattern as the
    existing species guides).

**Trip tools**
14. Trip planner sheet — combine species + location + regs + tackle checklist into
    one page for a specific outing.
15. Print-friendly stylesheets for the Catch Log and Tackle inventory (CSS print
    media, no new library) for a paper backup or a buddy to check.

**Navigation & input**
16. Site-wide search bar across species guides (and, once signed in, your tackle
    and catches).
17. Voice-to-text quick catch logging using the browser's built-in speech
    recognition — no server-side transcription needed.

**Map**
18. Interactive regional map (Leaflet + free OpenStreetMap tiles, no API key) with
    pins for location guides and, once signed in, your own catch spots.

**Personal stats**
19. Year-in-review recap — best catches, most-used gear, personal bests, all pulled
    from data you already log.
20. Species "life list" — a simple badge/checklist of every species you've caught
    at least once, building on the catch log.

---

## Part 2 — 10 Objectives (refined from the 20)

Each objective merges 2–3 of the ideas above into one coherent scope.

**1. Environmental Conditions Engine**
*(Ideas 1, 2, 3, 4)* — Pull in free tide and weather data, compute sunrise/sunset
locally, and fuse them with the moon phase already built into a single "Good
Fishing Day" read-out. This becomes the data foundation several later features
build on.

**2. Installable, Reliable App**
*(Ideas 5, 6, 10)* — PWA offline support so the guide works with no signal, plus
free web-push reminders — expanded to cover license renewal, season openings, and
gear maintenance (line changes, reel service).

**3. Data Ownership**
*(Idea 7)* — One-click full export of everything you've logged. Small in scope but
important on its own: your data should never be stuck in the app.

**4. Richer Media & Gear Records**
*(Ideas 8, 9, 10 media half)* — Multi-photo galleries for catches and tackle, and
automatic location capture from a photo's EXIF data instead of a manual GPS
button.

**5. Smarter Species Tools**
*(Ideas 11, 12, 13)* — A visual seasonality heatmap, a side-by-side species
comparison tool, and a knot/rigging reference section.

**6. Trip Planning & Printable Reports**
*(Ideas 14, 15)* — A single-page trip planner (species + location + regs +
checklist) and print-friendly Catch Log / Tackle Box layouts.

**7. Unified Search**
*(Idea 16)* — One search bar across the guide content, and — once signed in — your
own tackle and catch history.

**8. Hands-Free Logging**
*(Idea 17)* — Voice-to-text quick entry for the Catch Log, for logging a catch
without putting your rod down.

**9. Interactive Map**
*(Idea 18)* — A real map (Leaflet + OpenStreetMap, free, no key) showing location
guides and your own pinned catch spots, instead of the current OSM link-out.

**10. Personal Stats & Recap**
*(Ideas 19, 20)* — Expand the existing stats dashboard into a full year-in-review
and a species life-list with simple milestone badges.

---

## Part 3 — 5 Update Paths (the roadmap)

Each update pairs two objectives that reinforce each other, and each update builds
on infrastructure the previous one laid down.

### Update 1 — "Know Before You Go" (Objectives 1 + 9)
**Environmental Conditions Engine + Interactive Map**

The foundational release: real tide and weather data, local sunrise/sunset, and a
combined "Good Fishing Day" score, all surfaced on an actual interactive map of
NB/NS/PEI locations instead of the current text list + link-out. This is the
biggest new-data-source update and everything downstream (trip planner, hands-free
logging in the field) assumes this exists.

- Tide chart widget per location guide (CHS/DFO API)
- Current conditions + forecast strip (EC MSC GeoMet API)
- Locally computed sunrise/sunset alongside existing moon phase
- "Good Fishing Day" score combining all of the above
- Leaflet map with location-guide pins; signed-in users see their own catch pins
- Objective: replace guesswork about *when and where* with real data, in one place

### Update 2 — "Never Lose It" (Objectives 2 + 3)
**Installable App + Data Ownership**

A trust-and-durability release: make the app work with no signal, remind you of
things before you need them, and guarantee your data is never trapped.

- PWA manifest + service worker, offline caching of guide content
- Web push reminders: license renewal date (user-entered), season openings
  (from existing regs data), gear maintenance due dates
- One-click JSON export of tackle, trays, and catches
- Objective: the app should be dependable enough to stop thinking about

### Update 3 — "The Full Record" (Objectives 4 + 10)
**Richer Media & Gear Records + Personal Stats & Recap**

Deepens the personal data you're already collecting — more photos, auto-located
catches, gear health tracking — and turns it into a proper personal archive with a
year-in-review and a species life list.

- Multi-photo galleries on catches and tackle items
- EXIF-based auto-location on photo upload (with manual override still available)
- Gear maintenance log tied into Update 2's reminder system
- Expanded stats dashboard → year-in-review recap
- Species life-list with milestone badges
- Objective: your logged history becomes something worth looking back on, not just
  a table

### Update 4 — "Trip Day" (Objectives 6 + 8)
**Trip Planning & Printable Reports + Hands-Free Logging**

A field-use release: plan before you go, log without breaking stride once you're
there. Directly builds on Update 1's environmental data and Update 3's gear
records.

- Trip planner sheet: pick a location + species, pull in regs, season status,
  Good Fishing Day score, and a tackle checklist in one page
- Print-friendly Catch Log / Tackle Box layouts (and the trip sheet itself)
- Voice-to-text quick catch logging
- Objective: reduce the friction between "I'm standing at the water" and "it's
  logged"

### Update 5 — "Know Your Water" (Objectives 5 + 7)
**Smarter Species Tools + Unified Search**

A capstone polish release once the personal-data side is mature: make the growing
guide and personal content actually fast to navigate and compare.

- Seasonality heatmap view
- Species side-by-side comparison tool
- Knot & rigging reference section
- Site-wide search across guide content, and your tackle/catches when signed in
- Objective: finding and comparing information should be as fast as the app has
  gotten at recording it

---

## Notes for workshopping

- All environmental data sources are confirmed free and keyless as of this
  writing: CHS/DFO tide API (https://api-iwls.dfo-mpo.gc.ca) and Environment
  Canada's MSC GeoMet (https://api.weather.gc.ca). Both require accepting a
  standard open-data license, not payment or an account.
- Leaflet + OpenStreetMap tiles are free for an app at this scale; heavy
  production traffic would eventually want to self-host tiles, not a concern here.
- Web push notifications use the browser-native standard (VAPID keys generated
  once, no third-party push service) — free, but does need a small server-side
  piece (a Supabase Edge Function or a Vercel cron route) to actually send
  scheduled reminders like season openings.
- Nothing above requires a paid API tier, a native mobile build, or new hosting.
- Update ordering is a suggestion, not a constraint — the objectives were designed
  to combine differently if you'd rather resequence (e.g. do Update 3 before
  Update 2).

## Final review pass (added before building)

A few things caught on the last read-through, worth folding in rather than
starting a new list:

- **"Good Fishing Day" needs a disclaimer.** It's a fun indicator built from moon
  phase + tide + pressure trend, not a validated fishing model — Update 1 should
  label it clearly as informal so nobody mistakes it for advice, the way the app
  already tells people to check DFO directly for regulations.
- **Cache the free environmental API calls server-side.** Tide/weather data
  doesn't change every second — Update 1 should fetch through Next's server-side
  cache (e.g. revalidate every 30–60 min) instead of hitting CHS/EC on every page
  load. Keeps the app fast and is just good etiquette toward a free public API.
- **Unit toggle (imperial/metric).** Length and weight are free-text today
  ("18 in", "2.5 lb"). Small addition worth bundling into Update 3 alongside the
  media/gear work: a simple preference toggle, since bilingual/metric users exist
  in the Maritimes too.
- **PWA needs real icon assets.** Update 2's installable-app piece requires a
  manifest.json plus 192px/512px icons — small task, just flagging it's not only
  code.
- Nothing else looked missing or unrealistic on this pass — the 5-update sequence
  stands as written above.
