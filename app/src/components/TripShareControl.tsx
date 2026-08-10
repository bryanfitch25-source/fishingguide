"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Trip, TripShare } from "@/types/trips";

// A read-only link anyone can open without an account — see get_shared_trip() in the
// migration for how the public side of this actually stays safe (a SECURITY DEFINER
// function keyed on the exact token, not a broadened RLS policy). The shared page never
// shows what's in your Tackle Box; only Matcher's generic suggestions, so sharing a trip
// never reveals your own gear to whoever has the link.
//
// Below that: inviting a specific account (Phase E) — narrower than the link, since it
// only works for whoever's actually invited, but requires them to already have a
// Maritime Angler account. invite_to_trip (also a SECURITY DEFINER function, since
// there's no client-safe way to turn an email into a user id otherwise) is what actually
// resolves the email and records the invite.
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

  const [shares, setShares] = useState<TripShare[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const shareUrl =
    trip.share_token && typeof window !== "undefined"
      ? `${window.location.origin}/trip-planner/shared/${trip.share_token}`
      : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("trip_shares")
        .select("*")
        .eq("trip_id", trip.id)
        .order("created_at", { ascending: false });
      if (!cancelled) setShares((data as TripShare[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, trip.id]);

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

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setInviteError(null);
    const { error } = await supabase.rpc("invite_to_trip", { p_trip_id: trip.id, p_email: email });
    if (error) {
      setInviteError(
        error.message.includes("NO_SUCH_ACCOUNT")
          ? "No Maritime Angler account uses that email."
          : error.message.includes("CANNOT_INVITE_SELF")
            ? "That's your own account — you already own this trip."
            : `Couldn't send that invite: ${error.message}`
      );
      setInviting(false);
      return;
    }
    const { data } = await supabase
      .from("trip_shares")
      .select("*")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: false });
    setShares((data as TripShare[]) ?? []);
    setInviteEmail("");
    setInviting(false);
  }

  async function removeShare(shareId: string) {
    const { error } = await supabase.from("trip_shares").delete().eq("id", shareId);
    if (error) {
      setInviteError(`Couldn't remove that: ${error.message}`);
      return;
    }
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  }

  return (
    <div className="space-y-3">
      {shareUrl ? (
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
      ) : (
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-brand transition"
        >
          {busy ? "Sharing…" : "🔗 Share"}
        </button>
      )}

      <form onSubmit={sendInvite} className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Invite by email"
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={inviting || !inviteEmail.trim()}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-brand transition disabled:opacity-60"
        >
          {inviting ? "Inviting…" : "Invite"}
        </button>
      </form>
      {inviteError && <p className="text-xs text-danger">{inviteError}</p>}

      {shares.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {shares.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
              <span className="truncate">{s.invited_email}</span>
              <button
                type="button"
                onClick={() => removeShare(s.id)}
                className="shrink-0 text-xs font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
