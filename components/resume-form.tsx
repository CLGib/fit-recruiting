"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitResume, type SubmitState } from "@/app/(site)/submit-resume/actions";
import { Arrow } from "@/components/ui";

const INITIAL: SubmitState = { status: "idle" };

/**
 * Checked in the browser as well as on the server. Vercel rejects bodies over
 * 4.5 MB before our action ever runs, so catching it here is what turns a dead
 * request into an instant, readable message.
 */
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const FIELD =
  "w-full rounded-2xl border border-line bg-canvas px-5 py-4 text-[0.9375rem] text-navy placeholder:text-body transition-colors focus:border-navy focus:outline-none";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-8 py-4 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Submit résumé"}
      {!pending && <Arrow />}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-[#a33a2b]">
      {message}
    </p>
  );
}

export default function ResumeForm({ role }: { role?: string }) {
  const [state, formAction] = useActionState(submitResume, INITIAL);
  const [fileError, setFileError] = useState<string | null>(null);
  const uid = useId();
  const errors = state.errors ?? {};

  function checkFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setFileError(null);
    if (f.size > MAX_BYTES) {
      // Clear it so a doomed request can never be submitted.
      e.target.value = "";
      return setFileError("That file is larger than 4 MB. Please attach a smaller copy.");
    }
    if (!ALLOWED_TYPES.has(f.type)) {
      e.target.value = "";
      return setFileError("Please attach a PDF, DOC, or DOCX file.");
    }
    setFileError(null);
  }

  if (state.status === "success") {
    return (
      <div className="rounded-[2rem] border border-line-soft bg-canvas-warm/60 p-10 text-center lg:p-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111820" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-7 font-display text-4xl font-light text-navy">
          Résumé received.
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-body">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-6 py-5 text-[0.9375rem] leading-relaxed text-[#8c3225]"
        >
          {state.message}
        </div>
      )}

      {/* Honeypot — visually and programmatically hidden from humans. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-cw`}>Company website</label>
        <input id={`${uid}-cw`} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {role && <input type="hidden" name="role" value={role} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-first`} className="eyebrow mb-3 block">
            First name <span className="text-gold-deep">*</span>
          </label>
          <input
            id={`${uid}-first`}
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? `${uid}-first-err` : undefined}
            className={FIELD}
          />
          <FieldError id={`${uid}-first-err`} message={errors.firstName} />
        </div>

        <div>
          <label htmlFor={`${uid}-last`} className="eyebrow mb-3 block">
            Last name <span className="text-gold-deep">*</span>
          </label>
          <input
            id={`${uid}-last`}
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? `${uid}-last-err` : undefined}
            className={FIELD}
          />
          <FieldError id={`${uid}-last-err`} message={errors.lastName} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-email`} className="eyebrow mb-3 block">
            Email <span className="text-gold-deep">*</span>
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            className={FIELD}
          />
          <FieldError id={`${uid}-email-err`} message={errors.email} />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className="eyebrow mb-3 block">
            Phone
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${uid}-resume`} className="eyebrow mb-3 block">
          Résumé <span className="text-gold-deep">*</span>
        </label>
        <input
          id={`${uid}-resume`}
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          onChange={checkFile}
          aria-invalid={Boolean(errors.resume || fileError)}
          aria-describedby={`${uid}-resume-hint${errors.resume || fileError ? ` ${uid}-resume-err` : ""}`}
          className="w-full cursor-pointer rounded-2xl border border-dashed border-line bg-canvas px-5 py-4 text-[0.9375rem] text-body transition-colors file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-navy file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-canvas hover:border-navy/40"
        />
        <p id={`${uid}-resume-hint`} className="mt-2 text-sm text-body">
          PDF, DOC, or DOCX. 4 MB maximum.
        </p>
        <FieldError id={`${uid}-resume-err`} message={fileError ?? errors.resume} />
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className="eyebrow mb-3 block">
          Anything you&rsquo;d like us to know
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={5}
          placeholder="What you're looking for, what you'd rather not do again, timing, whatever's useful."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
          className={`${FIELD} resize-y`}
        />
        <FieldError id={`${uid}-message-err`} message={errors.message} />
      </div>

      <div>
        <label htmlFor={`${uid}-consent`} className="flex cursor-pointer items-start gap-4">
          <input
            id={`${uid}-consent`}
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-line accent-[#17314f]"
          />
          <span className="text-[0.9375rem] leading-relaxed text-body">
            I agree that Fit Recruiting may store my résumé and contact me about
            opportunities.
          </span>
        </label>
        <FieldError id={`${uid}-consent-err`} message={errors.consent} />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
