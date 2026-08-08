"use client";

import { useState } from "react";
import { LessonList } from "@/components/LessonList";
import {
  BLADE_GUIDE,
  CRAFT_CREDIT_NOTE,
  CRAFT_LESSONS,
  CRAFT_STAGES,
  JIG_WEIGHTS,
  LEAD_WARNING,
  LURE_MAKING_ECONOMICS,
} from "@/lib/lure-making";

type View = "course" | "reference";

export function LureMakingClient() {
  const [view, setView] = useState<View>("course");

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Lure making" className="flex flex-wrap gap-2">
        {(
          [
            ["course", "The course"],
            ["reference", "Reference"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              view === id
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-muted hover:border-brand"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "course" ? (
        <LessonList
          stages={CRAFT_STAGES}
          lessons={CRAFT_LESSONS}
          warning={{ title: "Read the safety lesson first", body: LEAD_WARNING }}
          creditNote={CRAFT_CREDIT_NOTE}
          accent="brand"
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-brand-light text-brand">
                <tr>
                  <th className="px-3 py-2 text-left">Blade</th>
                  <th className="px-3 py-2 text-left">How it turns</th>
                  <th className="px-3 py-2 text-left">When</th>
                </tr>
              </thead>
              <tbody>
                {BLADE_GUIDE.map((b) => (
                  <tr key={b.shape} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">{b.shape}</td>
                    <td className="px-3 py-2 text-muted">{b.spin}</td>
                    <td className="px-3 py-2">{b.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">Jig weights, and what they&apos;re for here</p>
            <ul className="space-y-1.5 text-sm">
              {JIG_WEIGHTS.map((j) => (
                <li key={j.weight}>
                  <span className="font-semibold tabular-nums text-brand">{j.weight}</span> — {j.use}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">Is it actually cheaper?</p>
            <ul className="space-y-1.5 text-sm">
              {LURE_MAKING_ECONOMICS.map((e) => (
                <li key={e} className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    ▸
                  </span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
