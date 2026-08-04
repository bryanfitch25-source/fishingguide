import { AccentCard } from "./AccentCard";
import { activePeriod, PERIOD_LABEL, type SolunarDay } from "@/lib/solunar";

// Today's major and minor feeding windows.
//
// Major periods run about two hours around the moon being overhead or underfoot; minor
// periods about an hour around moonrise and moonset. Because moonrise and moonset shift
// roughly 50 minutes later each day, on about one day in 25 one of them falls outside
// the calendar day entirely — so a missing minor period is expected behaviour and the
// card says which one is missing rather than rendering a gap.
//
// Like the moon phase and Good Fishing Day read-outs, this is angling folklore, not a
// validated model, and it's labelled as such.
export function SolunarCard({
  solunar,
  timeZone = "America/Moncton",
  nowMs,
}: {
  solunar: SolunarDay;
  timeZone?: string;
  nowMs: number;
}) {
  const active = activePeriod(solunar.periods, nowMs);
  const majors = solunar.periods.filter((p) => p.kind === "major");
  const minors = solunar.periods.filter((p) => p.kind === "minor");

  const range = (start: Date, end: Date) => {
    const f = (d: Date) =>
      d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone });
    return `${f(start)} – ${f(end)}`;
  };

  if (solunar.periods.length === 0) {
    return (
      <AccentCard tone="neutral" title="🌙 Solunar periods">
        <p className="text-sm text-muted">
          No moonrise, moonset or transit falls within today at this location, so there
          are no feeding windows to show. This happens for a day at a time as the lunar
          day drifts against the calendar day.
        </p>
      </AccentCard>
    );
  }

  return (
    <AccentCard tone={active ? "today" : "neutral"} title="🌙 Solunar periods">
      {active && (
        <p className="mb-3 rounded-lg bg-accent-light px-3 py-2 text-sm font-semibold text-accent-dark">
          {active.kind === "major" ? "Major" : "Minor"} period active now ·{" "}
          {PERIOD_LABEL[active.cause]}
        </p>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Major</p>
          {majors.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {majors.map((p) => (
                <li key={p.start.toISOString()} className="flex justify-between gap-3">
                  <span className="text-muted">{PERIOD_LABEL[p.cause]}</span>
                  <span className="font-semibold text-brand-dark">{range(p.start, p.end)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted">No major period falls within today.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Minor</p>
          {minors.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {minors.map((p) => (
                <li key={p.start.toISOString()} className="flex justify-between gap-3">
                  <span className="text-muted">{PERIOD_LABEL[p.cause]}</span>
                  <span className="font-semibold text-brand-dark">{range(p.start, p.end)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted">
              No minor period today — moonrise and moonset both fall outside the calendar day.
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted">
        Traditional solunar theory, computed from the moon&apos;s position — an informal
        guide, not a validated predictor of fish behaviour.
      </p>
    </AccentCard>
  );
}
