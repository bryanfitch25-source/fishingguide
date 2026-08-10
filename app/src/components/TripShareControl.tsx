"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trip } from "@/types/trips";

// A read-only link anyone can open without an account — see get_shared_trip() in the
// migration for how the public side of this actually stays safe (a SECURITY DEFINER
// function keyed on the exact token, not a broadened RLS policy). The shared page never
// shows what's in your Tackle Box; only Matcher's generic suggestions, so sharing a trip
// never reveals your own gear to whoever has the link.
export function TripShareControl({
  trip,
  onChange,
}: {
  trip: Trip;
  onChange: (patch: Partial<Trip>) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    trip.share_token && typeof window !== "undefined"
      ? `${window.location.origin}/trip-planner/shared/${trip.share_token}`
      : null;

  async function share() {
    setBusy(true);
    setError(null);
    const token = crypto.randomUUID();
    const { error } = await supabase.from("trips").update({ share_token: token }).eq("id", trip.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onChange({ share_token: token });
  }

  async function unshare() {
    if (!confirm("Stop sharing this trip? The link will stop working.")) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("trips").update({ share_token: null }).eq("id", trip.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onChange({ share_token: null });
  }

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission can be denied — the link is still visible to select by hand.
    }
  }

  if (!shareUrl) {
    return (
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-brand transition disabled:opacity-60"
      >
        {busy ? "Sharing…" : "🔗 Share"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
      <span className="truncate">{shareUrl}</span>
      <button type="button" onClick={copy} className="shrink-0 text-xs font-medium text-accent hover:underline">
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={unshare}
        disabled={busy}
        className="shrink-0 text-xs font-medium text-danger hover:underline disabled:opacity-60"
      >
        Stop sharing
      </button>
      {error && <p className="w-full text-xs text-danger">{error}</p>}
    </div>
  );
}
