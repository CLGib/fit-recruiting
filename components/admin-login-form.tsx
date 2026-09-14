"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import {
  requestLoginLink,
  verifyLoginCode,
  type LoginState,
  type VerifyState,
} from "@/app/admin/actions";
import { Arrow } from "@/components/ui";

const INITIAL: LoginState = { status: "idle" };
const VERIFY_INITIAL: VerifyState = { status: "idle" };

const FIELD =
  "w-full rounded-2xl border border-line bg-canvas px-5 py-4 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none";

function Submit({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-8 py-4 text-sm font-semibold text-canvas transition-all hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? busy : idle}
      {!pending && <Arrow />}
    </button>
  );
}

function Err({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
    >
      {message}
    </p>
  );
}

export default function AdminLoginForm() {
  const [sendState, sendAction] = useActionState(requestLoginLink, INITIAL);
  const [verifyState, verifyAction] = useActionState(verifyLoginCode, VERIFY_INITIAL);
  const uid = useId();

  // Step two: the code has been emailed, now verify it.
  if (sendState.status === "sent" && sendState.email) {
    return (
      <form action={verifyAction} className="space-y-5">
        <div role="status" className="rounded-2xl border border-line-soft bg-canvas-warm/60 px-6 py-5">
          <p className="font-display text-xl font-normal text-navy">Check your email.</p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{sendState.message}</p>
        </div>

        <Err message={verifyState.message} />

        <input type="hidden" name="email" value={sendState.email} />
        <div>
          <label htmlFor={`${uid}-token`} className="eyebrow mb-3 block">
            Sign-in code
          </label>
          <input
            id={`${uid}-token`}
            name="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
            autoFocus
            placeholder="00000000"
            className={`${FIELD} text-center font-mono text-2xl tracking-[0.4em]`}
          />
        </div>
        <Submit idle="Sign in" busy="Checking…" />
        <p className="text-sm leading-relaxed text-body">
          The email also contains a link. Either works, but the code is more
          reliable if your mail provider scans links.
        </p>
      </form>
    );
  }

  // Step one: ask for the address.
  return (
    <form action={sendAction} className="space-y-5">
      <Err message={sendState.status === "error" ? sendState.message : undefined} />
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
          className={FIELD}
        />
      </div>
      <Submit idle="Email me a code" busy="Sending…" />
      <p className="text-sm leading-relaxed text-body">
        No passwords. We email you a code that expires in an hour.
      </p>
    </form>
  );
}
