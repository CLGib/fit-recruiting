"use client";

import { useActionState, useState } from "react";
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
 *
 * Every input is CONTROLLED. React 19 resets a form's uncontrolled inputs when
 * its action finishes, and an action that returns a validation error counts as
 * finished. Verified in the browser: with uncontrolled inputs, a whitespace
 * location wiped the title and the notes from the call. State survives the
 * reset, so a mistake now costs one field instead of everything typed.
 */
export default function NewRoleForm() {
  const [v, setV] = useState({
    title: "",
    location: "",
    employment_type: "Full Time",
    salary: "",
    categories: "",
    intake_notes: "",
  });
  const [state, action, pending] = useActionState(createRole, INITIAL);
  const err = state.errors ?? {};
  const set =
    (k: keyof typeof v) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setV({ ...v, [k]: e.target.value });

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
        <Input
          name="title"
          value={v.title}
          onChange={set("title")}
          required
          placeholder="Senior Staff Accountant"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Location" error={err.location}>
          <Input
            name="location"
            value={v.location}
            onChange={set("location")}
            required
            placeholder="Mobile, AL"
          />
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
          <Input
            name="salary"
            value={v.salary}
            onChange={set("salary")}
            placeholder="$65,000 to $75,000"
          />
        </Field>
        <Field label="Industry" hint="Comma separated.">
          <Input
            name="categories"
            value={v.categories}
            onChange={set("categories")}
            placeholder="Accounting, Manufacturing"
          />
        </Field>
      </div>

      <Field
        label="Notes from the call"
        hint="Whatever the client told you. This is what the description gets written from, so the messier and more specific the better."
      >
        <Textarea
          name="intake_notes"
          rows={7}
          value={v.intake_notes}
          onChange={set("intake_notes")}
          placeholder="Reports to the controller. Team of four. They lost someone to a competitor in June and are behind on close. Needs someone who has run a month-end close start to finish. Hybrid, three days in."
        />
      </Field>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create the draft"}
      </PrimaryButton>
    </form>
  );
}
