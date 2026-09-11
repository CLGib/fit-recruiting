"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveContent, type SaveState } from "@/app/admin/(portal)/website/actions";
import DisciplineIcon from "@/components/discipline-icon";
import { Field, GhostButton, Input, PrimaryButton, Select, Textarea } from "@/components/admin/field";
import {
  SPECIALTY_ICONS,
  SPECIALTY_ICON_LABEL,
  type Contact,
  type Home,
  type Intro,
  type SpecialtyIcon,
  type Specialties,
  type TeamPage,
} from "@/lib/site/schema";

/**
 * Editors for each block of the public site.
 *
 * Every input here is CONTROLLED, deliberately. React 19 resets a form's
 * uncontrolled inputs when its action finishes, and it counts an action that
 * returns a validation error as finished. With defaultValue inputs, a typo in
 * the email field would wipe everything else the person had just typed. State
 * survives the reset, so a mistake costs one field, not the whole form.
 */

const IDLE: SaveState = { status: "idle" };

type Meta = { updated_at: string; updated_by: string } | undefined;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Shell({
  contentKey,
  title,
  description,
  viewHref,
  meta,
  state,
  pending,
  action,
  children,
}: {
  contentKey: string;
  title: string;
  description: string;
  viewHref: string;
  meta: Meta;
  state: SaveState;
  pending: boolean;
  action: (fd: FormData) => void;
  children: React.ReactNode;
}) {
  const id = `block-${contentKey}`;
  return (
    <section
      aria-labelledby={id}
      className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 lg:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id={id} className="font-display text-2xl font-normal text-navy">
          {title}
        </h3>
        <Link
          href={viewHref}
          target="_blank"
          className="text-sm font-medium text-navy underline underline-offset-4 transition-colors hover:text-gold-deep"
        >
          View on the website
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </div>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{description}</p>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="key" value={contentKey} />
        {children}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </PrimaryButton>
          <p
            aria-live="polite"
            className={
              state.status === "error"
                ? "text-sm font-medium text-[#8c3225]"
                : "text-sm font-medium text-navy"
            }
          >
            {pending ? "" : state.message ?? ""}
          </p>
        </div>
        {meta && meta.updated_by !== "built-in" && (
          <p className="text-xs text-body">
            Last changed {when(meta.updated_at)} by {meta.updated_by}.
          </p>
        )}
      </form>
    </section>
  );
}

export function ContactForm({ initial, meta }: { initial: Contact; meta: Meta }) {
  const [state, action, pending] = useActionState(saveContent, IDLE);
  const [v, setV] = useState(initial);
  const err = state.errors ?? {};
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV({ ...v, [k]: e.target.value });

  return (
    <Shell
      contentKey="contact"
      title="Contact details"
      description="Shown in the footer of every page and on the Contact page. Change the phone number here and it changes everywhere."
      viewHref="/contact"
      meta={meta}
      state={state}
      pending={pending}
      action={action}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Street address" error={err.street}>
          <Input name="street" value={v.street} onChange={set("street")} required />
        </Field>
        <Field label="City, state and ZIP" error={err.city}>
          <Input name="city" value={v.city} onChange={set("city")} required />
        </Field>
        <Field label="Phone" error={err.phone}>
          <Input name="phone" type="tel" value={v.phone} onChange={set("phone")} required />
        </Field>
        <Field label="Email" error={err.email}>
          <Input name="email" type="email" value={v.email} onChange={set("email")} required />
        </Field>
      </div>
    </Shell>
  );
}

export function HomeForm({ initial, meta }: { initial: Home; meta: Meta }) {
  const [state, action, pending] = useActionState(saveContent, IDLE);
  const [v, setV] = useState(initial);
  const err = state.errors ?? {};

  return (
    <Shell
      contentKey="home"
      title="Homepage"
      description="The first thing anyone sees. The second line of the headline is set in gold italic."
      viewHref="/"
      meta={meta}
      state={state}
      pending={pending}
      action={action}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Headline, first line" error={err.heroTitle}>
          <Input
            name="heroTitle"
            value={v.heroTitle}
            maxLength={60}
            onChange={(e) => setV({ ...v, heroTitle: e.target.value })}
            required
          />
        </Field>
        <Field label="Headline, second line (gold italic)" error={err.heroTitleAccent}>
          <Input
            name="heroTitleAccent"
            value={v.heroTitleAccent}
            maxLength={60}
            onChange={(e) => setV({ ...v, heroTitleAccent: e.target.value })}
            required
          />
        </Field>
      </div>
      <Field label="Introduction" hint="Two or three sentences." error={err.heroIntro}>
        <Textarea
          name="heroIntro"
          rows={4}
          value={v.heroIntro}
          maxLength={500}
          onChange={(e) => setV({ ...v, heroIntro: e.target.value })}
          required
        />
      </Field>
    </Shell>
  );
}

export function IntroForm({
  contentKey,
  title,
  description,
  viewHref,
  initial,
  meta,
}: {
  contentKey: "about" | "employers";
  title: string;
  description: string;
  viewHref: string;
  initial: Intro;
  meta: Meta;
}) {
  const [state, action, pending] = useActionState(saveContent, IDLE);
  const [intro, setIntro] = useState(initial.intro);
  const err = state.errors ?? {};

  return (
    <Shell
      contentKey={contentKey}
      title={title}
      description={description}
      viewHref={viewHref}
      meta={meta}
      state={state}
      pending={pending}
      action={action}
    >
      <Field label="Introduction" error={err.intro}>
        <Textarea
          name="intro"
          rows={5}
          value={intro}
          maxLength={800}
          onChange={(e) => setIntro(e.target.value)}
          required
        />
      </Field>
    </Shell>
  );
}

type Row = { title: string; body: string; icon: SpecialtyIcon };

export function SpecialtiesForm({ initial, meta }: { initial: Specialties; meta: Meta }) {
  const [state, action, pending] = useActionState(saveContent, IDLE);
  const [rows, setRows] = useState<Row[]>(initial.items);
  const err = state.errors ?? {};
  const update = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <Shell
      contentKey="specialties"
      title="What we recruit for"
      description="The specialties on the About page. Change the wording freely; each one keeps the icon you pick for it."
      viewHref="/about"
      meta={meta}
      state={state}
      pending={pending}
      action={action}
    >
      <input type="hidden" name="count" value={rows.length} />
      {err.items && (
        <p role="alert" className="text-sm font-medium text-[#8c3225]">
          {err.items}
        </p>
      )}

      <ol className="space-y-4">
        {rows.map((row, i) => (
          <li key={i} className="rounded-2xl border border-line-soft bg-canvas p-5">
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className="mt-7 flex h-10 w-10 shrink-0 items-center justify-center text-navy-700"
              >
                <DisciplineIcon icon={row.icon} />
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-[1fr_12rem]">
                <Field label={`Specialty ${i + 1}`} error={err[`title_${i}`]}>
                  <Input
                    name={`title_${i}`}
                    value={row.title}
                    maxLength={60}
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                </Field>
                <Field label="Icon">
                  <Select
                    name={`icon_${i}`}
                    value={row.icon}
                    onChange={(e) => update(i, { icon: e.target.value as SpecialtyIcon })}
                  >
                    {SPECIALTY_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {SPECIALTY_ICON_LABEL[icon]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" error={err[`body_${i}`]}>
                    <Textarea
                      name={`body_${i}`}
                      rows={2}
                      value={row.body}
                      maxLength={240}
                      onChange={(e) => update(i, { body: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="mt-3 text-sm font-medium text-body underline underline-offset-4 transition-colors hover:text-navy"
              >
                Remove this one
                <span className="sr-only"> ({row.title || `specialty ${i + 1}`})</span>
              </button>
            )}
          </li>
        ))}
      </ol>

      {rows.length < 8 && (
        <GhostButton
          type="button"
          onClick={() => setRows([...rows, { title: "", body: "", icon: "none" }])}
        >
          Add a specialty
        </GhostButton>
      )}
    </Shell>
  );
}

export function TeamPageForm({ initial, meta }: { initial: TeamPage; meta: Meta }) {
  const [state, action, pending] = useActionState(saveContent, IDLE);
  const [published, setPublished] = useState(initial.published);

  return (
    <Shell
      contentKey="team_page"
      title="Team page"
      description="Keep this off until everyone has approved their own bio and photo. While it is off, the page is hidden from search and shows a draft notice."
      viewHref="/team"
      meta={meta}
      state={state}
      pending={pending}
      action={action}
    >
      <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-body">
        <input
          type="checkbox"
          name="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-navy)]"
        />
        <span>
          <span className="font-semibold text-navy">The team page is ready to go public.</span>{" "}
          Everyone on it has approved their bio and headshot.
        </span>
      </label>
      <p className="text-sm text-body">
        Names, bios and photos are edited on the{" "}
        <Link href="/admin/website/team" className="font-medium text-navy underline underline-offset-4">
          Team
        </Link>{" "}
        page.
      </p>
    </Shell>
  );
}
