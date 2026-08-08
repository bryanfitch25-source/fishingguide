"use client";

import { useState } from "react";

// Shared renderer for both courses.
//
// Fly tying and lure making have the same shape — ordered stages, numbered lessons, steps,
// materials, a pitfall and one video — so they share a component rather than two
// near-identical ones drifting apart. The lesson type is structural rather than imported
// from either library, which keeps this ignorant of both.

export interface LessonStage {
  id: string;
  title: string;
  blurb: string;
}

export interface Lesson {
  stage: string;
  n: number;
  title: string;
  skill: string;
  steps: string[];
  materials?: string[];
  watchOut: string;
  videoId?: string;
  videoTitle?: string;
  videoChannel?: string;
}

interface Props {
  stages: LessonStage[];
  lessons: Lesson[];
  /** Rendered above the first stage — the lead safety warning, for instance. */
  warning?: { title: string; body: string };
  creditNote: string;
  accent?: "brand" | "guide";
}

export function LessonList({ stages, lessons, warning, creditNote, accent = "guide" }: Props) {
  const [stage, setStage] = useState(stages[0]?.id ?? "");
  // Lessons open one at a time by default. A course page where everything is expanded is a
  // wall; one where nothing is is a table of contents. Tracking the open lesson rather than
  // using <details> lets the first lesson of each stage start open.
  const [open, setOpen] = useState<number | null>(lessons[0]?.n ?? null);

  const shown = lessons.filter((l) => l.stage === stage);
  const current = stages.find((s) => s.id === stage);

  const chip = accent === "brand" ? "bg-brand text-on-brand" : "bg-guide text-on-brand";
  const hover = accent === "brand" ? "hover:border-brand" : "hover:border-guide";
  const accentText = accent === "brand" ? "text-brand" : "text-guide";

  return (
    <div className="space-y-4">
      {warning && (
        <div className="rounded-xl border border-danger bg-danger-light p-4 text-danger">
          <p className="font-bold">{warning.title}</p>
          <p className="mt-1 text-sm">{warning.body}</p>
        </div>
      )}

      <div role="tablist" aria-label="Course stages" className="flex flex-wrap gap-2">
        {stages.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={stage === s.id}
            onClick={() => {
              setStage(s.id);
              setOpen(lessons.find((l) => l.stage === s.id)?.n ?? null);
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              stage === s.id ? chip : `border border-border bg-surface text-muted ${hover}`
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {current && (
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-sm text-muted">{current.blurb}</p>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((l) => {
          const isOpen = open === l.n;
          return (
            <div key={l.n} className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => setOpen(isOpen ? null : l.n)}
                aria-expanded={isOpen}
                className="flex w-full items-baseline gap-3 p-4 text-left"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    accent === "brand" ? "bg-brand-light text-brand" : "bg-guide-light text-guide"
                  }`}
                >
                  {l.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-brand-dark">{l.title}</span>
                  <span className="block text-sm text-muted">{l.skill}</span>
                </span>
                <span aria-hidden className="shrink-0 text-muted">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border p-4 pt-3">
                  {l.materials && l.materials.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        You&apos;ll need
                      </p>
                      <p className="mt-0.5 text-sm">{l.materials.join(" · ")}</p>
                    </div>
                  )}

                  <ol className="ml-4 list-decimal space-y-1.5 text-sm">
                    {l.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>

                  <div className="mt-3 rounded-lg border border-accent bg-accent-light p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                      Where it goes wrong
                    </p>
                    <p className="mt-0.5 text-sm">{l.watchOut}</p>
                  </div>

                  {l.videoId ? (
                    <p className="mt-3 text-sm">
                      <a
                        href={`https://www.youtube.com/watch?v=${l.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-medium underline ${accentText}`}
                      >
                        ▶ Watch: {l.videoTitle}
                      </a>
                      {l.videoChannel && <span className="text-muted"> — {l.videoChannel}</span>}
                    </p>
                  ) : (
                    // Said out loud rather than left as an absence, so a missing video reads
                    // as "none found" rather than "forgot to add one".
                    <p className="mt-3 text-sm text-muted">
                      No video on this one — it&apos;s setup and judgement rather than
                      technique, and nothing I checked covered it better than the text above.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted">{creditNote}</p>
      </div>
    </div>
  );
}
