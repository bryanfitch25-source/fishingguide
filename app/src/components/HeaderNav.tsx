"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { GlobalSearch } from "@/components/GlobalSearch";

const LINKS = [
  { href: "/guide", label: "Fishing Guide" },
  { href: "/tackle", label: "Tackle Box" },
  { href: "/trip-planner", label: "Trip Planner" },
  { href: "/catches", label: "Catch Log" },
];

// The desktop nav crammed 4 links + search + sign-in into one row, which overflowed
// on an iPhone-width screen (nav text wrapped, "Sign In" got pushed off-screen).
// Below `md`, this collapses into a hamburger menu instead.
export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-brand whitespace-nowrap">
            {l.label}
          </Link>
        ))}
        <GlobalSearch />
        <AuthNav />
      </nav>

      <div className="flex items-center gap-1 md:hidden">
        <GlobalSearch />
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 hover:bg-border/40 transition"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-surface shadow-lg md:hidden">
          <nav className="flex flex-col p-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-light"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-3 py-2.5 border-t border-border mt-1">
              <AuthNav />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
