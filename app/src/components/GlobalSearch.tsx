"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

interface SearchResult {
  type: "species" | "tackle" | "catch";
  href: string;
  title: string;
  subtitle?: string;
}

// Site-wide search: species guides for everyone, plus your own tackle and catches
// once signed in (queried client-side, RLS already scopes it to you).
export function GlobalSearch() {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        if (!cancelled) setResults([]);
        return;
      }
      const speciesRes = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .catch(() => ({ results: [] }));
      const speciesResults: SearchResult[] = (speciesRes.results ?? []).map(
        (r: { slug: string; title: string; subtitle: string }) => ({
          type: "species",
          href: `/species/${r.slug}`,
          title: r.title,
          subtitle: r.subtitle,
        })
      );

      let personalResults: SearchResult[] = [];
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [tackle, catches] = await Promise.all([
          supabase.from("tackle_items").select("id, name, category").ilike("name", `%${query}%`).limit(5),
          supabase.from("catches").select("id, species_slug, catch_date, notes").ilike("notes", `%${query}%`).limit(5),
        ]);
        personalResults = [
          ...(tackle.data ?? []).map((t) => ({
            type: "tackle" as const,
            href: "/tackle",
            title: t.name,
            subtitle: t.category,
          })),
          ...(catches.data ?? []).map((c) => ({
            type: "catch" as const,
            href: "/catches",
            title: c.species_slug ?? "Catch",
            subtitle: c.catch_date,
          })),
        ];
      }

      if (!cancelled) setResults([...speciesResults, ...personalResults]);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, supabase]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 hover:bg-border/40 transition"
        aria-label="Search"
      >
        🔍
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-surface card-lift shadow-lg p-3 z-30">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search species, tackle, catches…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-2"
          />
          {results.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto space-y-1">
              {results.map((r, i) => (
                <li key={i}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-brand-light"
                  >
                    <span>
                      {r.type === "species" ? "📖" : r.type === "tackle" ? "🧰" : "🐟"} {r.title}
                    </span>
                    {r.subtitle && <span className="text-xs text-muted">{r.subtitle}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 2 && <p className="text-sm text-muted px-2">No results.</p>
          )}
        </div>
      )}
    </div>
  );
}
