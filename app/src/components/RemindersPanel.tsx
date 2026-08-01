"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

export function RemindersPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported] = useState(
    () => typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("angler_settings").select("license_expiry").maybeSingle();
      if (data?.license_expiry) setLicenseExpiry(data.license_expiry);

      // getRegistration() resolves immediately (unlike `.ready`, which never resolves
      // at all if no service worker is registered — true in dev, where PWARegister
      // deliberately skips registration).
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setPushEnabled(!!sub);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveLicenseExpiry() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    await supabase
      .from("angler_settings")
      .upsert({ user_id: user.id, license_expiry: licenseExpiry || null }, { onConflict: "user_id" });
    setSaving(false);
    setMessage("Saved.");
    setTimeout(() => setMessage(null), 2000);
  }

  async function enablePush() {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setMessage("Push isn't configured on this deployment.");
      return;
    }
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      setMessage("No service worker registered on this device yet — reload the page and try again.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setMessage("Notification permission was denied.");
      return;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setPushEnabled(true);
    setMessage("Reminders enabled on this device.");
  }

  async function disablePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setPushEnabled(false);
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-bold text-brand-dark mb-3">🔔 Reminders</h3>
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium mb-1">Licence expiry date</label>
          <input
            type="date"
            value={licenseExpiry}
            onChange={(e) => setLicenseExpiry(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={saveLicenseExpiry}
          disabled={saving}
          className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {pushSupported && (
          <button
            onClick={pushEnabled ? disablePush : enablePush}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand transition"
          >
            {pushEnabled ? "🔕 Turn off notifications" : "🔔 Enable notifications on this device"}
          </button>
        )}
      </div>
      {message && <p className="text-sm text-muted">{message}</p>}
      <p className="text-xs text-muted">
        You&apos;ll get a reminder 30, 7, and 1 day before your licence expires, on any device
        where you&apos;ve enabled notifications.
      </p>
    </div>
  );
}
