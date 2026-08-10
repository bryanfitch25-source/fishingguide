import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase-admin";
import { getTideEvents } from "@/lib/tides";
import { getWeather } from "@/lib/environment";
import { goodFishingDay } from "@/lib/goodFishingDay";
import { formatHeight, isUnitSystem, type UnitSystem } from "@/lib/units";
import { localDate } from "@/lib/dates";
// Reused rather than reimplemented: the same function the Tackle Box uses to decide
// whether to show "ends in 6 days" is the one that decides whether to push it, so the
// badge and the notification can never disagree about which day it is.
import { daysUntil as daysUntilLocal, WARRANTY_REMINDER_DAYS } from "@/lib/warranty";

const TIME_ZONE = "America/Moncton";

// Triggered daily by Vercel Cron (see vercel.json). Checks every user's license
// expiry date and gear-maintenance due dates, and pushes a reminder at 30/7/1 days
// out — at most once per day per user so it doesn't spam. Also sends the daily tide
// digest to anyone who's turned it on.
//
// Why a digest rather than Slack Water's per-tide "high tide in 30 minutes" alerts:
// that app scheduled local notifications on-device, days ahead, and iOS delivered them
// itself. A web app can't do that — iOS Safari has no Notification Triggers API and a
// PWA can't run in the background, so every notification has to be pushed from here.
// Per-tide alerts would need this route running at least hourly, and Vercel's Hobby
// plan caps cron at once per day. One morning digest fits that budget exactly and still
// answers the question the alerts were for: when is the water moving today.
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

  const today = localDate();
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

  // Warranty expiry: the same 30/7/1/0 ladder the licence uses, because it answers the
  // same question — is there still time to do something about this.
  //
  // Deliberately not reminded after expiry. A push saying a warranty lapsed last week is
  // an accusation, not a reminder; the item's own card carries that fact for whenever you
  // next look at it.
  const { data: warrantyItems } = await admin
    .from("tackle_items")
    .select("id, user_id, name, warranty_expires_on, last_warranty_reminder_sent")
    .not("warranty_expires_on", "is", null);

  for (const item of warrantyItems ?? []) {
    if (item.last_warranty_reminder_sent === today) continue;
    const days = daysUntilLocal(item.warranty_expires_on, today);
    if (days === null || !WARRANTY_REMINDER_DAYS.includes(days)) continue;

    const message =
      days === 0
        ? `The warranty on ${item.name} ends today.`
        : `The warranty on ${item.name} ends in ${days} day${days === 1 ? "" : "s"}.`;

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", item.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify({ title: "Maritime Angler", body: message, url: "/tackle" })
        );
        sent++;
      } catch {
        // Same as above — a dead subscription shouldn't fail the whole run.
      }
    }
    await admin
      .from("tackle_items")
      .update({ last_warranty_reminder_sent: today })
      .eq("id", item.id);
  }

  // Daily tide digest: today's highs and lows at the station each user has selected.
  const { data: digestUsers } = await admin
    .from("angler_settings")
    .select(
      "user_id, units, tide_station_id, tide_station_name, tide_station_lat, tide_station_lng, last_tide_digest_sent"
    )
    .eq("tide_digest_enabled", true)
    .not("tide_station_id", "is", null);

  // Several users commonly share a station; fetching it once per station rather than
  // once per user keeps this route inside a single cron invocation's time budget and is
  // basic courtesy toward a free public API.
  const eventsByStation = new Map<string, Awaited<ReturnType<typeof getTideEvents>>>();

  for (const row of digestUsers ?? []) {
    if (row.last_tide_digest_sent === today) continue;

    if (!eventsByStation.has(row.tide_station_id)) {
      eventsByStation.set(row.tide_station_id, await getTideEvents(row.tide_station_id, 2));
    }
    const events = eventsByStation.get(row.tide_station_id);
    if (!events || events.length === 0) continue;

    const todaysEvents = events.filter(
      (e) => new Date(e.time).toLocaleDateString("en-CA", { timeZone: TIME_ZONE }) === today
    );
    if (todaysEvents.length === 0) continue;

    const units: UnitSystem = isUnitSystem(row.units) ? row.units : "metric";
    const summary = todaysEvents
      .map(
        (e) =>
          `${e.type === "high" ? "High" : "Low"} ${new Date(e.time).toLocaleTimeString("en-CA", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: TIME_ZONE,
          })} (${formatHeight(e.heightM, units)})`
      )
      .join(" · ");

    // Best-effort context. A digest without the Good Fishing Day line is still useful,
    // so a weather failure never costs the whole notification.
    let gfdLabel = "";
    if (row.tide_station_lat !== null && row.tide_station_lng !== null) {
      const weather = await getWeather(row.tide_station_lat, row.tide_station_lng);
      const gfd = goodFishingDay(
        today,
        { name: row.tide_station_name ?? "", distanceKm: 0, events },
        weather
      );
      gfdLabel = ` — ${gfd.label} fishing day`;
    }

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", row.user_id);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify({
            title: `${row.tide_station_name ?? "Today's tides"}${gfdLabel}`,
            body: summary,
            url: "/tides",
          })
        );
        sent++;
      } catch {
        // Dead subscription — same as above, not worth failing the run.
      }
    }
    await admin
      .from("angler_settings")
      .update({ last_tide_digest_sent: today })
      .eq("user_id", row.user_id);
  }

  // Trip-day reminder: one push the morning of a saved trip's date, same "already sent
  // today" guard as everything above. Unlike the ladder-based reminders this only ever
  // fires once per trip — a trip has exactly one date to be reminded about, not a
  // recurring due date — so trip_date = today is the whole condition.
  const { data: dueTrips } = await admin
    .from("trips")
    .select("id, user_id, name, place_name, last_trip_reminder_sent")
    .eq("trip_date", today)
    .eq("reminder_enabled", true);

  for (const trip of dueTrips ?? []) {
    if (trip.last_trip_reminder_sent === today) continue;

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", trip.user_id);

    const message = trip.place_name ? `${trip.name} — ${trip.place_name}, today.` : `${trip.name} is today.`;

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          JSON.stringify({ title: "Maritime Angler", body: message, url: `/trip-planner/${trip.id}` })
        );
        sent++;
      } catch {
        // Dead subscription — same as above, not worth failing the run.
      }
    }
    await admin.from("trips").update({ last_trip_reminder_sent: today }).eq("id", trip.id);
  }

  return NextResponse.json({ ok: true, sent });
}
