"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PortalSearch from "./portal-search";
import { signOut } from "@/app/admin/actions";
import { PORTAL_NAV, isNavItemActive } from "@/lib/admin/nav";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/fit-mark-512.png"
        alt=""
        width={28}
        height={28}
        sizes="28px"
        className="h-7 w-7 rounded-md"
      />
      <span className="font-display text-lg font-normal tracking-tight text-navy">
        Fit Team Portal
      </span>
    </span>
  );
}

/**
 * Portal navigation: a persistent left sidebar on desktop, a top bar and
 * slide-in drawer on mobile. One component so the nav list is defined once.
 */
export default function PortalNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Escape closes the drawer — WCAG 2.1.2, no keyboard trap.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function nav(onNavigate?: () => void) {
    return (
      <nav aria-label="Portal" className="flex-1 overflow-y-auto px-3 py-4">
        {PORTAL_NAV.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="eyebrow px-3">{section.title}</p>
            <ul className="mt-2 space-y-0.5">
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "block rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-canvas"
                          : "block rounded-lg px-3 py-2 text-sm text-body transition-colors hover:bg-canvas-warm hover:text-navy"
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    );
  }

  function footer() {
    return (
      <div className="border-t border-line-soft px-4 py-4">
        <p className="truncate text-sm text-body">{email}</p>
        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className="text-sm font-semibold text-navy underline underline-offset-4 transition-colors hover:text-gold-deep"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <aside className="hidden border-r border-line-soft bg-canvas-warm/40 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="border-b border-line-soft px-5 py-4">
          <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}>
            <Wordmark />
          </Link>
        </div>
        <PortalSearch />
        {nav()}
        {footer()}
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line-soft bg-canvas px-4 py-3 lg:hidden">
        <Link href="/admin">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="text-navy"
        >
          <MenuIcon open={false} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Portal navigation"
        >
          {/* Backdrop only. aria-hidden so screen readers are not offered a
              second "Close menu" alongside the real button below. */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-canvas shadow-xl">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <Wordmark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                // Focus moves into the drawer as it opens, so keyboard users
                // start inside it (WCAG 2.4.3).
                autoFocus
                className="text-navy"
              >
                <MenuIcon open />
              </button>
            </div>
            <PortalSearch onNavigate={() => setOpen(false)} />
            {nav(() => setOpen(false))}
            {footer()}
          </div>
        </div>
      )}
    </>
  );
}
