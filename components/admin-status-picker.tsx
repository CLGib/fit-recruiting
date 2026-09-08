"use client";

import { useRef } from "react";
import { setStatus } from "@/app/admin/(portal)/submissions/actions";
import { STATUSES, STATUS_LABEL, type Status } from "@/lib/admin/status";

/**
 * Submits on change rather than behind a save button: a status is a single
 * value and an extra click to confirm it is friction with no benefit.
 * Falls back to a visible submit button when JavaScript is unavailable.
 */
export default function AdminStatusPicker({
  submissionId,
  current,
}: {
  submissionId: string;
  current: Status;
}) {
  const form = useRef<HTMLFormElement>(null);
  const id = `status-${submissionId}`;

  return (
    <form ref={form} action={setStatus} className="flex items-center gap-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <label htmlFor={id} className="eyebrow">
        Status
      </label>
      <select
        id={id}
        name="status"
        defaultValue={current}
        onChange={() => form.current?.requestSubmit()}
        className="rounded-full border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-navy focus:border-navy focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm text-navy">
          Update
        </button>
      </noscript>
    </form>
  );
}
