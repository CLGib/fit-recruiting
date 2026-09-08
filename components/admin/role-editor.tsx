"use client";

import { useActionState } from "react";
import {
  draftDescription,
  updateRole,
  type DraftState,
  type RoleFormState,
} from "@/app/admin/(portal)/roles/actions";
import {
  EMPLOYMENT_TYPES,
  ROLE_STATUSES,
  ROLE_STATUS_HINT,
  ROLE_STATUS_LABEL,
} from "@/lib/admin/role-status";
import type { Role } from "@/lib/admin/roles";
import { Field, GhostButton, Input, PrimaryButton, Select, Textarea } from "./field";

const SAVE: RoleFormState = { status: "idle" };
const DRAFT: DraftState = { status: "idle" };

/**
 * Writes the summary, responsibilities, and requirements onto the role.
 *
 * Its own form, outside the editor's, so it round-trips through the server and
 * the fields come back filled. That means unsaved edits are lost when it runs,
 * which is why the button says so.
 */
function DraftButton({ roleId, rewrite }: { roleId: string; rewrite: boolean }) {
  const [state, action, pending] = useActionState(draftDescription, DRAFT);
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="id" value={roleId} />
        <GhostButton type="submit" disabled={pending}>
          {pending ? "Writing…" : rewrite ? "Write it again" : "Write it for me"}
        </GhostButton>
      </form>
      {state.status === "error" && state.message && (
        <p className="mt-3 text-sm leading-relaxed text-[#8c3225]" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );
}

export default function RoleEditor({ role }: { role: Role }) {
  const [state, action, pending] = useActionState(updateRole, SAVE);
  const written = Boolean(role.summary || role.responsibilities.length);

  return (
    <div className="space-y-10">
      <section className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7">
        <h2 className="eyebrow mb-4">The description</h2>
        {written ? (
          <p className="text-[0.9375rem] leading-relaxed text-body">
            {role.description_model
              ? "Drafted by Claude from your notes. Read it before it goes out, and edit anything that is not right."
              : "Written by hand."}
          </p>
        ) : (
          <p className="text-[0.9375rem] leading-relaxed text-body">
            Nothing written yet. Claude can draft it from the notes below, or you
            can write it yourself in the fields further down.
          </p>
        )}
        <div className="mt-5">
          <DraftButton roleId={role.id} rewrite={written} />
        </div>
        {written && (
          <p className="mt-4 text-xs leading-relaxed text-body">
            Writing it again replaces what is there now, and discards edits you
            have not saved.
          </p>
        )}
      </section>

      <form action={action} className="space-y-6">
        <input type="hidden" name="id" value={role.id} />

        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
          >
            {state.message}
          </p>
        )}

        <Field label="Title">
          <Input name="title" defaultValue={role.title} required />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Location">
            <Input name="location" defaultValue={role.location} required />
          </Field>
          <Field label="Employment type">
            <Select name="employment_type" defaultValue={role.employment_type}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Pay">
            <Input name="salary" defaultValue={role.salary ?? ""} />
          </Field>
          <Field label="Industry" hint="Comma separated.">
            <Input name="categories" defaultValue={role.categories.join(", ")} />
          </Field>
        </div>

        <Field label="Summary" hint="The first thing a candidate reads.">
          <Textarea name="summary" rows={4} defaultValue={role.summary ?? ""} />
        </Field>

        <Field label="Responsibilities" hint="One per line.">
          <Textarea
            name="responsibilities"
            rows={7}
            defaultValue={role.responsibilities.join("\n")}
          />
        </Field>

        <Field
          label="Requirements"
          hint="One per line. Only what someone genuinely cannot do the job without — a padded list stops good people applying."
        >
          <Textarea
            name="requirements"
            rows={6}
            defaultValue={role.requirements.join("\n")}
          />
        </Field>

        <Field label="Notes from the call" hint="Internal. Never shown on the website.">
          <Textarea name="intake_notes" rows={5} defaultValue={role.intake_notes ?? ""} />
        </Field>

        <Field label="Status" hint={ROLE_STATUS_HINT[role.status]}>
          <Select name="status" defaultValue={role.status}>
            {ROLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ROLE_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-center gap-4 pt-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save the role"}
          </PrimaryButton>
          <p aria-live="polite" className="text-sm text-body">
            {pending ? "Saving…" : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
