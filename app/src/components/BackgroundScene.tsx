"use client";

import { usePathname } from "next/navigation";

// One bright, daytime scene per section — see public/backgrounds/_credits.json for
// sourcing/licensing. Anything not explicitly matched falls back to "guide" (species
// pages, locations, regulations, near-me, login all live under that section visually).
function sceneFor(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/tackle")) return "tackle";
  if (pathname.startsWith("/catches")) return "catches";
  return "guide";
}

export function BackgroundScene() {
  const pathname = usePathname() || "/";
  const scene = sceneFor(pathname);

  return (
    <div className="scene-bg" style={{ backgroundImage: `url(/backgrounds/${scene}.webp)` }} aria-hidden>
      <div className="scene-overlay" />
    </div>
  );
}
