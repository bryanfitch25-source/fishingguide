import Link from "next/link";
import { RecentActivity } from "@/components/RecentActivity";

export const metadata = {
  title: "Maritime Angler",
  description: "Your all-around fishing app: species guide, tackle box, and catch log for NB, NS & PEI.",
};

// RecentActivity reads the auth session cookie, so this route can't be fully static —
// same trade-off already accepted on the species detail pages.
export const dynamic = "force-dynamic";

// Tides leads: it's the only card whose content changes hour to hour, so it's the one
// worth opening the app for. The other three are reference and record-keeping that keep
// just as well further down the page.
const SECTIONS = [
  {
    href: "/tides",
    short: "Live predictions, curve, marine and solunar.",
    emoji: "🌊",
    title: "Tides",
    description:
      "Live tide predictions for any Canadian station, a 24-hour tide curve, marine conditions and solunar feeding periods — plus every spot you fish, compared side by side.",
    border: "hover:border-brand",
    bg: "bg-brand-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-brand",
  },
  {
    href: "/guide",
    short: "27 species, trip guides, regs and Fish Near Me.",
    emoji: "📖",
    title: "Fishing Guide",
    description:
      "27 species guides, trip guides by location, a regulations overview, and Fish Near Me — everything you need to know before you go.",
    border: "hover:border-guide",
    bg: "bg-guide-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-guide",
  },
  {
    href: "/tackle",
    short: "Rods, reels and lures by tray and species.",
    emoji: "🧰",
    title: "Tackle Box",
    description:
      "Your personal tackle inventory — rods, reels, lures, and terminal tackle, organized by storage location and tagged to the species they're good for.",
    border: "hover:border-tackle",
    bg: "bg-tackle-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-tackle",
  },
  {
    href: "/catches",
    short: "What you caught, where, and on what.",
    emoji: "🐟",
    title: "Catch Log",
    description:
      "Log what you caught, where, and what you used to catch it — build your own record of what actually works.",
    border: "hover:border-catches",
    bg: "bg-catches-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-catches",
  },
  {
    href: "/fly",
    short: "Fly gear, patterns, tippet and the salmon rules.",
    emoji: "🪶",
    title: "Fly Box",
    description:
      "Rods, reels, lines, leaders and flies kept separate from conventional tackle — with Maritime patterns, line weights, the tippet chart and what the law requires on salmon water.",
    border: "hover:border-guide",
    bg: "bg-guide-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-guide",
  },
  {
    href: "/depth",
    short: "Seabed depth, tap for a reading, save offline.",
    emoji: "📉",
    title: "Depth Charts",
    description:
      "Seabed depth from the Canadian Hydrographic Service — tap any spot for a reading, and save an area so it still opens with no signal.",
    border: "hover:border-brand",
    bg: "bg-brand-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-brand",
  },
  {
    href: "/matcher",
    short: "Which lure or fly, for which fish and water.",
    emoji: "🎯",
    title: "What to Throw",
    description:
      "Which lures and flies work for which fish, in which water and which province — led by the ones already in your Tackle Box and Fly Box, with the gaps flagged.",
    border: "hover:border-guide",
    bg: "bg-guide-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-guide",
  },
  {
    href: "/saltwater",
    short: "Tides, wharves, and what salt does to gear.",
    emoji: "🌊",
    title: "Saltwater",
    description:
      "Fishing the salt as its own craft — reading the tide, picking a spot you've never seen, spinning and fly side by side, wharf etiquette, and the ten minutes afterwards that decide how long your tackle lasts.",
    border: "hover:border-brand",
    bg: "bg-brand-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-brand",
  },
  {
    href: "/tying",
    short: "From first thread wrap to Bombers.",
    emoji: "🪶",
    title: "Fly Tying",
    description:
      "Thirteen lessons in the order the skills actually stack — thread control, four trout flies, deer hair, the Miramichi bugs, saltwater. One checked video each.",
    border: "hover:border-guide",
    bg: "bg-guide-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-guide",
  },
  {
    href: "/lures",
    short: "Pour jigs, build spinners and spoons.",
    emoji: "🔧",
    title: "Making Lures",
    description:
      "Jig heads from the pot to the paint to the bucktail, then spinners, spinnerbaits and spoons with no heat at all. Safety first, and it isn't a formality.",
    border: "hover:border-accent",
    bg: "bg-accent-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-accent",
  },
  {
    href: "/safety",
    short: "Cold water, gear, float plan, distress.",
    emoji: "🦺",
    title: "Safety",
    description:
      "What the water is doing today, what the law says you must carry, a float plan you can send in one tap, and what to say on channel 16.",
    border: "hover:border-danger",
    bg: "bg-danger-light",
    heading: "text-base sm:text-xl font-bold text-foreground mb-0 sm:mb-2 group-hover:text-danger",
  },
];

export default async function Home() {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-12">
      <div className="mb-4 sm:mb-8 scene-panel card-lift rounded-2xl p-4 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-dark">Maritime Angler</h1>
        <p className="mt-1 sm:mt-3 max-w-2xl text-sm sm:text-lg text-muted">
          Tides, species guides, tackle and catches for NB, NS &amp; PEI.
        </p>
      </div>

      <RecentActivity />

      {/* This page is a launcher, not something to read. As a 4-up grid of tall cards it
          became four ~470px blocks on a phone — nearly 1900px of scrolling to reach the
          last one. Below `sm` each entry is a single row instead: icon, name, one line.
          The grid of cards is still the right shape on a wide screen, so it comes back
          at `sm` where there's room for it. */}
      {/* The last card widens to two columns only when that makes the `lg` grid come out
          even, rather than being hardcoded as it was when there were seven sections.
          Adding a section used to silently leave a hole; now the grid corrects itself.

          At three columns, n cards with one double occupy n+1 slots, so the double helps
          exactly when n % 3 === 2. (n % 3 === 0 is already square, and n % 3 === 1 can't
          be squared by a single double at all — it needs another card, not another rule.) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {SECTIONS.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group card-lift flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition hover:shadow-md sm:block sm:p-6 ${s.border} ${
              i === SECTIONS.length - 1 && SECTIONS.length % 3 === 2 ? "lg:col-span-2" : ""
            }`}
          >
            <div
              className={`inline-flex shrink-0 items-center justify-center rounded-xl p-2.5 text-2xl sm:mb-3 sm:p-3 sm:text-3xl ${s.bg}`}
              aria-hidden
            >
              {s.emoji}
            </div>
            <div className="min-w-0">
              <h2 className={s.heading}>{s.title}</h2>
              <p className="text-sm text-muted leading-snug sm:leading-relaxed">
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.description}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
