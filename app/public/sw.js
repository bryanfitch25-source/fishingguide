// Minimal offline support for the public guide content (species/locations/regulations)
// so it's readable with no signal at the wharf. Deliberately does NOT cache
// /tackle, /catches, /login, or any /api/* route — those are per-user, auth-gated,
// and must always go to the network so they never show stale or wrong-account data.

const CACHE_NAME = "maritime-angler-v1";
const NEVER_CACHE_PREFIXES = ["/tackle", "/catches", "/login", "/api/"];

const PRECACHE_URLS = ["/", "/guide", "/species", "/locations", "/regulations", "/manifest.json", "/icon-192.png"];

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

// Reminder notifications (license renewal, gear maintenance) sent by the server —
// see src/app/api/cron/send-reminders/route.ts.
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
