"use client";

import { useEffect, useState } from "react";
import {
  COLD_WATER_CAVEAT,
  COLD_WATER_STAGES,
  DISTRESS_SCRIPT_FIELDS,
  ICE_NOTES,
  ICE_THICKNESS,
  JRCC_HALIFAX,
  MAYDAY_VS_PANPAN,
  VESSEL_CLASSES,
} from "@/lib/safety";
import type { Assessment, Severity } from "@/lib/safety-assessment";
import { FloatPlan } from "./FloatPlan";

type TabId = "now" | "gear" | "cold" | "plan" | "distress" | "ice";

const TABS: { id: TabId; label: string }[] = [
  { id: "now", label: "Right now" },
  { id: "gear", label: "Required gear" },
  { id: "cold", label: "Cold water" },
  { id: "plan", label: "Float plan" },
  { id: "distress", label: "Calling for help" },
  { id: "ice", label: "Ice" },
];

const SEVERITY_STYLE: Record<Severity, string> = {
  danger: "border-danger bg-danger-light text-danger",
  caution: "border-amber-400 bg-accent-light text-accent-dark",
  info: "border-border bg-surface text-foreground",
};

const CHECKED_KEY = "ma_safety_checked";
const VESSEL_KEY = "ma_safety_vessel";

function AssessmentCard({ a }: { a: Assessment }) {
  return (
    <div className={`rounded-xl border p-4 ${SEVERITY_STYLE[a.severity]}`}>
      <p className="font-bold">{a.headline}</p>
      <p className="mt-1 text-sm opacity-90">{a.detail}</p>
    </div>
  );
}

/** Past this, the conditions on the page are a record of an earlier moment. */
const STALE_AFTER_MS = 30 * 60 * 1000;

export function SafetyClient({
  assessments,
  stationName,
  hasLiveData,
  generatedAt,
}: {
  assessments: Assessment[];
  stationName: string;
  hasLiveData: boolean;
  /** ISO time the server rendered these conditions. */
  generatedAt: string;
}) {
  const [tab, setTab] = useState<TabId>("now");
  // This page is deliberately cached for offline use — the equipment lists, cold-water
  // stages and distress script are exactly what you want with no signal, and the app
  // otherwise refuses to cache anything conditions-based for good reason. The compromise
  // is that the conditions tab has to say out loud when it is showing an old moment.
  // A stale "9°C, tide falling" is indistinguishable from a live one, and this is the one
  // screen where believing it could get someone hurt.
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const check = () => {
      const age = Date.now() - new Date(generatedAt).getTime();
      setStale(age > STALE_AFTER_MS || (typeof navigator !== "undefined" && !navigator.onLine));
    };
    check();
    const id = setInterval(check, 60000);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, [generatedAt]);

  const [vessel, setVessel] = useState(VESSEL_CLASSES[1].id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [restored, setRestored] = useState(false);

  if (!restored) {
    setRestored(true);
    if (typeof localStorage !== "undefined") {
      const v = localStorage.getItem(VESSEL_KEY);
      if (v && VESSEL_CLASSES.some((c) => c.id === v)) setVessel(v);
      try {
        const raw = localStorage.getItem(CHECKED_KEY);
        if (raw) setChecked(JSON.parse(raw));
      } catch {
        /* Corrupt tick-list; start it fresh. */
      }
    }
  }

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(VESSEL_KEY, vessel);
  }, [vessel]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(CHECKED_KEY, JSON.stringify(checked));
    } catch {
      /* Private mode — the list still works, it just won't be remembered. */
    }
  }, [checked]);

  const spec = VESSEL_CLASSES.find((c) => c.id === vessel) ?? VESSEL_CLASSES[1];
  const allItems = spec.categories.flatMap((c) => c.items.map((i) => `${spec.id}:${i.label}`));
  const doneCount = allItems.filter((k) => checked[k]).length;

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Safety" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-muted hover:border-brand"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {tab === "now" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-bold text-brand-dark">Conditions at {stationName}</h2>
            <p className="mt-1 text-sm text-muted">
              {hasLiveData
                ? "Read against what today actually is, rather than as general advice."
                : "Live conditions couldn't be reached just now, so this is showing what it can. Nothing below is a substitute for looking at the water."}
            </p>
          </div>
          {stale && (
            <div className="rounded-xl border border-amber-400 bg-accent-light p-4 text-accent-dark">
              <p className="font-bold">These conditions are out of date</p>
              <p className="mt-1 text-sm">
                Read {new Date(generatedAt).toLocaleString("en-CA", {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {typeof navigator !== "undefined" && !navigator.onLine && ", and you're offline"}. The
                water has moved since. Everything in the other tabs is still good — those don&apos;t
                change.
              </p>
            </div>
          )}
          {assessments.length === 0 ? (
            <p className="text-sm text-muted">
              No live water temperature, tide or sea state available for this station right now.
            </p>
          ) : (
            <div className={stale ? "opacity-60" : undefined}>
              <div className="space-y-3">
                {assessments.map((a) => (
                  <AssessmentCard key={a.id} a={a} />
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-brand-dark">If it goes wrong</p>
            <p className="mt-1 text-sm">
              <a href={`tel:${JRCC_HALIFAX.toll.replace(/-/g, "")}`} className="text-accent-dark underline">
                {JRCC_HALIFAX.toll}
              </a>{" "}
              — {JRCC_HALIFAX.name}. Covers {JRCC_HALIFAX.covers}. On the water, VHF channel 16 first.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {tab === "gear" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <label className="mb-1 block text-sm font-medium">What are you fishing from?</label>
            <select
              value={vessel}
              onChange={(e) => setVessel(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {VESSEL_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">{spec.blurb}</p>
            <p className="mt-2 text-xs text-muted">
              Transport Canada minimums, from the Safe Boating Guide (TP 511E). You can be fined up
              to $200 per missing item — but the reason to carry them is the other one.
              {allItems.length > 0 && (
                <>
                  {" "}
                  <strong className="text-brand-dark">
                    {doneCount} of {allItems.length} ticked.
                  </strong>
                </>
              )}
            </p>
          </div>

          {spec.categories.map((cat) => (
            <div key={cat.heading} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-2 text-sm font-bold text-brand-dark">{cat.heading}</h3>
              <ul className="space-y-2.5">
                {cat.items.map((item) => {
                  const key = `${spec.id}:${item.label}`;
                  return (
                    <li key={key} className="flex gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={!!checked[key]}
                        onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-label={item.label}
                      />
                      <span className={checked[key] ? "opacity-55" : undefined}>
                        <span className="font-medium">{item.label}</span>
                        {item.detail && <span className="block text-muted">{item.detail}</span>}
                        {item.exemption && (
                          <span className="mt-0.5 block text-xs text-muted">
                            <span className="font-semibold">Exempt:</span> {item.exemption}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <button
            onClick={() => setChecked({})}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:border-brand"
          >
            Clear the ticks
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {tab === "cold" && (
        <div className="space-y-3">
          {COLD_WATER_STAGES.map((s) => (
            <div key={s.window} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">{s.window}</p>
              <h3 className="font-bold text-brand-dark">{s.title}</h3>
              <p className="mt-1 text-sm">{s.what}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {s.doThis.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden className="text-accent">
                      ▸
                    </span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-semibold text-brand-dark">Where this number comes from</p>
            <p className="mt-1 text-sm text-muted">{COLD_WATER_CAVEAT}</p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {tab === "plan" && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <FloatPlan />
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {tab === "distress" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-danger bg-danger-light p-4 text-danger">
            <p className="font-bold">VHF channel 16, or call {JRCC_HALIFAX.toll}</p>
            <p className="mt-1 text-sm">
              From a cell phone on the water you can also dial <strong>*16</strong> to reach the Coast
              Guard — but coverage is patchy and it is not a substitute for a radio.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MAYDAY_VS_PANPAN.map((m) => (
              <div key={m.term} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-brand-dark">{m.term}</p>
                <p className="text-sm font-medium">{m.when}</p>
                <p className="mt-1 text-sm text-muted">{m.examples}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-bold text-brand-dark">Say it in this order</h3>
            <p className="mb-2 rounded-lg bg-background p-3 font-mono text-sm">
              &quot;Mayday, Mayday, Mayday. This is <em>[boat name ×3]</em>, <em>[call sign]</em>. Mayday{" "}
              <em>[boat name]</em>.&quot;
            </p>
            <ol className="ml-4 list-decimal space-y-1 text-sm">
              {DISTRESS_SCRIPT_FIELDS.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ol>
            <p className="mt-2 text-sm text-muted">
              Then wait for an answer. If none comes, say it again. Transport Canada suggests keeping
              a laminated copy by the radio — under stress, nobody remembers the order.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-1 font-bold text-brand-dark">If you set one off by accident</h3>
            <p className="text-sm">
              Do not switch the radio off. Say so on channel 16 — your boat name, and that the
              previous distress call was made in error and is cancelled. It costs nothing. A search
              launched for a boat that is tied up costs a great deal.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {tab === "ice" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-bold text-brand-dark">Clear blue ice, fresh water</h3>
            <ul className="space-y-2">
              {ICE_THICKNESS.map((i) => (
                <li key={i.minCm} className="flex items-baseline gap-3 text-sm">
                  <span className="w-16 shrink-0 font-bold tabular-nums text-accent-dark">
                    {i.minCm} cm
                  </span>
                  <span>{i.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">Canadian Red Cross figures.</p>
          </div>
          <div className="rounded-xl border border-danger bg-danger-light p-4 text-danger">
            <p className="font-bold">The numbers above are the easy part</p>
            <ul className="mt-2 space-y-2 text-sm">
              {ICE_NOTES.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden>▸</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
