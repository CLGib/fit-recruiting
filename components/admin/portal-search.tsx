"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchNav } from "@/lib/admin/nav";

/**
 * Type what you are trying to do, not where it lives.
 *
 * Cmd+K focuses it from anywhere; Enter opens the top hit; Escape clears.
 */
export default function PortalSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const hits = useMemo(() => searchNav(query), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setQuery("");
    onNavigate?.();
    router.push(href);
  }

  return (
    <div className="border-b border-line-soft px-4 py-3">
      <div className="relative">
        <label htmlFor="portal-search" className="sr-only">
          Search the portal
        </label>
        <input
          id="portal-search"
          ref={input}
          type="search"
          value={query}
          placeholder="Search the portal…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
            if (e.key === "Enter" && hits[0]) {
              e.preventDefault();
              go(hits[0].item.href);
            }
          }}
          className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-navy placeholder:text-body focus:border-navy focus:outline-none"
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-body lg:block"
        >
          ⌘K
        </kbd>
      </div>

      {query.trim() !== "" && (
        <ul className="mt-2 space-y-0.5" aria-live="polite">
          {hits.length === 0 && (
            <li className="px-2 py-2 text-sm text-body">Nothing matches that.</li>
          )}
          {hits.map((hit) => (
            <li key={hit.item.href}>
              <button
                type="button"
                onClick={() => go(hit.item.href)}
                className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-navy transition-colors hover:bg-canvas-warm"
              >
                {hit.item.label}
                <span className="block text-xs text-body">
                  {hit.matchedKeyword ?? hit.section}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
