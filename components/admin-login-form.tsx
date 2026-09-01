"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { requestLoginLink, type LoginState } from "@/app/admin/actions";
import { Arrow } from "@/components/ui";

const INITIAL: LoginState = { status: "idle" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-8 py-4 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Email me a sign-in link"}
      {!pending && <Arrow />}
    </button>
  );
}

export default function AdminLoginForm() {
  const [state, action] = useActionState(requestLoginLink, INITIAL);
  const uid = useId();

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-line-soft bg-canvas-warm/60 px-6 py-6">
        <p className="font-display text-2xl font-normal text-navy">Check your email.</p>
        <p className="mt-3 leading-relaxed text-body">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] text-[#8c3225]">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor={`${uid}-email`} className="eyebrow mb-3 block">
          Work email
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-line bg-canvas px-5 py-4 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none"
        />
      </div>
      <Submit />
      <p className="text-sm leading-relaxed text-body">
        No passwords. We email you a link that signs you in and expires in an hour.
      </p>
    </form>
  );
}
