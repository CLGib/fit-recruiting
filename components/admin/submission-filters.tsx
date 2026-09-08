"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { STATUSES, STATUS_LABEL } from "@/lib/admin/status";

/**
 * Filters live in the URL rather than in component state, so a recruiter can
 * bookmark "everyone I still need to call" and send it to someone else.
 */
export default function SubmissionFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.replace(sp.toString() ? `/admin?${sp}` : "/admin");
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply({ q });
      }}
    >
      <div className="min-w-[16rem] flex-1">
        <label htmlFor="q" className="eyebrow mb-2 block">
          Search
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, or role"
          className="w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-navy placeholder:text-body focus:border-navy focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="status" className="eyebrow mb-2 block">
          Stage
        </label>
        <select
          id="status"
          defaultValue={params.get("status") ?? "all"}
          onChange={(e) => apply({ status: e.target.value === "all" ? "" : e.target.value })}
          className="rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-navy focus:border-navy focus:outline-none"
        >
          <option value="all">Every stage</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas"
      >
        Search
      </button>
    </form>
  );
}
