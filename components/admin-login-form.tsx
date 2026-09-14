"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestLoginLink,
  signInWithPassword,
  verifyLoginCode,
  type LoginState,
  type PasswordState,
  type VerifyState,
} from "@/app/admin/actions";
import { Arrow } from "@/components/ui";

const INITIAL: LoginState = { status: "idle" };
const VERIFY_INITIAL: VerifyState = { status: "idle" };
const PASSWORD_INITIAL: PasswordState = { status: "idle" };

const FIELD =
  "w-full rounded-2xl border border-line bg-canvas px-5 py-4 text-[0.9375rem] text-navy placeholder:text-body focus:border-navy focus:outline-none";

const SWITCH =
  "text-sm font-medium text-navy underline underline-offset-4 transition-colors hover:text-gold-deep";

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

/**
 * Password first, emailed code second.
 *
 * Password leads while Fit's sign-in emails cannot be delivered (Supabase only
 * sends auth email to its own team members until custom SMTP is set up). The
 * code flow is kept intact so it works again the moment email does.
 */
export default function AdminLoginForm() {
  const [mode, setMode] = useState<"password" | "code">("password");
  const [sendState, sendAction] = useActionState(requestLoginLink, INITIAL);
  const [verifyState, verifyAction] = useActionState(verifyLoginCode, VERIFY_INITIAL);
  const [passwordState, passwordAction] = useActionState(signInWithPassword, PASSWORD_INITIAL);
  const uid = useId();

  if (mode === "password") {
    return (
      <form action={passwordAction} className="space-y-5">
        <Err message={passwordState.message} />
        <div>
          <label htmlFor={`${uid}-pw-email`} className="eyebrow mb-3 block">
            Work email
          </label>
          <input
            id={`${uid}-pw-email`}
            name="email"
            type="email"
            autoComplete="username"
            required
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-password`} className="eyebrow mb-3 block">
            Password
          </label>
          <input
            id={`${uid}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={FIELD}
          />
        </div>
        <Submit idle="Sign in" busy="Signing in…" />
        <p className="text-sm leading-relaxed text-body">
          No password yet?{" "}
          <button type="button" onClick={() => setMode("code")} className={SWITCH}>
            Email me a sign-in code instead
          </button>
        </p>
      </form>
    );
  }

  // Code, step two: the code has been emailed, now verify it.
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

  // Code, step one: ask for the address.
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
        We email you a code that expires in an hour.{" "}
        <button type="button" onClick={() => setMode("password")} className={SWITCH}>
          Sign in with a password instead
        </button>
      </p>
    </form>
  );
}
