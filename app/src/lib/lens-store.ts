"use client";

// localStorage as an external store, read through useSyncExternalStore.
//
// The obvious implementation — read localStorage in a useEffect and setState — is wrong
// twice over. It renders once with defaults and again with the real value, which is a
// cascading render the lint rule correctly rejects; and it makes the persisted choice
// arrive a frame late, so the page visibly re-sorts itself after paint.
//
// useSyncExternalStore is the shape React actually provides for this: subscribe to the
// store, read a snapshot, and give the server a fixed snapshot so hydration matches.
//
// The snapshot is the raw JSON *string* rather than a parsed object, deliberately.
// getSnapshot must return a referentially stable value or React re-renders forever, and
// a fresh object literal from JSON.parse never is. Parsing happens once in the consumer,
// memoised on the string.

import {
  LENS_STORAGE_KEY,
  METHOD_MODES,
  WATER_MODES,
  type MethodMode,
  type WaterMode,
} from "./home-nav";

export interface Lenses {
  water: WaterMode;
  method: MethodMode;
  closed: string[];
}

export const DEFAULT_LENSES: Lenses = { water: "all", method: "all", closed: [] };

const SERVER_SNAPSHOT = JSON.stringify(DEFAULT_LENSES);

const listeners = new Set<() => void>();

export function subscribeLenses(cb: () => void): () => void {
  listeners.add(cb);
  // `storage` fires for changes made in *other* tabs, so two open tabs stay in step.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function getLensSnapshot(): string {
  try {
    return localStorage.getItem(LENS_STORAGE_KEY) ?? SERVER_SNAPSHOT;
  } catch {
    // Private mode or storage disabled. The page works, it just won't remember.
    return SERVER_SNAPSHOT;
  }
}

export function getLensServerSnapshot(): string {
  return SERVER_SNAPSHOT;
}

export function writeLenses(next: Lenses): void {
  try {
    localStorage.setItem(LENS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Nothing to do — the in-memory state below still updates the UI for this session. */
  }
  for (const l of listeners) l();
}

/**
 * Parse a snapshot, discarding anything that isn't a value we actually ship.
 *
 * Storage is user-writable and survives across deploys, so a stored mode can outlive the
 * option that produced it. An unrecognised value falls back to the default rather than
 * being trusted into a filter that then matches nothing.
 */
export function parseLenses(raw: string): Lenses {
  try {
    const v = JSON.parse(raw) as Partial<Lenses>;
    return {
      water: WATER_MODES.some((m) => m.id === v.water) ? (v.water as WaterMode) : "all",
      method: METHOD_MODES.some((m) => m.id === v.method) ? (v.method as MethodMode) : "all",
      closed: Array.isArray(v.closed) ? v.closed.filter((c) => typeof c === "string") : [],
    };
  } catch {
    return DEFAULT_LENSES;
  }
}
