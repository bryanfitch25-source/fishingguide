# Maritime Angler

A web app of recreational fishing guides for **New Brunswick, Nova Scotia, and Prince
Edward Island** — 27 species guides plus location-based trip guides, each covering
identification, seasons, where to go, gear, technique, handling, and per-province
regulations with links to official DFO / provincial sources.

Alongside the guide it carries live **tide predictions** for any Canadian station, a
personal **tackle box**, and a **catch log** that records the conditions at the moment
of each catch.

Built with Next.js (App Router) + Supabase (Postgres). Installable to an iPhone Home
Screen as a PWA.

## Structure

| Path | What it is |
|---|---|
| `app/` | The Next.js application (deploy this folder) |
| `app/supabase/migrations/` | Database schema + seeded content as SQL migrations |
| `app/scripts/generate-seed-sql.mjs` | Regenerates seed SQL from the research JSON |
| `app/scripts/seed.mjs` | Alternative: seed via Supabase service-role API key |
| `research/` | Source-of-truth guide content, one JSON file per species / trip guide |
| `research/_SCHEMA_AND_EXAMPLE.md` | Content JSON spec for adding new species |
| `SETUP.md` | Full setup, deployment, and content-editing instructions |

## Quick start

```bash
cd app
npm install
npm run dev
```

Requires `app/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `app/.env.local.example`). The database schema and
content are applied via `supabase db push` — see SETUP.md.

## Content warning

Fishing regulations change with little notice via DFO variation orders and annual
provincial guides. Several flagged items in SETUP.md need human verification against
official sources before anyone treats this app as legal advice. Every species page links
to the official source for exactly this reason.

## Sections

| Route | What it does | Sign-in |
|---|---|---|
| `/guide` | Species guides, trip guides, regulations, seasonality, knots, Fish Near Me | No |
| `/tides` | Current tide + 24h curve, marine conditions, solunar periods, 7-day forecast | No |
| `/spots` | Every favourited station's tide compared side by side | Yes |
| `/tackle` | Tackle inventory, trays, gear maintenance | Yes |
| `/catches` | Catch log, quick logging, patterns, year in review, life list | Yes |
| `/settings` | Tide station, units, angler profile, reminders | Yes |

## Data sources

All free and keyless:

- **Tides** — Canadian Hydrographic Service [IWLS](https://api-iwls.dfo-mpo.gc.ca)
- **Weather** — Environment Canada [MSC GeoMet](https://api.weather.gc.ca)
- **Marine + hourly** — [Open-Meteo](https://open-meteo.com) (wave, swell, sea temp)
- **Place search** — OpenStreetMap [Nominatim](https://nominatim.openstreetmap.org)
- **Sun, moon, solunar** — computed locally, no API

Sunrise/sunset, moon phase and solunar feeding periods are all calculated in-app
(`src/lib/sun.ts`, `moonphase.ts`, `solunar.ts`) rather than fetched, so they work
offline and for any date.

## Units

Everything stored is metric. Imperial is a display-time conversion applied in one place
(`src/lib/units.ts`), so switching units never rewrites data — catches logged years ago
convert the moment the toggle moves. Set it under `/settings`.

## Species covered

Atlantic Mackerel, Striped Bass, Atlantic Salmon, Brook Trout, Rainbow Trout, Brown
Trout, Landlocked Salmon, Smallmouth Bass, Largemouth Bass, Chain Pickerel, Muskellunge,
Yellow Perch, White Perch, American Shad, Gaspereau, Rainbow Smelt, American Eel,
Atlantic Cod, Pollock, Atlantic Herring, Winter Flounder, Acadian Redfish, Spiny
Dogfish, Cunner, Atlantic Tomcod, Sculpin, Atlantic Bluefin Tuna.

Trip guides: Shediac & Cocagne (NB), Launching / Boughton Bay (PEI).
