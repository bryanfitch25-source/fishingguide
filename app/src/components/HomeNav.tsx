"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  METHOD_MODES,
  NAV_GROUPS,
  WATER_MODES,
  matcherHref,
  matchesLenses,
  relevanceRank,
  sortByRelevance,
  type MethodMode,
  type NavGroup,
  type NavItem,
  type WaterMode,
} from "@/lib/home-nav";
import {
  getLensServerSnapshot,
  getLensSnapshot,
  parseLenses,
  subscribeLenses,
  writeLenses,
} from "@/lib/lens-store";

// Tailwind can't see `bg-${accent}-light` built at runtime, so the classes are written
// out per accent. Adding a group means adding a row here.
const ACCENT: Record<NavGroup["accent"], { bg: string; text: string; border: string }> = {
  brand: { bg: "bg-brand-light", text: "text-brand", border: "hover:border-brand" },
  guide: { bg: "bg-guide-light", text: "text-guide", border: "hover:border-guide" },
  tackle: { bg: "bg-tackle-light", text: "text-tackle", border: "hover:border-tackle" },
  catches: { bg: "bg-catches-light", text: "text-catches", border: "hover:border-catches" },
  accent: { bg: "bg-accent-light", text: "text-accent", border: "hover:border-accent" },
};

export function HomeNav() {
  // Every group starts closed. Nothing opens until it's chosen — see DEFAULT_LENSES in
  // lib/lens-store, which is the set of group ids collapsed on arrival, not an empty set.
  // A first-time visitor sees five plain headings and picks one; opening is remembered
  // per group after that.
  //
  // The remembered state lives in localStorage, which the server cannot read, so the
  // first paint is always the default-closed state and hydration corrects it for anyone
  // who has since opened something. That means a returning visitor with an open group
  // sees it closed for a frame, not the other way around — the safe default and the SSR
  // default are now the same state, so only a customised one causes the brief mismatch.
  // Accepted rather than fixed: the alternative is a cookie read during SSR, which is
  // what ThemeScript does because a flash of the wrong theme is worth blocking paint
  // over and a briefly-closed section is not.
  const raw = useSyncExternalStore(subscribeLenses, getLensSnapshot, getLensServerSnapshot);
  const { water, method, closed } = useMemo(() => parseLenses(raw), [raw]);

  const setWater = (v: WaterMode) => writeLenses({ water: v, method, closed });
  const setMethod = (v: MethodMode) => writeLenses({ water, method: v, closed });
  const toggleGroup = (id: string) =>
    writeLenses({
      water,
      method,
      closed: closed.includes(id) ? closed.filter((x) => x !== id) : [...closed, id],
    });

  const lensed = water !== "all" || method !== "all";
  const all = NAV_GROUPS.flatMap((g) => g.items);
  const dimmedCount = all.filter((i) => !matchesLenses(i, water, method)).length;
  const promotedCount = all.filter((i) => relevanceRank(i, water, method) === 0).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Segmented
            label="Where"
            options={WATER_MODES.filter((m) => !m.comingSoon)}
            value={water}
            onChange={setWater}
          />
          <Segmented
            label="How"
            options={METHOD_MODES.filter((m) => !m.comingSoon)}
            value={method}
            onChange={setMethod}
          />
        </div>

        <p className="mt-2.5 text-xs text-muted">
          {lensed ? (
            <>
              Sorted for {water !== "all" ? WATER_MODES.find((m) => m.id === water)?.label.toLowerCase() : "any water"}
              {method !== "all" ? ` and ${METHOD_MODES.find((m) => m.id === method)?.label.toLowerCase()}` : ""}.{" "}
              {promotedCount > 0 && (
                <>
                  {promotedCount} {promotedCount === 1 ? "section moves" : "sections move"} to the
                  top of their group.{" "}
                </>
              )}
              {dimmedCount > 0 && (
                <>
                  {dimmedCount} {dimmedCount === 1 ? "is" : "are"} dimmed as less relevant — still
                  there, still one tap away.
                </>
              )}
            </>
          ) : (
            "Pick a water and a method to sort the sections. Nothing is ever hidden — the ones that don't apply just move down and grey out."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {NAV_GROUPS.map((group) => (
          <Group
            key={group.id}
            group={group}
            water={water}
            method={method}
            open={!closed.includes(group.id)}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              value === o.id
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-muted hover:border-brand"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Group({
  group,
  water,
  method,
  open,
  onToggle,
}: {
  group: NavGroup;
  water: WaterMode;
  method: MethodMode;
  open: boolean;
  onToggle: () => void;
}) {
  const a = ACCENT[group.accent];
  const items = sortByRelevance(group.items, water, method);

  return (
    <section className={`rounded-2xl border border-border bg-surface transition ${a.border}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className={`inline-flex shrink-0 items-center justify-center rounded-xl p-2.5 text-2xl ${a.bg}`} aria-hidden>
          {group.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-lg font-bold ${a.text}`}>{group.title}</span>
          <span className="block text-sm leading-snug text-muted">{group.blurb}</span>
        </span>
        <span aria-hidden className="shrink-0 text-muted">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <ul className="border-t border-border p-2">
          {items.map((item) => (
            <ItemRow key={item.href} item={item} water={water} method={method} accent={a} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ItemRow({
  item,
  water,
  method,
  accent,
}: {
  item: NavItem;
  water: WaterMode;
  method: MethodMode;
  accent: { text: string };
}) {
  const relevant = matchesLenses(item, water, method);
  // The matcher is the one destination that can act on the lenses, so it gets them.
  const href = item.href === "/matcher" ? matcherHref(water, method) : item.href;

  return (
    <li>
      <Link
        href={href}
        className={`block rounded-xl px-3 py-2.5 transition hover:bg-border/30 ${
          relevant ? "" : "opacity-45"
        }`}
      >
        <span className="flex items-baseline gap-2">
          <span className={`font-semibold ${relevant ? accent.text : "text-muted"}`}>
            {item.title}
          </span>
          {item.badge && relevant && (
            <span className="rounded-full bg-accent-light px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-dark">
              {item.badge}
            </span>
          )}
          {!relevant && (
            <span className="text-[10px] uppercase tracking-wide text-muted">
              other {item.method && method !== "all" ? "method" : "water"}
            </span>
          )}
        </span>
        {/* Hidden below `sm`. With all five groups open, 23 blurbs made the phone layout
            over 3000px tall — which is the original overcrowding complaint wearing a
            different hat. The group heading carries the context on a small screen. */}
        <span className="mt-0.5 hidden text-sm leading-snug text-muted sm:block">{item.blurb}</span>
      </Link>
    </li>
  );
}
