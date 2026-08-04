import { sampleCurve, type TideEvent } from "@/lib/tides";
import { formatHeight, metresToFeet, type UnitSystem } from "@/lib/units";

// A 24-hour tide curve, hand-drawn as SVG.
//
// No charting library: this is one path, one filled area and a handful of ticks, and
// the app is already carrying Leaflet — a second visualisation dependency for this
// would cost more in bundle size than the ~80 lines it replaces. It's also a server
// component this way, so the curve arrives in the HTML rather than after hydration.
//
// The shape comes from lib/tides.ts's cosine interpolation between predicted extrema,
// which is what gives it the real easing of a semi-diurnal tide rather than a zigzag
// between highs and lows.

const WIDTH = 720;
const HEIGHT = 200;
const PAD_LEFT = 38;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

export function TideCurve({
  events,
  units,
  timeZone = "America/Moncton",
  nowMs = Date.now(),
}: {
  events: TideEvent[];
  units: UnitSystem;
  timeZone?: string;
  nowMs?: number;
}) {
  const points = sampleCurve(events, nowMs, 24, 15);
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted">
        Not enough tide predictions in the next 24 hours to draw a curve.
      </p>
    );
  }

  const toDisplay = (m: number) => (units === "imperial" ? metresToFeet(m) : m);

  const heights = points.map((p) => toDisplay(p.heightM));
  const rawMin = Math.min(...heights);
  const rawMax = Math.max(...heights);
  // A flat 10% margin on a near-flat curve collapses to nothing, so enforce a floor.
  const span = Math.max(rawMax - rawMin, units === "imperial" ? 1 : 0.3);
  const min = rawMin - span * 0.12;
  const max = rawMax + span * 0.12;

  const startMs = points[0].ms;
  const endMs = points[points.length - 1].ms;
  const xFor = (ms: number) => PAD_LEFT + ((ms - startMs) / (endMs - startMs)) * PLOT_W;
  const yFor = (displayHeight: number) =>
    PAD_TOP + PLOT_H - ((displayHeight - min) / (max - min)) * PLOT_H;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.ms).toFixed(1)},${yFor(toDisplay(p.heightM)).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(endMs).toFixed(1)},${PAD_TOP + PLOT_H} L${xFor(startMs).toFixed(1)},${PAD_TOP + PLOT_H} Z`;

  // Gridlines every 6 hours, aligned to the clock rather than to "now" so the labels
  // read as real times of day.
  const gridlines: { ms: number; label: string }[] = [];
  const firstTick = new Date(startMs);
  firstTick.setMinutes(0, 0, 0);
  firstTick.setHours(firstTick.getHours() + ((6 - (firstTick.getHours() % 6)) % 6));
  for (let ms = firstTick.getTime(); ms <= endMs; ms += 6 * 3600000) {
    gridlines.push({
      ms,
      label: new Date(ms).toLocaleTimeString("en-CA", { hour: "numeric", timeZone }),
    });
  }

  const nowPoint = points[0];
  const nowX = xFor(nowPoint.ms);
  const nowY = yFor(toDisplay(nowPoint.heightM));

  // Label the extremes on the y-axis only — a full scale would crowd a graph this size.
  const axisLabels = [rawMax, rawMin];

  return (
    <figure className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[320px]"
        role="img"
        aria-label={`Tide curve for the next 24 hours, from ${formatHeight(
          Math.min(...points.map((p) => p.heightM)),
          units
        )} to ${formatHeight(Math.max(...points.map((p) => p.heightM)), units)}`}
      >
        <defs>
          <linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridlines.map((g) => (
          <g key={g.ms}>
            <line
              x1={xFor(g.ms)}
              y1={PAD_TOP}
              x2={xFor(g.ms)}
              y2={PAD_TOP + PLOT_H}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={xFor(g.ms)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-[var(--color-muted)]"
              fontSize="11"
            >
              {g.label}
            </text>
          </g>
        ))}

        {axisLabels.map((h) => (
          <text
            key={h}
            x={PAD_LEFT - 6}
            y={yFor(h) + 3}
            textAnchor="end"
            className="fill-[var(--color-muted)]"
            fontSize="10"
          >
            {h.toFixed(units === "imperial" ? 1 : 2)}
          </text>
        ))}

        <path d={areaPath} fill="url(#tide-fill)" />
        <path d={linePath} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* "Now" marker — amber, matching the accent used for key figures elsewhere. */}
        <line
          x1={nowX}
          y1={PAD_TOP}
          x2={nowX}
          y2={PAD_TOP + PLOT_H}
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={nowX} cy={nowY} r="5" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="2" />
      </svg>
      <figcaption className="mt-1 text-[11px] text-muted">
        Next 24 hours · predicted heights interpolated between high and low water ·
        {units === "imperial" ? " feet" : " metres"} above chart datum
      </figcaption>
    </figure>
  );
}
