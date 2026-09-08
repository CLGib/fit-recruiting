/**
 * Shared chrome for a portal page: a back-to-portal cue, the title, and one
 * line saying what this screen is for. Deliberately plainer than the marketing
 * pages — this is a tool someone opens forty times a day.
 */
export function PortalPage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-10">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-light leading-tight tracking-tight text-navy">
        {title}
      </h1>
      {intro && <div className="mt-4 max-w-2xl leading-relaxed text-body">{intro}</div>}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

export function GroupHeading({ label, count }: { label: string; count: number }) {
  return (
    <h2 className="eyebrow mb-4 mt-12 first:mt-0">
      {label} ({count})
    </h2>
  );
}
