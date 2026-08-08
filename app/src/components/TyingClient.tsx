"use client";

import { useState } from "react";
import Link from "next/link";
import { LessonList } from "@/components/LessonList";
import {
  COMMON_FAULTS,
  PROPORTIONS,
  THREAD_GUIDE,
  TYING_CREDIT_NOTE,
  TYING_LESSONS,
  TYING_SALMON_NOTE,
  TYING_STAGES,
} from "@/lib/tying";

type View = "course" | "reference";

export function TyingClient() {
  const [view, setView] = useState<View>("course");

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Fly tying" className="flex flex-wrap gap-2">
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
                ? "bg-guide text-on-brand"
                : "border border-border bg-surface text-muted hover:border-guide"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "course" ? (
        <LessonList
          stages={TYING_STAGES}
          lessons={TYING_LESSONS}
          warning={{ title: "Barbless, from the vice", body: TYING_SALMON_NOTE }}
          creditNote={TYING_CREDIT_NOTE}
          accent="guide"
        />
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">Thread</p>
            <ul className="space-y-1.5 text-sm">
              {THREAD_GUIDE.map((t) => (
                <li key={t.denier}>
                  <span className="font-semibold tabular-nums text-guide">{t.denier}</span> — {t.use}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-guide-light text-guide">
                <tr>
                  <th className="px-3 py-2 text-left">Part</th>
                  <th className="px-3 py-2 text-left">Proportion</th>
                </tr>
              </thead>
              <tbody>
                {PROPORTIONS.map((p) => (
                  <tr key={p.part} className="border-t border-border">
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">{p.part}</td>
                    <td className="px-3 py-2">{p.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">What actually goes wrong</p>
            <ul className="space-y-1.5 text-sm">
              {COMMON_FAULTS.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden className="text-guide">
                    ▸
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-muted">
            Patterns, line weights, the tippet chart and the salmon rules live in the{" "}
            <Link href="/fly" className="text-accent-dark underline">
              Fly Box
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
