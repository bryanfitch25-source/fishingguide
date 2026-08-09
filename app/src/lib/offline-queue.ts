"use client";

// A durable queue for writes made with no signal.
//
// THE FAILURE THIS EXISTS TO PREVENT
//
// You catch a fish on a river with no bars, fill in the form, press Save, and the write
// fails. Before this, that was the end of it: an error toast, and the details gone unless
// you retyped them later from memory. That's the worst bug class this app can have,
// because the catch log is the only data here that is genuinely the user's and genuinely
// irreplaceable — everything else can be re-derived.
//
// WHY INDEXEDDB AND NOT localStorage
//
// localStorage is synchronous, capped around 5 MB, and stores strings only. IndexedDB is
// async, far larger, and stores structured values natively. A queued catch is small
// today, but the natural next step is queueing the photo Blob with it, and only one of
// these two can hold a Blob.
//
// WHAT IT DELIBERATELY DOES NOT DO
//
// It does not queue photos yet. Photos upload when you pick them rather than when you
// submit, so with no signal that upload has already failed and there is no URL to queue.
// Queueing the Blob and uploading it on flush is the right answer and it is a bigger
// change than this one — the field component and its preview state have to learn about
// deferred uploads too. Until then the form says so rather than dropping a photo
// silently. See PENDING_PHOTO_NOTE.
//
// It also doesn't queue edits or deletes. Both need a signal, and both are far less
// costly to retry later than losing a catch you're standing over.

const DB_NAME = "maritime-angler";
const DB_VERSION = 1;
const STORE = "pending-catches";

export interface PendingCatch {
  /** Local id, distinct from any server id. Also the IndexedDB key. */
  localId: string;
  /** The exact payload that would have been inserted. */
  payload: Record<string, unknown>;
  /** For rendering the pending row without re-deriving it from the payload. */
  label: { species: string | null; date: string; location: string | null };
  queuedAt: string;
  /** Bumped each time a flush fails, so a poison record can be surfaced rather than looping. */
  attempts: number;
  lastError?: string;
}

export const PENDING_PHOTO_NOTE =
  "Photos need a connection — they upload as you pick them, not when you save. A catch saved offline keeps everything else, and you can add the photo by editing it once you're back in signal.";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "localId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
        t.oncomplete = () => db.close();
      })
  );
}

export async function enqueueCatch(
  payload: Record<string, unknown>,
  label: PendingCatch["label"]
): Promise<PendingCatch> {
  const record: PendingCatch = {
    localId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    label,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  await tx("readwrite", (s) => s.add(record));
  notify();
  return record;
}

export async function pendingCatches(): Promise<PendingCatch[]> {
  try {
    const all = await tx<PendingCatch[]>("readonly", (s) => s.getAll() as IDBRequest<PendingCatch[]>);
    return all.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  } catch {
    // No IndexedDB (private mode in some browsers, or a very old one). The app works;
    // it just can't queue, and the caller falls back to reporting the original error.
    return [];
  }
}

export async function removePending(localId: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(localId));
  notify();
}

async function recordFailure(record: PendingCatch, message: string): Promise<void> {
  await tx("readwrite", (s) => s.put({ ...record, attempts: record.attempts + 1, lastError: message }));
  notify();
}

export interface FlushResult {
  sent: number;
  failed: number;
  remaining: number;
}

/**
 * Try to send everything queued.
 *
 * `send` returns an error or null, matching the shape of the existing write path, so the
 * caller keeps ownership of schema-compat and of which table this goes to — this file
 * stays ignorant of Supabase entirely, which is what makes it testable in a bare browser.
 *
 * Stops at the first failure rather than grinding through the rest. If one write is
 * failing because the network is still down, the next twenty will too, and hammering them
 * only inflates every record's attempt count.
 */
export async function flushQueue(
  send: (payload: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
): Promise<FlushResult> {
  const queued = await pendingCatches();
  if (queued.length === 0) return { sent: 0, failed: 0, remaining: 0 };

  setSnapshot({ syncing: true });
  let sent = 0;
  let failed = 0;

  for (const record of queued) {
    let result: { error: { message: string } | null };
    try {
      result = await send(record.payload);
    } catch (e) {
      result = { error: { message: e instanceof Error ? e.message : String(e) } };
    }
    if (result.error) {
      await recordFailure(record, result.error.message);
      failed = 1;
      break;
    }
    await removePending(record.localId);
    sent++;
  }

  const items = await pendingCatches();
  setSnapshot({ items, syncing: false });
  return { sent, failed, remaining: items.length };
}

// --- the queue as an external store -----------------------------------------
//
// Read through useSyncExternalStore rather than mirrored into component state. The
// obvious version — an effect that reads IndexedDB and setStates the result — is the
// cascading-render pattern the lint rule rejects, and it's genuinely worse: two sources
// of truth for the same list, with the copy in React state going stale the moment a
// flush finishes.
//
// IndexedDB is async and getSnapshot must be synchronous, so the module keeps a cache and
// refreshes it. The snapshot object is only replaced when something actually changed,
// which is what keeps the reference stable enough for React.

export interface QueueState {
  items: PendingCatch[];
  syncing: boolean;
}

const EMPTY: QueueState = { items: [], syncing: false };
let snapshot: QueueState = EMPTY;

const listeners = new Set<() => void>();

export function subscribeQueue(cb: () => void): () => void {
  listeners.add(cb);
  // Subscribing is what triggers the first read. That's the "subscribe to an external
  // system" shape the rule is asking for, and it keeps the component free of an effect
  // whose only job is to prime state.
  void refresh();
  return () => {
    listeners.delete(cb);
  };
}

export function getQueueSnapshot(): QueueState {
  return snapshot;
}

/** The server has no IndexedDB, so it always sees an empty queue. */
export function getQueueServerSnapshot(): QueueState {
  return EMPTY;
}

function setSnapshot(next: Partial<QueueState>): void {
  const merged = { ...snapshot, ...next };
  if (
    merged.syncing === snapshot.syncing &&
    merged.items.length === snapshot.items.length &&
    merged.items.every((it, i) => it.localId === snapshot.items[i]?.localId && it.attempts === snapshot.items[i]?.attempts)
  ) {
    return;
  }
  snapshot = merged;
  for (const l of listeners) l();
}

async function refresh(): Promise<void> {
  setSnapshot({ items: await pendingCatches() });
}

function notify(): void {
  void refresh();
}

/**
 * Is this error worth queueing for, or is it a real rejection?
 *
 * The distinction matters. A network failure means "try again later" and queueing is
 * right. A constraint violation or a permission error means the write will never succeed,
 * and queueing it would hide a genuine problem behind a spinner forever.
 */
export function looksOffline(error: { message?: string } | null): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  const m = (error?.message ?? "").toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("network request failed") ||
    m.includes("load failed") ||
    m.includes("err_internet_disconnected") ||
    m.includes("timeout")
  );
}
