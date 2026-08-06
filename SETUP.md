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

## App structure

- **Fishing Guide** (`/guide`) — species, trip guides, regulations, Fish Near Me. Public, no sign-in needed.
- **Tides** (`/tides`) — current tide and 24-hour curve for your selected station, marine conditions, solunar feeding periods, and a 7-day high/low forecast. Public; signing in lets you choose a station instead of the default.
- **My Spots** (`/spots`) — every station you've favourited, with its current tide, side by side. Sign-in required.
- **Tackle Box** (`/tackle`) — your personal tackle inventory. Sign-in required; only you can see or edit it.
- **Catch Log** (`/catches`) — what you caught, where, with what, and the conditions at the time. Sign-in required.
- **Settings** (`/settings`) — tide station, units, angler profile, reminders. Sign-in required.

### Notifications on iPhone

Push only works on iOS once the app has been **added to the Home Screen** — Safari does
not deliver notifications to an ordinary browser tab. Open the site in Safari, tap
Share → Add to Home Screen, then enable notifications from `/settings`.

The daily cron (`0 12 * * *`, 9am Atlantic) sends licence-expiry reminders, gear
maintenance reminders, and — if enabled — a tide digest listing today's highs and lows.
Per-tide "high tide in 30 minutes" alerts would need the cron running hourly, which
Vercel's Hobby plan doesn't allow; the digest is the once-a-day equivalent.

Tag a tackle item with the species it's good for and it shows up as "Gear You Own" on that
species' guide page — the one thing a generic tackle app can't do, since it doesn't have
your species guide's gear recommendations to link against.

## One-time setup: your account

The tackle box and catch log need you to be signed in (so a random visitor to the public
site can't edit your gear or catches). Before creating your account:

1. Supabase dashboard → your `fishingguide` project → **Authentication → Sign In / Providers → Email**.
2. Turn **off** "Confirm email". For a personal app with one user, email confirmation is
   just friction — and Supabase's free tier only sends a couple of confirmation emails per
   hour, so leaving it on means you can hit that limit before you ever get signed in.
3. Go to `/login` on the live site, click "Sign up", enter your email and a password. You're
   in immediately — no confirmation email, no waiting.

## 1. Database — already applied ✅

Your Supabase project: `https://zrerxskliybzcqexudfo.supabase.co` (project `fishingguide`)

The schema and all content have **already been pushed** via `supabase db push` as a series
of migrations in `app/supabase/migrations/` (run in filename/timestamp order):

- `20260728000001_init_schema.sql` — species/regulations/location-guide tables, RLS (public read-only)
- `20260728000002_seed_content.sql`, `20260728000003_grants.sql` — initial content + API grants
- `20260728120000_images_and_variants.sql`, `20260729180000_real_photos_only.sql` — species photos + "Forms & Lookalikes" variants
- `20260730100000_tackle_and_catches.sql` — `tackle_items`, `tackle_item_species`, `catches` tables, RLS scoped to `auth.uid()` (private, per-account)
- `20260804120000_slack_water_tides_units_profile.sql` — applied ✅: tide station + units + profile columns on `angler_settings`, the `favourite_stations` table (capped at 8 by a trigger), and the conditions-snapshot columns on `catches`. Also backfills numeric `length_cm` / `weight_kg` by parsing the existing free-text values, leaving the originals in place for anything it can't read.
- `20260806120000_appearance_preferences.sql` — **needs applying**: `theme` and `font_pairing` on `angler_settings`, backing the colour and type pickers in Settings. Purely display preferences — the app falls back to the default ground if the columns are missing.

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

## Deploying a change that includes a migration

**Apply the migration before merging, not after.** Vercel auto-deploys on every push to
`main`, so merging first means the new code is live against a database that doesn't have
its columns yet — signed-in pages break until the migration lands.

```bash
cd app
supabase db push          # applies any migration not yet recorded as applied
```

Then merge. The order matters because the migrations here are additive: new columns and
tables the old code simply ignores. Applying the migration early is harmless — the
running site carries on working — while applying it late is a live outage.

Migrations are written to be safely re-runnable (`add column if not exists`, guarded
constraint creation, and backfills scoped to `where <col> is null` so they never
overwrite a value corrected by hand).

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
