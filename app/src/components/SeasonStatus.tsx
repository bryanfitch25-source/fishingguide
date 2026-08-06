import { parseSeason, isOpen, daysUntilOpen } from "@/lib/season";

// Open/closed, where the written season is unambiguous enough to say so.
//
// Only about one regulation in seven has a season written as a single clean date range;
// the rest describe several seasons, or vary by water body, and the parser deliberately
// refuses those. So this badge is absent far more often than it is present — which is
// the intended behaviour. A status that appears only when it is certain is trustworthy;
// one that guesses at the rest would be worse than none, because a reader cannot tell
// which kind they are looking at.
//
// Lives in its own file because it belongs on two pages: the per-species regulation
// panel, and the province-wide overview — which is the page you actually scan to ask
// "what can I fish today?", and so is the one that most wanted the answer on it.
export function SeasonStatus({ season }: { season: string | null | undefined }) {
  const parsed = parseSeason(season);
  if (!parsed) return null;
  const open = isOpen(parsed);
  const days = daysUntilOpen(parsed);
  return (
    <span
      className={`ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${
        open ? "bg-success-light text-success" : "bg-accent-light text-accent-dark"
      }`}
      title="Derived from the season text beside it — always confirm against the official source."
    >
      {open ? "OPEN NOW" : days !== null && days <= 60 ? `OPENS IN ${days}D` : "CLOSED"}
    </span>
  );
}
