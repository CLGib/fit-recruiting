"use client";

import { useActionState, useState } from "react";
import { writeJobDescription, type DescriptionState } from "@/app/admin/(portal)/tools/actions";
import { Field, GhostButton, Input, PrimaryButton, Select, Textarea } from "@/components/admin/field";
import { EMPLOYMENT_TYPES } from "@/lib/admin/role-status";

const INITIAL: DescriptionState = { status: "idle" };

type Inputs = {
  title: string;
  location: string;
  employment_type: string;
  salary: string;
  categories: string;
  notes: string;
};

/** Plain text, laid out to paste straight into a Bullhorn job description. */
function asText(d: NonNullable<DescriptionState["description"]>): string {
  return [
    d.summary,
    "",
    "Responsibilities",
    ...d.responsibilities.map((r) => `• ${r}`),
    "",
    "Requirements",
    ...d.requirements.map((r) => `• ${r}`),
  ].join("\n");
}

/**
 * Every input is controlled. React 19 resets a form's uncontrolled inputs when
 * its action finishes, so without this the brief would vanish the moment a
 * draft came back, and asking for another version would mean retyping it.
 */
export default function JobDescriptionTool() {
  const [state, action, pending] = useActionState(writeJobDescription, INITIAL);
  const [v, setV] = useState<Inputs>({
    title: "",
    location: "",
    employment_type: "Full Time",
    salary: "",
    categories: "",
    notes: "",
  });
  const [copied, setCopied] = useState(false);
  const err = state.errors ?? {};
  const set = (k: keyof Inputs) => (e: { target: { value: string } }) => setV((cur) => ({ ...cur, [k]: e.target.value }));

  const d = state.status === "done" ? state.description : undefined;

  return (
    <div className="space-y-10">
      <form action={action} className="space-y-6 rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 lg:p-8">
        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
          >
            {state.message}
          </p>
        )}

        <Field label="Title" error={err.title}>
          <Input name="title" value={v.title} onChange={set("title")} placeholder="Senior Staff Accountant" required />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Location" error={err.location}>
            <Input name="location" value={v.location} onChange={set("location")} placeholder="Mobile, AL" required />
          </Field>
          <Field label="Employment type" error={err.employment_type}>
            <Select name="employment_type" value={v.employment_type} onChange={set("employment_type")}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Pay" hint="Leave blank if the client has not said.">
            <Input name="salary" value={v.salary} onChange={set("salary")} placeholder="$65,000 to $75,000" />
          </Field>
          <Field label="Industry" hint="Comma separated.">
            <Input name="categories" value={v.categories} onChange={set("categories")} placeholder="Accounting, Manufacturing" />
          </Field>
        </div>

        <Field
          label="Notes from the call"
          hint="Whatever the client told you. The more specific, the better the draft."
          error={err.notes}
        >
          <Textarea
            name="notes"
            rows={7}
            value={v.notes}
            onChange={set("notes")}
            placeholder="Reports to the controller. Team of four. Needs someone who has run a month-end close start to finish. Hybrid, three days in."
          />
        </Field>

        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Writing…" : d ? "Write another version" : "Write the description"}
          </PrimaryButton>
          <p aria-live="polite" className="text-sm text-body">
            {pending ? "This takes about a minute." : ""}
          </p>
        </div>
      </form>

      {d && (
        <section aria-labelledby="draft-heading" className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="draft-heading" className="eyebrow">
              The draft
            </h2>
            <GhostButton
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(asText(d));
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
            >
              {copied ? "Copied" : "Copy for Bullhorn"}
            </GhostButton>
          </div>
          <p aria-live="polite" className="sr-only">
            {copied ? "Copied to the clipboard." : ""}
          </p>

          <p className="mt-6 leading-relaxed text-navy">{d.summary}</p>

          <h3 className="mt-7 text-sm font-semibold text-navy">Responsibilities</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-body marker:text-gold-deep">
            {d.responsibilities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h3 className="mt-7 text-sm font-semibold text-navy">Requirements</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-body marker:text-gold-deep">
            {d.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-body">
            Drafted by Claude from your notes. Read it before it goes into Bullhorn. Nothing here is saved
            or posted anywhere.
          </p>
        </section>
      )}
    </div>
  );
}
