"use client";

import { useRouter, usePathname } from "next/navigation";

// Installed to a Home Screen, the app runs in standalone mode — no address bar, no
// browser back button, and on iPhone no hardware one either. Without this the only way
// back from a species page is the hamburger menu, which is a poor substitute for the
// gesture people actually reach for.
//
// Prefers real history so it retraces the path taken, but a Home Screen launch can drop
// you straight onto a deep link with nothing behind it — hence the parent-route
// fallback rather than a dead button.
const PARENT_ROUTE: { prefix: string; parent: string }[] = [
  { prefix: "/species/compare", parent: "/species" },
  { prefix: "/species/", parent: "/species" },
  { prefix: "/locations/", parent: "/locations" },
  { prefix: "/guide/", parent: "/guide" },
  { prefix: "/spots", parent: "/tides" },
  { prefix: "/settings", parent: "/tides" },
];

function parentOf(pathname: string): string {
  return PARENT_ROUTE.find((r) => pathname.startsWith(r.prefix))?.parent ?? "/";
}

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Nothing to go back to from the home screen itself.
  if (pathname === "/") return null;

  function goBack() {
    // history.length is 1 on a fresh standalone launch; anything more means there's a
    // previous entry within this session worth returning to.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(parentOf(pathname));
  }

  return (
    <button
      onClick={goBack}
      aria-label="Go back"
      title="Back"
      /* 40px square: a bare chevron is only a few pixels wide, which is a miserable
         target for a thumb. The glyph stays small, the hit area doesn't. */
      className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg pb-1 text-3xl leading-none text-brand-dark transition hover:bg-brand-light active:scale-95"
    >
      ‹
    </button>
  );
}
