"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { auditResume, type AuditState } from "@/app/(site)/resume-audit/actions";

const INITIAL: AuditState = { status: "idle" };

/** Mirrors the server cap so the browser rejects an oversized file first. */
const MAX_BYTES = 4 * 1024 * 1024;

export default function ResumeAudit() {
  const [state, action, pending] = useActionState(auditResume, INITIAL);
  const [localError, setLocalError] = useState<string | null>(null);

  if (state.status === "success" && state.audit) {
    const a = state.audit;
    return (
      <div>
        <div className="rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8 lg:p-10">
          <p className="eyebrow mb-4">First impression</p>
          <p className="font-display text-[1.5rem] font-light leading-snug text-navy">
            {a.first_impression}
          </p>
        </div>

        {a.works_well.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-normal text-navy">
              What is already working
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-gold-deep">
              {a.works_well.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {a.fixes.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-normal text-navy">
              What to change first
            </h2>
            <ol className="mt-5 space-y-6">
              {a.fixes.map((fix, i) => (
                <li key={i} className="rounded-2xl border border-line-soft bg-canvas-warm/40 p-6">
                  <p className="font-semibold text-navy">{fix.issue}</p>
                  <p className="mt-2 leading-relaxed text-body">{fix.why}</p>
                  <p className="mt-3 leading-relaxed text-navy">
                    <span className="eyebrow mr-2">Try</span>
                    {fix.instead}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {a.missing.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-normal text-navy">
              What a recruiter will look for and not find
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-gold-deep">
              {a.missing.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {a.formatting.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-normal text-navy">
              Layout and readability
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-gold-deep">
              {a.formatting.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 rounded-[2rem] border border-line-soft bg-canvas-warm/40 p-8">
          <p className="font-display text-2xl font-normal text-navy">
            Want a person to look at it?
          </p>
          <p className="mt-3 leading-relaxed text-body">
            This was written by Claude, not by a recruiter. If you would like
            someone here in Mobile to read it and talk to you about what you are
            looking for, send it over.
          </p>
          <Link
            href="/submit-resume"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
          >
            Submit your résumé
          </Link>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-body">
          We did not keep a copy of your file. Nothing you uploaded was saved.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const input = e.currentTarget.elements.namedItem("resume") as HTMLInputElement;
        const file = input?.files?.[0];
        if (file && file.size > MAX_BYTES) {
          e.preventDefault();
          setLocalError("That file is larger than 4 MB. Please attach a smaller copy.");
          return;
        }
        setLocalError(null);
      }}
      className="rounded-[2rem] border border-line-soft bg-canvas-warm/50 p-8 lg:p-10"
    >
      {/* Honeypot. Bots fill hidden fields, people do not. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <label htmlFor="resume" className="eyebrow mb-3 block">
        Your résumé
      </label>
      <input
        id="resume"
        name="resume"
        type="file"
        accept="application/pdf,.pdf"
        required
        className="w-full rounded-xl border border-line bg-canvas px-4 py-3.5 text-[0.9375rem] text-navy file:mr-4 file:rounded-full file:border-0 file:bg-navy file:px-5 file:py-2 file:text-sm file:font-semibold file:text-canvas hover:file:bg-navy-700"
      />
      <p className="mt-2 text-sm text-body">PDF, up to 4 MB.</p>

      {(localError || (state.status === "error" && state.message)) && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 leading-relaxed text-[#8c3225]"
        >
          {localError ?? state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Reading it now…" : "Review my résumé"}
      </button>
      <p aria-live="polite" className="mt-3 text-sm text-body">
        {pending ? "This takes about a minute. Please keep this tab open." : ""}
      </p>
    </form>
  );
}
