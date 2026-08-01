import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase-admin";

// Triggered daily by Vercel Cron (see vercel.json). Checks every user's license
// expiry date and gear-maintenance due dates, and pushes a reminder at 30/7/1 days
// out — at most once per day per user so it doesn't spam.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const admin = createAdminClient();
  if (!admin || !vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "push not configured" }, { status: 500 });
  }
  webpush.setVapidDetails("mailto:noreply@maritimeangler.app", vapidPublic, vapidPrivate);

  const today = new Date().toISOString().slice(0, 10);
  const daysUntil = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - new Date(today).getTime()) / 86400000);

  const { data: settings } = await admin
    .from("angler_settings")
    .select("user_id, license_expiry, last_license_reminder_sent")
    .not("license_expiry", "is", null);

  let sent = 0;
  for (const row of settings ?? []) {
    if (row.last_license_reminder_sent === today) continue;
    const days = daysUntil(row.license_expiry);
    if (![30, 7, 1, 0].includes(days)) continue;

    const message =
      days === 0
        ? "Your fishing licence expires today."
        : `Your fishing licence expires in ${days} day${days === 1 ? "" : "s"}.`;

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", row.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify({ title: "Maritime Angler", body: message, url: "/tackle" })
        );
        sent++;
      } catch {
        // Expired/invalid subscriptions are common (browser data cleared, etc.) —
        // not worth failing the whole run over.
      }
    }
    await admin.from("angler_settings").update({ last_license_reminder_sent: today }).eq("user_id", row.user_id);
  }

  // Gear maintenance: due when last_serviced_on + interval_days has passed (or never
  // serviced at all). Reminded at most once per day per item, same as licenses.
  const { data: tackleItems } = await admin
    .from("tackle_items")
    .select("id, user_id, name, last_serviced_on, maintenance_interval_days, last_maintenance_reminder_sent")
    .not("maintenance_interval_days", "is", null);

  for (const item of tackleItems ?? []) {
    if (item.last_maintenance_reminder_sent === today) continue;
    const dueDate = item.last_serviced_on ? new Date(item.last_serviced_on) : null;
    if (dueDate) dueDate.setDate(dueDate.getDate() + item.maintenance_interval_days);
    const due = !dueDate || dueDate.getTime() <= new Date(today).getTime();
    if (!due) continue;

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", item.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify({
            title: "Maritime Angler",
            body: `${item.name} is due for maintenance.`,
            url: "/tackle",
          })
        );
        sent++;
      } catch {
        // Same as above — a dead subscription shouldn't fail the whole run.
      }
    }
    await admin.from("tackle_items").update({ last_maintenance_reminder_sent: today }).eq("id", item.id);
  }

  return NextResponse.json({ ok: true, sent });
}
