"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Open Roles leads deliberately. Clients mostly call; job seekers come to the
// website to see what is open, so candidate paths get first position.
//
// TODO: add { href: "/team", label: "Meet the Team" } once lib/team.ts has real
// names and bios. It is deliberately unlinked while entries are placeholders.
const NAV = [
  { href: "/jobs", label: "Open Roles" },
  { href: "/resume-audit", label: "Resume Review" },
  { href: "/resources", label: "Interview Guide" },
  { href: "/employers", label: "For Employers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes the drawer and returns focus to the control that opened it,
  // so keyboard users are never stranded inside a dismissed menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        lifted
          ? "bg-canvas/85 backdrop-blur-md border-b border-line-soft"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link href="/" aria-label="Fit Recruiting, finding quality people" className="shrink-0">
          <Image
            src="/brand/fit-lockup.png"
            alt="Fit Recruiting, finding quality people"
            width={2213}
            height={1444}
            priority
            // Renders at ~73px wide. Without `sizes`, Next serves the 3840px
            // variant of a 2213px source, which delayed the logo's first paint.
            sizes="150px"
            className="h-11 w-auto lg:h-12"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-[0.9375rem] transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-gold after:transition-all hover:text-navy ${
                  active
                    ? "text-navy after:w-full"
                    : "text-body after:w-0 hover:after:w-full"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/submit-resume"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 hover:shadow-soft"
          >
            Submit Résumé
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-navy lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line-soft bg-canvas px-6 pb-8 pt-4 lg:hidden"
      >
        <nav aria-label="Primary mobile" className="flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-line-soft py-4 font-display text-2xl text-navy"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/submit-resume"
            onClick={() => setOpen(false)}
            className="mt-6 rounded-full bg-navy px-6 py-4 text-center text-sm font-semibold text-canvas"
          >
            Submit Résumé
          </Link>
        </nav>
      </div>
    </header>
  );
}
