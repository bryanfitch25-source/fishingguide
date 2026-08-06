import type { ReactNode } from "react";

// Slack Water's card pattern, restyled for this app's light palette: a bordered,
// rounded box with a coloured bar down the left edge whose colour carries meaning.
//
// The tone mapping keeps to colours already in globals.css rather than introducing
// Slack Water's indigo/mint/coral set, so tide screens sit next to the guide and
// tackle sections without looking like a different product:
//   rising  -> ocean teal (--brand), the same "positive/neutral" colour used app-wide
//   falling -> rose (--catches), already the catch-log accent
//   today   -> amber (--accent), the existing highlight colour
export type AccentTone = "rising" | "falling" | "today" | "neutral";

const TONE_BAR: Record<AccentTone, string> = {
  rising: "bg-brand",
  falling: "bg-catches",
  today: "bg-accent",
  neutral: "bg-border",
};

const TONE_RING: Record<AccentTone, string> = {
  rising: "border-border",
  falling: "border-border",
  today: "border-accent/40",
  neutral: "border-border",
};

export function AccentCard({
  tone = "neutral",
  title,
  action,
  children,
  className = "",
}: {
  tone?: AccentTone;
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-surface card-lift ${TONE_RING[tone]} ${className}`}
    >
      <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${TONE_BAR[tone]}`} />
      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        {(title || action) && (
          <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2 sm:gap-3">
            {title && <h3 className="font-bold text-brand-dark min-w-0">{title}</h3>}
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * The rising/falling pill. Rising reads as the app's primary teal and falling as its
 * rose, so direction is legible from colour alone before the text is read.
 */
export function TideStatePill({ state }: { state: "rising" | "falling" | "unknown" }) {
  if (state === "unknown") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-muted">
        — DIRECTION UNKNOWN
      </span>
    );
  }
  const rising = state === "rising";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        rising ? "bg-brand-light text-brand-dark" : "bg-catches-light text-catches"
      }`}
    >
      {rising ? "↑ RISING" : "↓ FALLING"}
    </span>
  );
}
