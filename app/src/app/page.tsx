import Link from "next/link";

export const metadata = {
  title: "Maritime Angler",
  description: "Your all-around fishing app: species guide, tackle box, and catch log for NB, NS & PEI.",
};

const SECTIONS = [
  {
    href: "/guide",
    emoji: "📖",
    title: "Fishing Guide",
    description:
      "27 species guides, trip guides by location, a regulations overview, and Fish Near Me — everything you need to know before you go.",
    border: "hover:border-guide",
    bg: "bg-guide-light",
    heading: "text-xl font-bold text-foreground mb-2 group-hover:text-guide",
  },
  {
    href: "/tackle",
    emoji: "🧰",
    title: "Tackle Box",
    description:
      "Your personal tackle inventory — rods, reels, lures, and terminal tackle, organized by storage location and tagged to the species they're good for.",
    border: "hover:border-tackle",
    bg: "bg-tackle-light",
    heading: "text-xl font-bold text-foreground mb-2 group-hover:text-tackle",
  },
  {
    href: "/catches",
    emoji: "🐟",
    title: "Catch Log",
    description:
      "Log what you caught, where, and what you used to catch it — build your own record of what actually works.",
    border: "hover:border-catches",
    bg: "bg-catches-light",
    heading: "text-xl font-bold text-foreground mb-2 group-hover:text-catches",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">Maritime Angler</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Everything for fishing NB, NS &amp; PEI in one place: the reference guide, your tackle
          box, and your catch log.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md ${s.border}`}
          >
            <div className={`inline-flex text-3xl mb-3 rounded-xl p-3 ${s.bg}`} aria-hidden>
              {s.emoji}
            </div>
            <h2 className={s.heading}>{s.title}</h2>
            <p className="text-sm text-muted leading-relaxed">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
