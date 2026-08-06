// Minimal offline support for the public guide content (species/locations/regulations)
// so it's readable with no signal at the wharf. Deliberately does NOT cache
// /tackle, /catches, /login, or any /api/* route — those are per-user, auth-gated,
// and must always go to the network so they never show stale or wrong-account data.
//
// /tides, /spots and /settings are excluded for both reasons at once: they're keyed to
// the station saved on your account, and a cached tide reading is actively misleading
// in a way a cached species guide isn't — a stale "rising, 1.6 m" looks exactly like a
// live one. Better to fail visibly than to show yesterday's water as though it were now.

const CACHE_NAME = "maritime-angler-v3";
const NEVER_CACHE_PREFIXES = [
  "/tackle",
  "/catches",
  "/login",
  "/tides",
  "/spots",
  "/settings",
  "/api/",
];

const PRECACHE_URLS = [
  "/",
  "/guide",
  "/species",
  "/locations",
  "/regulations",
  "/near-me",
  "/guide/seasonality",
  "/guide/knots",
  "/manifest.json",
  "/icon-192.png",

  // The individual guides, not just the indexes that link to them.
  //
  // Offline support existed so the content is readable with no signal at the wharf, but
  // only the index pages were precached — so offline you got a list of 27 species and
  // could open none of them. Pages did cache opportunistically after a first visit,
  // which meant the feature worked only for content you had already read.
  //
  // ~30 extra HTML documents, which is small next to what the fonts were costing.
  "/species/acadian-redfish",
  "/species/american-eel",
  "/species/american-shad",
  "/species/atlantic-cod",
  "/species/atlantic-herring",
  "/species/atlantic-mackerel",
  "/species/atlantic-salmon",
  "/species/atlantic-tomcod",
  "/species/bluefin-tuna",
  "/species/brook-trout",
  "/species/brown-trout",
  "/species/chain-pickerel",
  "/species/cunner",
  "/species/gaspereau",
  "/species/landlocked-salmon",
  "/species/largemouth-bass",
  "/species/muskellunge",
  "/species/pollock",
  "/species/rainbow-smelt",
  "/species/rainbow-trout",
  "/species/sculpin",
  "/species/smallmouth-bass",
  "/species/spiny-dogfish",
  "/species/striped-bass",
  "/species/white-perch",
  "/species/winter-flounder",
  "/species/yellow-perch",
  "/locations/launching-pei",
  "/locations/shediac-cocagne-nb"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

function isNeverCached(url) {
  const path = new URL(url).pathname;
  return NEVER_CACHE_PREFIXES.some((p) => path.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (isNeverCached(request.url)) return; // let it hit the network untouched

  // Static assets: cache-first (they're content-hashed, safe to keep indefinitely).
  if (request.url.includes("/_next/static/") || request.url.includes("/backgrounds/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Pages: network-first so content stays current, falling back to cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
  }
});

// Reminder notifications (licence renewal, gear maintenance, daily tide digest) sent by
// the server — see src/app/api/cron/send-reminders/route.ts. On iOS these are only
// delivered once the app has been added to the Home Screen.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Maritime Angler", {
      body: data.body,
      icon: "/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
