"use client";

import { useActionState } from "react";
import { createRole, type RoleFormState } from "@/app/admin/(portal)/roles/actions";
import { EMPLOYMENT_TYPES } from "@/lib/admin/role-status";
import { Field, Input, PrimaryButton, Select, Textarea } from "./field";

const INITIAL: RoleFormState = { status: "idle" };

/**
 * Intake, not the full posting.
 *
 * Only three things are required, because a recruiter takes this down while
 * still on the phone with the client. The description gets written afterwards,
 * on the role's own page.
 */
export default function NewRoleForm() {
  const [state, action, pending] = useActionState(createRole, INITIAL);
  const err = state.errors ?? {};

  return (
    <form action={action} className="space-y-6">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
        >
          {state.message}
        </p>
      )}

      <Field label="Title" error={err.title}>
        <Input name="title" required placeholder="Senior Staff Accountant" />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Location" error={err.location}>
          <Input name="location" required placeholder="Mobile, AL" />
        </Field>
        <Field label="Employment type" error={err.employment_type}>
          <Select name="employment_type" defaultValue="Full Time">
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
          <Input name="salary" placeholder="$65,000 to $75,000" />
        </Field>
        <Field label="Industry" hint="Comma separated.">
          <Input name="categories" placeholder="Accounting, Manufacturing" />
        </Field>
      </div>

      <Field
        label="Notes from the call"
        hint="Whatever the client told you. This is what the description gets written from, so the messier and more specific the better."
      >
        <Textarea
          name="intake_notes"
          rows={7}
          placeholder="Reports to the controller. Team of four. They lost someone to a competitor in June and are behind on close. Needs someone who has run a month-end close start to finish. Hybrid, three days in."
        />
      </Field>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create the draft"}
      </PrimaryButton>
    </form>
  );
}
