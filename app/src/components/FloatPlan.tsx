"use client";

import { useEffect, useState } from "react";
import { JRCC_HALIFAX, SAIL_PLAN_STORAGE_KEY } from "@/lib/safety";

// A float plan you can actually file.
//
// Transport Canada's own version is a card in a PDF you are told to photocopy. Nobody
// photocopies it. The whole value of a float plan is that a specific person knows where
// you went and when to worry — so the useful form of it is one that fills itself in from
// what you already fish, remembers the boat details between trips, and ends in a share
// button that puts the text into a message.
//
// Held in localStorage rather than the database on purpose: it has to be readable and
// sendable with no signal and no session, which is the situation it exists for. Nothing
// here is worth syncing between devices — the boat doesn't change and the trip is over
// by tomorrow.

interface PlanState {
  boatName: string;
  boatDesc: string;
  licence: string;
  phone: string;
  contactName: string;
  contactPhone: string;
  peopleAboard: string;
  leavingFrom: string;
  headingTo: string;
  departure: string;
  expectedBack: string;
  vehicle: string;
  notes: string;
}

const EMPTY: PlanState = {
  boatName: "",
  boatDesc: "",
  licence: "",
  phone: "",
  contactName: "",
  contactPhone: "",
  peopleAboard: "1",
  leavingFrom: "",
  headingTo: "",
  departure: "",
  expectedBack: "",
  vehicle: "",
  notes: "",
};

// Which fields survive to the next trip. The boat and your contact don't change; where
// you went today does, and pre-filling it with yesterday's destination would be worse
// than leaving it blank.
const REMEMBERED: (keyof PlanState)[] = [
  "boatName",
  "boatDesc",
  "licence",
  "phone",
  "contactName",
  "contactPhone",
  "vehicle",
];

function localDateTimeValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function formatWhen(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildMessage(p: PlanState): string {
  const lines = [
    "FLOAT PLAN — Maritime Angler",
    "",
    `Going: ${p.leavingFrom || "—"} → ${p.headingTo || "—"}`,
    `Leaving: ${formatWhen(p.departure)}`,
    `Back by: ${formatWhen(p.expectedBack)}`,
    `People aboard: ${p.peopleAboard || "—"}`,
    "",
    `Boat: ${[p.boatName, p.boatDesc].filter(Boolean).join(" — ") || "Shore / no boat"}`,
    p.licence ? `Licence/registration: ${p.licence}` : "",
    p.vehicle ? `Vehicle at the launch: ${p.vehicle}` : "",
    p.phone ? `My phone: ${p.phone}` : "",
    p.notes ? `Notes: ${p.notes}` : "",
    "",
    "IF I AM NOT BACK AND YOU CANNOT REACH ME:",
    `Call ${JRCC_HALIFAX.name} — ${JRCC_HALIFAX.toll} (or ${JRCC_HALIFAX.direct}).`,
    "Tell them this is an overdue-boater report and read them this message.",
  ];
  return lines.filter((l) => l !== "").join("\n");
}

export function FloatPlan() {
  const [plan, setPlan] = useState<PlanState>(EMPTY);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  // Seeded at construction rather than in an effect — both are synchronous reads that
  // already have an answer on the first render.
  if (!restored) {
    setRestored(true);
    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem(SAIL_PLAN_STORAGE_KEY);
        const saved: Partial<PlanState> = raw ? JSON.parse(raw) : {};
        const now = new Date();
        const back = new Date(now.getTime() + 4 * 3600000);
        setPlan({
          ...EMPTY,
          ...saved,
          departure: localDateTimeValue(now),
          expectedBack: localDateTimeValue(back),
        });
      } catch {
        /* A corrupt plan costs you the pre-fill, not the form. */
      }
    }
  }

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    const keep: Partial<PlanState> = {};
    for (const k of REMEMBERED) keep[k] = plan[k];
    try {
      localStorage.setItem(SAIL_PLAN_STORAGE_KEY, JSON.stringify(keep));
    } catch {
      /* Private mode. The form still works for this trip. */
    }
  }, [plan]);

  const set = (k: keyof PlanState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setPlan((p) => ({ ...p, [k]: e.target.value }));

  const message = buildMessage(plan);
  const ready = Boolean(plan.headingTo && plan.expectedBack && plan.contactName);

  async function share() {
    // The native share sheet is the point: it puts this into whatever they actually use
    // to talk to the person, rather than into a file nobody opens. Clipboard is the
    // fallback where the API doesn't exist (most desktop browsers).
    if (navigator.share) {
      try {
        await navigator.share({ title: "Float plan", text: message });
        return;
      } catch {
        /* Dismissed the sheet, or share failed — fall through to copying. */
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Nothing else to offer; the text is on screen to copy by hand. */
    }
  }

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-brand-dark">This trip</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Leaving from</span>
          <input value={plan.leavingFrom} onChange={set("leavingFrom")} placeholder="Pointe-du-Chêne wharf" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Heading to *</span>
          <input value={plan.headingTo} onChange={set("headingTo")} placeholder="Shediac Bay, east of the island" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Leaving at</span>
          <input type="datetime-local" value={plan.departure} onChange={set("departure")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Back by *</span>
          <input type="datetime-local" value={plan.expectedBack} onChange={set("expectedBack")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">People aboard</span>
          <input type="number" min={1} value={plan.peopleAboard} onChange={set("peopleAboard")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Vehicle at the launch</span>
          <input value={plan.vehicle} onChange={set("vehicle")} placeholder="Grey Tacoma, NB plate" className={field} />
        </label>

        <div className="mt-2 sm:col-span-2">
          <p className="text-sm font-semibold text-brand-dark">Who to tell</p>
          <p className="text-xs text-muted">
            A float plan filed with nobody is a note to yourself. This is the part that matters.
          </p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Their name *</span>
          <input value={plan.contactName} onChange={set("contactName")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Their number</span>
          <input type="tel" value={plan.contactPhone} onChange={set("contactPhone")} className={field} />
        </label>

        <div className="mt-2 sm:col-span-2">
          <p className="text-sm font-semibold text-brand-dark">Boat and you</p>
          <p className="text-xs text-muted">Remembered between trips. Leave blank if you fish from shore.</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Boat name</span>
          <input value={plan.boatName} onChange={set("boatName")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <input value={plan.boatDesc} onChange={set("boatDesc")} placeholder="16' aluminum, white hull, 40 hp" className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Licence / registration</span>
          <input value={plan.licence} onChange={set("licence")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your phone</span>
          <input type="tel" value={plan.phone} onChange={set("phone")} className={field} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Anything else</span>
          <textarea value={plan.notes} onChange={set("notes")} rows={2} className={field} />
        </label>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">What they&apos;ll receive</p>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed">{message}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={share}
          disabled={!ready}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition hover:bg-brand-dark disabled:opacity-50"
        >
          📤 Send this to someone
        </button>
        {!ready && (
          <span className="text-xs text-muted">
            Needs a destination, a time to be back, and a person to tell.
          </span>
        )}
        {copied && <span className="text-xs text-success">Copied — paste it into a message.</span>}
      </div>
    </div>
  );
}
