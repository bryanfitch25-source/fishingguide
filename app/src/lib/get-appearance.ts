import { createClient } from "./supabase-server";
import {
  DEFAULT_FONT,
  DEFAULT_THEME,
  isFontId,
  isThemeId,
  type FontId,
  type ThemeId,
} from "./appearance";

// Reads the signed-in angler's appearance preference for the root layout.
//
// Every failure path lands on the defaults rather than throwing: signed out, no
// settings row yet, columns not migrated, database unreachable. The root layout renders
// on literally every route including /login and the public guide, so this returning an
// error would take the whole app down over a colour preference.
export async function getAppearance(): Promise<{ theme: ThemeId; font: FontId }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { theme: DEFAULT_THEME, font: DEFAULT_FONT };

    const { data } = await supabase
      .from("angler_settings")
      .select("theme, font_pairing")
      .maybeSingle();

    return {
      theme: isThemeId(data?.theme) ? data.theme : DEFAULT_THEME,
      font: isFontId(data?.font_pairing) ? data.font_pairing : DEFAULT_FONT,
    };
  } catch {
    return { theme: DEFAULT_THEME, font: DEFAULT_FONT };
  }
}
