import Link from "next/link";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Button                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "gold" | "ghost" | "outline";
  className?: string;
};

const BUTTON_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-navy text-canvas hover:bg-navy-700 hover:shadow-lift hover:-translate-y-0.5",
  gold: "bg-gold text-ink hover:bg-gold-soft hover:shadow-lift hover:-translate-y-0.5",
  outline:
    "border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-canvas",
  ghost: "text-navy underline-offset-4 hover:text-gold-deep hover:underline",
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    variant === "ghost"
      ? "inline-flex items-center gap-2 text-sm font-semibold transition-all"
      : "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300";

  return (
    <Link href={href} className={`${base} ${BUTTON_STYLES[variant]} ${className}`}>
      {children}
      <Arrow />
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h13M12 5l7 7-7 7" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1240px] px-6 lg:px-10 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 lg:py-32 ${className}`}>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section heading                                                            */
/* -------------------------------------------------------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p
          className={`mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] ${
            dark ? "text-gold" : "text-body"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-[clamp(2.25rem,5vw,3.75rem)] font-light leading-[1.06] tracking-tight ${
          dark ? "text-canvas" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {body && (
        <p
          className={`mt-6 text-lg leading-relaxed ${dark ? "text-navy-100" : "text-body"}`}
        >
          {body}
        </p>
      )}
    </div>
  );
}
