import { DEFAULT_FONT, DEFAULT_THEME } from "@/lib/appearance";

// Applies the saved appearance before the first paint, from the client.
//
// This used to be resolved server-side in the root layout. That was correct and had no
// flash, but it read cookies through the Supabase client — and a cookie read anywhere in
// a layout opts every route beneath it out of static rendering. It cost the whole public
// guide its static generation: nine routes went from being served off the CDN edge to
// running a server render plus an auth call on every request, for a preference that only
// affects signed-in visitors.
//
// So the theme moves to the client, and the flash is avoided the standard way: a tiny
// synchronous script in <head>, which runs before the browser paints anything. The
// preference is mirrored into a plain cookie by the picker (see AppearancePicker) and
// read here without touching Supabase.
//
// It must stay synchronous and inline. Deferring it, or moving it to a bundle, puts it
// after first paint and reintroduces exactly the flash this exists to prevent.
const SCRIPT = `
(function () {
  try {
    var m = document.cookie.match(/(?:^|;\\s*)ma_appearance=([^;]*)/);
    var v = m ? decodeURIComponent(m[1]).split("|") : [];
    var t = v[0] || ${JSON.stringify(DEFAULT_THEME)};
    var f = v[1] || ${JSON.stringify(DEFAULT_FONT)};
    var e = document.documentElement;
    e.setAttribute("data-theme", t);
    e.setAttribute("data-font", f);
  } catch (_) {
    /* A malformed or blocked cookie just means the default ground, which is already
       on :root — there is nothing to recover and nothing worth logging. */
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

/** Cookie name and encoding, shared with the picker so the two can't drift apart. */
export const APPEARANCE_COOKIE = "ma_appearance";

/**
 * Mirrors the choice into the cookie the script above reads.
 *
 * The database row is the record that follows you between devices; this cookie is the
 * copy that can be read synchronously before first paint without a network call. A year
 * is arbitrary but well past the point anyone would notice it lapsing.
 */
export function writeAppearanceCookie(theme: string, font: string) {
  document.cookie =
    `${APPEARANCE_COOKIE}=${encodeURIComponent(`${theme}|${font}`)}` +
    `; path=/; max-age=31536000; SameSite=Lax`;
}
