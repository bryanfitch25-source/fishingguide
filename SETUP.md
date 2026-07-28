# Maritime Angler — Setup

A Next.js + Supabase web app of recreational fishing guides for New Brunswick, Nova
Scotia, and Prince Edward Island: 27 species guides and 2 location/trip guides, all
sourced from DFO, provincial angling regulations, and angler forums.

## Project layout

```
FishingGuide/
  app/            the Next.js application (deploy this folder)
  research/       source-of-truth content as JSON (one file per species / location guide)
  SETUP.md        this file
```

`research/*.json` is the editorial content. `app/scripts/generate-seed-sql.mjs` converts
it into `app/supabase/seed.sql`. To add or edit a species, edit the JSON (see
`research/_SCHEMA_AND_EXAMPLE.md` for the exact shape) and regenerate the seed SQL.

## 1. Database — already applied ✅

Your Supabase project: `https://zrerxskliybzcqexudfo.supabase.co` (project `fishingguide`)

The schema and all content have **already been pushed** via `supabase db push` as three
migrations:

1. `20260728000001_init_schema.sql` — tables, indexes, RLS policies (public read-only)
2. `20260728000002_seed_content.sql` — all 27 species guides + 2 location guides
3. `20260728000003_grants.sql` — SELECT grants for the anon/authenticated API roles

To update content later: edit the JSON in `research/`, run
`node scripts/generate-seed-sql.mjs` in `app/`, copy the regenerated
`app/supabase/seed.sql` into a new timestamped file in `app/supabase/migrations/`, and
run `supabase db push` again (it's idempotent per species — it upserts and replaces
child rows).

## 2. Configure environment variables

`app/.env.local` already has your project URL and anon (publishable) key filled in:

```
NEXT_PUBLIC_SUPABASE_URL=https://zrerxskliybzcqexudfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_V1FmA6hvC5AwCA1j-DaQgw_nZilj5t8
```

This file is gitignored — never commit it. When you deploy (Vercel, etc.), add the same
two variables in that platform's environment variable settings.

## 3. Run it locally

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. You should see all species and trip guides once the SQL from
step 1 has been run.

## 4. Editing or adding species

1. Add/edit a JSON file in `research/` following `research/_SCHEMA_AND_EXAMPLE.md`.
2. Run `node scripts/validate.mjs`-equivalent check (or just `node ../research/_validate.mjs`
   from `research/`) to confirm it's well-formed.
3. Regenerate SQL: `cd app && node scripts/generate-seed-sql.mjs`.
4. Paste the updated `app/supabase/seed.sql` into the Supabase SQL editor and run it (or
   use `psql -f` if you have direct DB access).

## 5. Deploying — already live ✅

The site is deployed on Vercel (account `bryanfitch25-9324`, scope `fitch2`):

- **Live site: https://fishingguide-ebon.vercel.app**
- Project dashboard: https://vercel.com/fitch2/fishingguide
- Root directory is set to `app`, both Supabase env vars are configured for
  Production and Preview, and the GitHub repo is connected — **every push to `main`
  auto-deploys**.

To use a custom domain later: buy the domain, then Vercel dashboard → fishingguide →
Settings → Domains → add it and follow the DNS instructions.

## Known regulatory items that need a human double-check before you rely on this for legal compliance

The research agents flagged a few items where official sources were ambiguous, hard to
fetch directly, or conflicting. These are called out inline in the relevant
`research/<slug>.json` files too, but the big ones:

- **Muskellunge**: New Brunswick's April 2026 invasive-species rule requires
  mandatory retention (no release) for muskellunge in the "Southwest RFA" — but the
  Saint John River has a ~20-year established catch-and-release muskie culture
  (Muskies Canada chapter). Whether an exception exists for that fishery is unresolved.
  **Call NB Natural Resources before publishing guidance either way** — this is the kind
  of mistake that gets someone fined.
- **Chain pickerel, largemouth bass, smallmouth bass**: same April 2026 NB
  mandatory-retention invasive-species rule applies in specific Recreational Fishery
  Areas (Restigouche, Chaleur, Miramichi, Southeast, +Inner Bay of Fundy /
  Upper Saint John depending on species). Confirm current RFA boundaries against the
  live GNB Fish Regulations Summary PDF.
- **Acadian redfish / spiny dogfish**: no DFO notice clearly states whether these count
  toward the general recreational groundfish bag limit in the Gulf Region (NB/PEI) —
  flagged as unresolved rather than guessed.
- Several NB and NS regulation PDFs were too large to fetch directly during research and
  were retrieved via a text-extraction proxy or secondary aggregator sites — treat exact
  bag/size limits as "verify against the current official PDF" rather than final, especially
  for rainbow trout, brown trout, yellow/white perch, and American shad.

None of this blocks using the app — it's a note for whoever reviews content before telling
real anglers what they're legally allowed to keep.
