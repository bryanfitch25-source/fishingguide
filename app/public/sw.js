// Minimal offline support for the public guide content (species/locations/regulations)
// so it's readable with no signal at the wharf. Deliberately does NOT cache
// /tackle, /catches, /login, or any /api/* route — those are per-user, auth-gated,
// and must always go to the network so they never show stale or wrong-account data.
//
// /fly is excluded for the first reason: it's your own gear, behind auth, same as /tackle.
//
// /tides, /spots and /settings are excluded for both reasons at once: they're keyed to
// the station saved on your account, and a cached tide reading is actively misleading
// in a way a cached species guide isn't — a stale "rising, 1.6 m" looks exactly like a
// live one. Better to fail visibly than to show yesterday's water as though it were now.

const CACHE_NAME = "maritime-angler-v9";

// Downloaded depth charts. Written by the page (see lib/chart-storage.ts), read here.
//
// Kept out of CACHE_NAME on purpose: the activate step below deletes every cache whose
// name it doesn't recognise, and a chart someone deliberately downloaded before heading
// out must not vanish because the app shell version moved on.
const CHART_CACHE = "maritime-angler-charts-v1";

const NEVER_CACHE_PREFIXES = [
  "/tackle",
  "/catches",
  "/login",
  "/tides",
  "/spots",
  "/settings",
  "/fly",
  "/api/",
];

// The one /api/ path exempt from the rule above.
//
// Everything else under /api/ is per-user, auth-gated or time-sensitive. Depth tiles are
// none of those — public government bathymetry of a seabed that does not move — and
// serving them from cache is the entire point of the download button.
const CHART_TILE_PREFIX = "/api/depth/tile/";

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

  // Cached on the same reasoning as the species pages it indexes: "what do I tie on" is
  // exactly the question that comes up standing at the water with no signal. Like those
  // pages it carries owned-gear badges when you're signed in, so a cached copy can show
  // an inventory a few items out of date — a very different failure from a cached tide
  // reading, which is why /tides stays excluded and this doesn't.
  "/matcher",

  // Public reference with no per-user content at all, so it caches cleanly. Also the
  // page most worth having with no signal: tide windows and wharf etiquette are read
  // standing on the wharf.
  "/saltwater",

  // Both courses are static reference with no per-user content. Worth having offline
  // for the obvious reason: people tie flies and pour jigs in sheds and basements, which
  // is exactly where the signal isn't.
  "/tying",
  "/lures",

  // Deliberately cached, and the only conditions-bearing page that is.
  //
  // Everything on /safety except one tab is reference that does not change: the Transport
  // Canada equipment minimums, the cold-water stages, the distress script, the ice
  // thicknesses, the float plan form. That is precisely the material you want when you
  // have no signal — which is also when you are most likely to need it.
  //
  // The live conditions tab is handled by the page itself: it carries the time it was
  // rendered and says plainly when what you're looking at is old. That is what makes
  // caching this page acceptable where caching /tides is not.
  "/safety",

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
  // Precached one at a time, tolerating failures, rather than with cache.addAll.
  //
  // addAll is atomic: if a single one of these ~40 URLs doesn't come back 200, the whole
  // promise rejects and the service worker never installs. That is a bad trade for a
  // precache list of nice-to-haves. It means one slow species page, or one route erroring
  // because the database is briefly unreachable, costs the app *all* of its offline
  // support — including serving depth charts the user deliberately downloaded, which are
  // the one thing here they'd actually be relying on with no signal.
  //
  // So: best effort. Whatever fetches, caches; whatever doesn't, is fetched on demand
  // later. The worker installs either way.
  //
  // And time-boxed, because "doesn't fail" turned out not to be enough. A request that
  // hangs rather than rejects leaves the install pending indefinitely, and a worker stuck
  // in `installing` never reaches its fetch handler — so downloaded charts would not be
  // served offline no matter that they were sitting in the cache. Observed exactly that
  // with the pages slow to answer.
  //
  // Twenty seconds is comfortably longer than a warm precache needs and short enough that
  // a bad connection can't hold the whole feature hostage. Anything unfinished is dropped;
  // navigations cache themselves opportunistically anyway (see the fetch handler).
  const precache = caches.open(CACHE_NAME).then((cache) =>
    Promise.all(
      PRECACHE_URLS.map((url) =>
        cache.add(url).catch(() => {
          /* This page just isn't available offline until it's been visited once. */
        })
      )
    )
  );
  const deadline = new Promise((resolve) => setTimeout(resolve, 20000));
  event.waitUntil(Promise.race([precache, deadline]));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // CHART_CACHE is spared. It holds data the user chose to download, sized in
            // megabytes, often with no way to get it back where they're standing.
            .filter((k) => k !== CACHE_NAME && k !== CHART_CACHE)
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

function isNeverCached(url) {
  const path = new URL(url).pathname;
  if (path.startsWith(CHART_TILE_PREFIX)) return false;
  return NEVER_CACHE_PREFIXES.some((p) => path.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Depth tiles: cache-first, and never written to opportunistically.
  //
  // Cache-first because a tile that's already saved should render instantly and cost
  // nothing, including on a weak signal at the shore. Write-never because filling this
  // cache is the download button's job — if merely panning the map wrote tiles here, the
  // "Saved charts" list would quietly stop describing what is actually stored, and
  // deleting an area wouldn't reclaim the space it claimed to.
  if (new URL(request.url).pathname.startsWith(CHART_TILE_PREFIX)) {
    event.respondWith(
      caches.open(CHART_CACHE).then((cache) =>
        cache.match(request).then((cached) => cached || fetch(request))
      )
    );
    return;
  }

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
