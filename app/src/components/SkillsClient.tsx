"use client";

import { useState } from "react";
import Link from "next/link";
import { LessonList } from "@/components/LessonList";
import {
  FAULT_TABLE,
  SKILLS_CREDIT_NOTE,
  SKILLS_SCOPE_NOTE,
  SKILL_LESSONS,
  SKILL_STAGES,
  TEMP_BANDS,
} from "@/lib/skills";

type View = "course" | "faults";

export function SkillsClient() {
  const [view, setView] = useState<View>("course");

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Skills" className="flex flex-wrap gap-2">
        {(
          [
            ["course", "The lessons"],
            ["faults", "What's going wrong"],
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
        <>
          <LessonList
            stages={SKILL_STAGES}
            lessons={SKILL_LESSONS}
            creditNote={SKILLS_CREDIT_NOTE}
            accent="brand"
          />
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{SKILLS_SCOPE_NOTE}</p>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {/* Diagnosis first, because that's how the question actually arrives: you know
              what went wrong, not what the lesson was called. */}
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-brand-light text-brand">
                <tr>
                  <th className="px-3 py-2 text-left">What you see</th>
                  <th className="px-3 py-2 text-left">Why</th>
                  <th className="px-3 py-2 text-left">Fix</th>
                </tr>
              </thead>
              <tbody>
                {FAULT_TABLE.map((f) => (
                  <tr key={f.fault} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-semibold text-brand-dark">{f.fault}</td>
                    <td className="px-3 py-2 text-muted">{f.cause}</td>
                    <td className="px-3 py-2">{f.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-2 font-bold text-brand-dark">Water temperature, roughly</p>
            <ul className="space-y-1.5 text-sm">
              {TEMP_BANDS.map((t) => (
                <li key={t.band}>
                  <span className="font-semibold text-brand">{t.band}</span>{" "}
                  <span className="tabular-nums text-muted">({t.celsius})</span> — {t.what}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Deliberately coarse. Exact per-species optima vary by population and by what a
              given study measured, and a table of precise numbers would imply a certainty this
              app can&apos;t source. What holds everywhere is the shape.
            </p>
          </div>

          <p className="text-sm text-muted">
            Knots for fly gear are in the{" "}
            <Link href="/fly" className="text-accent-dark underline">
              Fly Box
            </Link>
            , and the general knots are under{" "}
            <Link href="/guide/knots" className="text-accent-dark underline">
              Fishing Guide
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
