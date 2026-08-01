"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Dev mode serves unhashed, frequently-changing static assets — a cache-first
    // service worker there just serves stale JS/CSS after every edit. Only worth
    // having in production, where Next's build hashes make caching actually safe.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
