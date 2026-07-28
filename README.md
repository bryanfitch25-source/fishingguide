# Maritime Angler

A web app of recreational fishing guides for **New Brunswick, Nova Scotia, and Prince
Edward Island** — 27 species guides plus location-based trip guides, each covering
identification, seasons, where to go, gear, technique, handling, and per-province
regulations with links to official DFO / provincial sources.

Built with Next.js (App Router) + Supabase (Postgres).

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

## Species covered

Atlantic Mackerel, Striped Bass, Atlantic Salmon, Brook Trout, Rainbow Trout, Brown
Trout, Landlocked Salmon, Smallmouth Bass, Largemouth Bass, Chain Pickerel, Muskellunge,
Yellow Perch, White Perch, American Shad, Gaspereau, Rainbow Smelt, American Eel,
Atlantic Cod, Pollock, Atlantic Herring, Winter Flounder, Acadian Redfish, Spiny
Dogfish, Cunner, Atlantic Tomcod, Sculpin, Atlantic Bluefin Tuna.

Trip guides: Shediac & Cocagne (NB), Launching / Boughton Bay (PEI).
