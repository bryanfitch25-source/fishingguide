"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LessonList } from "@/components/LessonList";
import {
  FLY_COURSE_CREDIT_NOTE,
  FLY_COURSE_SCOPE_NOTE,
  FLY_LESSONS,
  FLY_RELATED,
  FLY_STAGES,
} from "@/lib/fly-course";
import {
  ENTOMOLOGY_NOTE,
  HATCH_CAVEAT,
  HATCH_WINDOWS,
  INSECT_GROUPS,
  RISE_FORMS,
  SAMPLING_STEPS,
} from "@/lib/entomology";
import { CASTING_FAULTS, GLOSSARY, GLOSSARY_GROUPS } from "@/lib/casting-faults";

type View = "course" | "bugs" | "faults" | "glossary";

const VIEWS: { id: View; label: string }[] = [
  { id: "course", label: "The course" },
  { id: "bugs", label: "What they eat" },
  { id: "faults", label: "What's going wrong" },
  { id: "glossary", label: "Glossary" },
];

export function FlyCourseClient() {
  const [view, setView] = useState<View>("course");

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Fly fishing" className="scroll-tabs gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              view === v.id
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-muted hover:border-brand"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "course" && <CourseView />}
      {view === "bugs" && <BugsView />}
      {view === "faults" && <FaultsView />}
      {view === "glossary" && <GlossaryView />}
    </div>
  );
}

function CourseView() {
  return (
    <>
      <LessonList
        stages={FLY_STAGES}
        lessons={FLY_LESSONS}
        creditNote={FLY_COURSE_CREDIT_NOTE}
        accent="brand"
      />

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted">{FLY_COURSE_SCOPE_NOTE}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 font-bold text-brand-dark">The rest of the fly fishing in here</p>
        <ul className="space-y-2 text-sm">
          {FLY_RELATED.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="font-medium text-accent-dark underline">
                {r.title}
              </Link>
              <span className="text-muted"> — {r.what}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// Insects, rise forms and the seasonal sequence. Groups start fully closed: the full life
// cycle of six groups at once is a wall of text, and someone checking what a caddis pupa
// does opens that one group rather than being handed mayfly first by default.
function BugsView() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-muted">{ENTOMOLOGY_NOTE}</p>
      </div>

      <div className="space-y-2">
        {INSECT_GROUPS.map((g) => {
          const isOpen = open === g.slug;
          return (
            <div key={g.slug} className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => setOpen(isOpen ? null : g.slug)}
                aria-expanded={isOpen}
                className="flex w-full items-baseline gap-3 p-4 text-left"
              >
                <span aria-hidden className="shrink-0 text-lg">
                  {g.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-brand-dark">{g.name}</span>
                  <span className="block text-sm italic text-muted">{g.scientific}</span>
                </span>
                <span aria-hidden className="shrink-0 text-muted">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border p-4 pt-3">
                  <p className="mb-3 text-sm text-muted">{g.metamorphosis}</p>

                  <ol className="space-y-2.5">
                    {g.stages.map((s) => (
                      <li key={s.stage}>
                        <p className="text-sm font-semibold text-brand">{s.stage}</p>
                        <p className="text-sm">{s.detail}</p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-3 rounded-lg border border-border bg-brand-light p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                      How to spot it
                    </p>
                    <p className="mt-0.5 text-sm">{g.identify}</p>
                  </div>

                  <div className="mt-2 rounded-lg border border-accent bg-accent-light p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                      The stage that matters
                    </p>
                    <p className="mt-0.5 text-sm">{g.keyStage}</p>
                  </div>

                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-muted">Hook sizes:</span> {g.hookSizes}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold text-muted">Patterns:</span>{" "}
                    {g.patterns.map((p, i) => (
                      <span key={p}>
                        {i > 0 && " · "}
                        <Link
                          href={`/fly?pattern=${encodeURIComponent(p)}`}
                          className="text-accent-dark underline"
                        >
                          {p}
                        </Link>
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-2 font-bold text-brand-dark">Reading the rise</h3>
        <p className="mb-3 text-sm text-muted">
          What the ring on the water tells you about where in the column the fish is feeding —
          which matters far more than which insect it is.
        </p>
        <div className="space-y-2">
          {RISE_FORMS.map((r) => (
            <div key={r.name} className="rounded-lg border border-border p-3">
              <p className="font-semibold text-brand">{r.name}</p>
              <p className="mt-1 text-sm">
                <span className="text-muted">Looks like:</span> {r.looks}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">Means:</span> {r.means}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">So:</span> {r.fish}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-2 font-bold text-brand-dark">Sampling the river</h3>
        <p className="mb-2 text-sm text-muted">
          The one habit that beats every published chart, including the one below.
        </p>
        <ol className="ml-4 list-decimal space-y-1.5 text-sm">
          {SAMPLING_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="mb-1 font-bold text-brand-dark">The seasonal sequence</h3>
        <p className="mb-3 text-xs text-muted">{HATCH_CAVEAT}</p>
        <div className="space-y-3">
          {HATCH_WINDOWS.map((w) => (
            <div key={w.window} className="rounded-lg border border-border p-3">
              <p className="font-semibold text-brand-dark">{w.window}</p>
              <p className="text-sm italic text-muted">{w.water}</p>
              <ul className="mt-1.5 ml-4 list-disc space-y-1 text-sm">
                {w.expect.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-muted">Approach:</span> {w.approach}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaultsView() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Faults are listed by what you can actually observe, because that&apos;s how the question
        arrives — you know the line piled up or the fly cracked off, not which lesson covers it.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-brand-light text-brand">
            <tr>
              <th className="px-3 py-2 text-left">What you see</th>
              <th className="px-3 py-2 text-left">Why</th>
              <th className="px-3 py-2 text-left">Fix</th>
              <th className="px-3 py-2 text-left">Lesson</th>
            </tr>
          </thead>
          <tbody>
            {CASTING_FAULTS.map((f) => (
              <tr key={f.fault} className="border-t border-border align-top">
                <td className="px-3 py-2 font-semibold text-brand-dark">{f.fault}</td>
                <td className="px-3 py-2 text-muted">{f.cause}</td>
                <td className="px-3 py-2">{f.fix}</td>
                <td className="px-3 py-2 text-xs italic text-muted">{f.lesson}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlossaryView() {
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return GLOSSARY;
    return GLOSSARY.filter(
      (t) => t.term.toLowerCase().includes(needle) || t.definition.toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="glossary-search" className="sr-only">
          Search the glossary
        </label>
        <input
          id="glossary-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — tippet, mend, dun, seam…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-muted">
          {shown.length} of {GLOSSARY.length} terms
        </p>
      </div>

      {GLOSSARY_GROUPS.map((group) => {
        const terms = shown.filter((t) => t.group === group);
        if (terms.length === 0) return null;
        return (
          <div key={group} className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-bold text-brand-dark">{group}</h3>
            <dl className="space-y-2.5">
              {terms.map((t) => (
                <div key={t.term}>
                  <dt className="text-sm font-semibold text-brand">{t.term}</dt>
                  <dd className="text-sm">{t.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}

      {shown.length === 0 && (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Nothing matches “{q}”. The glossary covers the terms used in this app — if something
          here sent you looking for a word that isn&apos;t defined, that&apos;s a gap worth filing.
        </p>
      )}
    </div>
  );
}
