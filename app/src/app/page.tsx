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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group card-lift flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition hover:shadow-md sm:block sm:p-6 ${s.border}`}
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
