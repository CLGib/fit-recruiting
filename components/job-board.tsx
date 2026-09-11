"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Arrow } from "@/components/ui";
import type { Job } from "@/lib/jobs/types";
import type { Copy } from "@/lib/site/copy";
import { fill } from "@/lib/site/format";

type BoardCopy = Pick<
  Copy["jobs"],
  | "searchLabel"
  | "searchPlaceholder"
  | "filterLabel"
  | "filterAll"
  | "resultsOne"
  | "resultsMany"
  | "emptyHeading"
  | "emptyBody"
  | "emptyButton"
>;

/**
 * "No filter" is an empty string internally, not the word "All". The label is
 * Fit's to edit, so it cannot also be the value the filter logic compares
 * against: renaming it would have silently broken the filter.
 */
const ALL = "";

export default function JobBoard({ jobs, copy }: { jobs: Job[]; copy: BoardCopy }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(jobs.flatMap((j) => j.categories))).sort()],
    [jobs],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesCategory = category === ALL || job.categories.includes(category);
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.categories.some((c) => c.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [jobs, query, category]);

  return (
    <div>
      {/* --- Controls --- */}
      <div className="rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-6 lg:p-8">
        <label htmlFor="job-search" className="eyebrow mb-3 block">
          {copy.searchLabel}
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-body"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            id="job-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-full border border-line bg-canvas py-4 pl-14 pr-5 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none"
          />
        </div>

        <fieldset className="mt-6">
          <legend className="eyebrow mb-3">{copy.filterLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c || "__all"}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "border-navy bg-navy text-canvas"
                      : "border-line bg-canvas text-body hover:border-navy/40 hover:text-navy"
                  }`}
                >
                  {c || copy.filterAll}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* --- Result count (announced to screen readers) --- */}
      <p aria-live="polite" className="mt-8 text-sm text-body">
        {results.length === 1 ? copy.resultsOne : fill(copy.resultsMany, { count: results.length })}
        {category !== ALL && ` in ${category}`}
      </p>

      {/* --- Results --- */}
      {results.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-line bg-canvas-warm/40 px-8 py-20 text-center">
          <p className="font-display text-3xl font-light text-navy">{copy.emptyHeading}</p>
          <p className="mx-auto mt-4 max-w-md text-body">{copy.emptyBody}</p>
          <Link
            href="/submit-resume"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
          >
            {copy.emptyButton}
            <Arrow />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {results.map((job) => (
            <li key={job.slug}>
              <Link
                href={`/jobs/${job.slug}`}
                className="group flex flex-col gap-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-line hover:bg-canvas-warm hover:shadow-soft sm:flex-row sm:items-center sm:gap-8 lg:p-8"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[1.625rem] font-normal leading-tight text-navy transition-colors group-hover:text-gold-deep">
                    {job.title}
                  </h2>
                  <p className="mt-2 text-sm text-body">
                    {job.location} · {job.type}
                  </p>
                  {job.summary && (
                    <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-body">{job.summary}</p>
                  )}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {job.categories.map((c) => (
                      <li key={c} className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-navy-700">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                {job.salary && <p className="shrink-0 font-display text-xl font-light text-navy">{job.salary}</p>}
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-navy transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink"
                >
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
