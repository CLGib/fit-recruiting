"use client";

import { useState } from "react";
import { useActionState } from "react";
import { prepareForClient, type PresentationState } from "@/app/admin/(portal)/submissions/actions";
import { PresentationResumeSchema } from "@/lib/ai/resume-presentation-schema";

const INITIAL: PresentationState = { status: "idle" };

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-labelledby="client-copy-heading"
      className="mt-5 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7"
    >
      <h2 id="client-copy-heading" className="eyebrow mb-3">
        Copy for the client
      </h2>
      {children}
    </section>
  );
}

function PrepareButton({
  submissionId,
  label,
  quiet,
}: {
  submissionId: string;
  label: string;
  quiet?: boolean;
}) {
  const [state, action, pending] = useActionState(prepareForClient, INITIAL);
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="submissionId" value={submissionId} />
        <button
          type="submit"
          disabled={pending}
          className={
            quiet
              ? "text-sm font-medium text-body underline underline-offset-4 transition-colors hover:text-navy disabled:no-underline disabled:opacity-60"
              : "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:opacity-60"
          }
        >
          {pending ? "Setting it out…" : label}
        </button>
      </form>
      {state.status === "error" && state.message && (
        <p className="mt-3 text-sm leading-relaxed text-[#8c3225]" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}

export default function ClientCopyPanel({
  submissionId,
  configured,
  analyzable,
  stored,
}: {
  submissionId: string;
  configured: boolean;
  analyzable: boolean;
  stored: unknown | null;
}) {
  // Off by default. This document usually goes out before the candidate has
  // agreed to be introduced, and handing over someone's phone number at that
  // point gives away their details without their say-so.
  const [includeContact, setIncludeContact] = useState(false);

  if (!configured) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Switched off until an Anthropic API key is set on this deployment.
        </p>
      </Panel>
    );
  }

  if (!analyzable) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          This reads PDFs only, so this résumé needs setting out by hand.
        </p>
      </Panel>
    );
  }

  if (!stored) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          Put this résumé on Fit letterhead, tidied and consistent, ready to send
          to the hiring manager. The content stays theirs. Only the presentation
          changes.
        </p>
        <div className="mt-5">
          <PrepareButton submissionId={submissionId} label="Prepare a clean copy" />
        </div>
      </Panel>
    );
  }

  const parsed = PresentationResumeSchema.safeParse(stored);
  if (!parsed.success) {
    return (
      <Panel>
        <p className="text-[0.9375rem] leading-relaxed text-body">
          The saved copy could not be read. Preparing it again will replace it.
        </p>
        <div className="mt-4">
          <PrepareButton submissionId={submissionId} label="Prepare it again" quiet />
        </div>
      </Panel>
    );
  }

  const c = parsed.data;
  const href = `/admin/submissions/${submissionId}/presentation${
    includeContact ? "?contact=include" : ""
  }`;

  return (
    <Panel>
      <p className="text-[0.9375rem] leading-relaxed text-body">
        {c.experience.length} {c.experience.length === 1 ? "role" : "roles"}
        {c.education.length > 0 && `, ${c.education.length} education entries`}
        {c.certifications.length > 0 && `, ${c.certifications.length} certifications`}, set
        out on Fit letterhead.
      </p>

      {c.notes_for_recruiter.length > 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-3">
          <p className="text-sm font-semibold text-navy">Check these before you send</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-body marker:text-gold-deep">
            {c.notes_for_recruiter.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <label className="mt-5 flex items-start gap-3 text-[0.9375rem] leading-relaxed text-body">
        <input
          type="checkbox"
          checked={includeContact}
          onChange={(e) => setIncludeContact(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-navy)]"
        />
        <span>
          Include their email and phone number.
          <span className="block text-sm">
            Left off by default, so the client comes back through you and the
            candidate&rsquo;s details are not passed on before they have agreed
            to the introduction.
          </span>
        </span>
      </label>

      <a
        href={href}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
      >
        Download the PDF
      </a>

      <div className="mt-7 border-t border-line pt-5">
        {/* The strongest warning in the portal, because this document leaves
            the building with a real person's name on it. */}
        <p className="text-xs leading-relaxed text-body">
          Read this against the original before you send it. It is meant to be a
          faithful retyping and nothing more, but a model can misread a
          document, and this one goes to a client under the candidate&rsquo;s
          name. The PDF says on its face that Fit prepared it from their own
          résumé.
        </p>
        <div className="mt-4">
          <PrepareButton submissionId={submissionId} label="Prepare it again" quiet />
        </div>
      </div>
    </Panel>
  );
}
