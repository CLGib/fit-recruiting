"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addNote, type NoteState } from "@/app/admin/(portal)/submissions/actions";

const INITIAL: NoteState = { status: "idle" };

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Add note"}
    </button>
  );
}

export default function AdminNoteForm({ submissionId }: { submissionId: string }) {
  const [state, action] = useActionState(addNote, INITIAL);
  const uid = useId();
  const ref = useRef<HTMLFormElement>(null);

  // Clear the box once the note is saved, so a second note does not start
  // with the text of the first still sitting there.
  useEffect(() => {
    if (state.status === "idle" && !state.message) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <label htmlFor={`${uid}-body`} className="eyebrow">
        Add a note
      </label>
      <textarea
        id={`${uid}-body`}
        name="body"
        rows={4}
        required
        placeholder="What was discussed, what they are looking for, anything the next person needs to know."
        aria-describedby={state.message ? `${uid}-err` : undefined}
        className="w-full resize-y rounded-2xl border border-line bg-canvas px-5 py-4 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none"
      />
      {state.message && (
        <p id={`${uid}-err`} role="alert" className="text-sm text-[#8c3225]">
          {state.message}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Save />
        <p className="text-sm text-body">Notes cannot be edited or deleted once saved.</p>
      </div>
    </form>
  );
}
