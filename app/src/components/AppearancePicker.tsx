"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { isMissingSchemaError } from "@/lib/schema-compat";
import {
  FONTS,
  THEMES,
  type FontId,
  type ThemeId,
  type ThemeOption,
} from "@/lib/appearance";
import { AccentCard } from "./AccentCard";
import { writeAppearanceCookie } from "./ThemeScript";

// Colour and type, chosen from Settings.
//
// Both apply optimistically by writing the attribute straight onto <html> before the
// save round-trips — the whole point of a colour picker is seeing the colour, and
// waiting on the network to repaint makes every option feel broken. If the save fails
// the attribute is put back and the reason is shown.
export function AppearancePicker({
  initialTheme,
  initialFont,
  syncFromAccount = false,
}: {
  initialTheme: ThemeId;
  initialFont: FontId;
  /** Write the account's stored preference into the cookie on mount, for a device that
   *  has signed in but never picked anything here. */
  syncFromAccount?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeId>(initialTheme);
  const [font, setFont] = useState<FontId>(initialFont);
  const [message, setMessage] = useState<string | null>(null);

  async function save(column: "theme" | "font_pairing", value: string, revert: () => void) {
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      revert();
      setMessage("Sign in to save an appearance.");
      return;
    }
    const { error } = await supabase
      .from("angler_settings")
      .upsert({ user_id: user.id, [column]: value }, { onConflict: "user_id" });

    if (error) {
      revert();
      setMessage(
        isMissingSchemaError(error)
          ? "Appearance isn't in the database yet — run the pending migration (supabase db push)."
          : `Couldn't save that: ${error.message}`
      );
      return;
    }
    // Re-render server components so anything computed from the theme agrees with it.
    router.refresh();
  }

  function chooseTheme(next: ThemeId) {
    const previous = theme;
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    writeAppearanceCookie(next, font);
    save("theme", next, () => {
      setTheme(previous);
      document.documentElement.setAttribute("data-theme", previous);
      writeAppearanceCookie(previous, font);
    });
  }

  function chooseFont(next: FontId) {
    const previous = font;
    setFont(next);
    document.documentElement.setAttribute("data-font", next);
    writeAppearanceCookie(theme, next);
    save("font_pairing", next, () => {
      setFont(previous);
      document.documentElement.setAttribute("data-font", previous);
      writeAppearanceCookie(theme, previous);
    });
  }

  useEffect(() => {
    if (!syncFromAccount) return;
    writeAppearanceCookie(initialTheme, initialFont);
    document.documentElement.setAttribute("data-theme", initialTheme);
    document.documentElement.setAttribute("data-font", initialFont);
    // Runs once on mount; the values come from the server render and don't change
    // underneath it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups: ThemeOption["group"][] = ["Dark", "Mid-tone", "Light"];

  return (
    <AccentCard tone="neutral" title="🎨 Appearance">
      <div role="radiogroup" aria-label="Colour" className="space-y-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {group}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {THEMES.filter((t) => t.group === group).map((t) => {
                const selected = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseTheme(t.id)}
                    className={`flex items-start gap-3 rounded-xl border p-2.5 text-left transition ${
                      selected
                        ? "border-brand ring-1 ring-brand"
                        : "border-border hover:border-brand"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border"
                    >
                      {t.swatches.map((c) => (
                        <span key={c} style={{ background: c }} className="flex-1" />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {selected && "✓ "}
                        {t.name}
                      </span>
                      <span className="block text-xs leading-snug text-muted">{t.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Type</p>
        <div role="radiogroup" aria-label="Type" className="grid gap-2 sm:grid-cols-2">
          {FONTS.map((f) => {
            const selected = f.id === font;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => chooseFont(f.id)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  selected ? "border-brand ring-1 ring-brand" : "border-border hover:border-brand"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {selected && "✓ "}
                  {f.name}
                </span>
                <span className="block text-[11px] text-brand">{f.families}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{f.note}</span>
              </button>
            );
          })}
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-danger">{message}</p>}
      <p className="mt-3 text-xs text-muted">
        Saved to your account, so it follows you to any device you sign in on. Every
        ground here is checked for contrast — text stays legible on all of them.
      </p>
    </AccentCard>
  );
}
