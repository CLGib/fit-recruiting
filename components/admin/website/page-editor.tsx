"use client";

import { useActionState, useState } from "react";
import { resetSection, saveSection, type SaveState } from "@/app/admin/(portal)/website/actions";
import DisciplineIcon from "@/components/discipline-icon";
import {
  Field as Labelled,
  GhostButton,
  Input,
  PrimaryButton,
  Select,
  Textarea,
} from "@/components/admin/field";
import { pageDef, type PageKey } from "@/lib/site/copy";
import { countName, itemName, type Field, type ItemsField } from "@/lib/site/copy/fields";
import { isSpecialtyIcon } from "@/lib/site/copy/icons";

/**
 * One editor for every page on the site.
 *
 * It knows nothing about any particular page. It reads the page's field
 * definitions and draws the right input for each, so making new copy editable
 * never means writing a new form.
 *
 * Every input is CONTROLLED. React 19 resets a form's uncontrolled inputs when
 * its action finishes, including a save that comes back with a validation
 * error, so with defaultValue inputs one mistake would wipe the whole section.
 */

const IDLE: SaveState = { status: "idle" };

type Row = Record<string, string>;
type Editable = string | boolean | Row[];
type Meta = Record<string, { updated_at: string; updated_by: string }>;

/** A stored value, in the shape its input edits: lists become one per line. */
function toEditable(f: Field, value: unknown): Editable {
  switch (f.kind) {
    case "toggle":
      return Boolean(value);
    case "lines":
      return (value as string[]).join("\n");
    case "items":
      return structuredClone(value as Row[]);
    default:
      return String(value ?? "");
  }
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PageEditor({
  pageKey,
  values,
  meta,
}: {
  pageKey: PageKey;
  values: Record<string, unknown>;
  meta: Meta;
}) {
  const page = pageDef(pageKey);
  return (
    <div className="space-y-5">
      {page.sections.map((section, i) => (
        <SectionEditor key={section.title} pageKey={pageKey} index={i} values={values} meta={meta} />
      ))}
    </div>
  );
}

function SectionEditor({
  pageKey,
  index,
  values,
  meta,
}: {
  pageKey: PageKey;
  index: number;
  values: Record<string, unknown>;
  meta: Meta;
}) {
  const page = pageDef(pageKey);
  const section = page.sections[index];

  const [v, setV] = useState<Record<string, Editable>>(() =>
    Object.fromEntries(section.keys.map((k) => [k, toEditable(page.fields[k], values[k])])),
  );
  const [state, action, pending] = useActionState(saveSection, IDLE);
  const [resetState, resetAction, resetting] = useActionState(
    async (prev: SaveState, fd: FormData) => {
      const next = await resetSection(prev, fd);
      if (next.status === "saved") {
        // The page re-renders with the defaults, but this component keeps its
        // own state, so it is put back here to match what visitors now see.
        setV(Object.fromEntries(section.keys.map((k) => [k, toEditable(page.fields[k], page.fields[k].default)])));
      }
      return next;
    },
    IDLE,
  );

  const errors = state.status === "error" ? (state.errors ?? {}) : {};
  const changed = section.keys
    .map((k) => meta[`${pageKey}.${k}`])
    .filter(Boolean)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  const id = `section-${pageKey}-${index}`;

  return (
    <section aria-labelledby={id} className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-7 lg:p-8">
      <h2 id={id} className="font-display text-2xl font-normal text-navy">
        {section.title}
      </h2>
      {section.hint && <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">{section.hint}</p>}

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="page" value={pageKey} />
        <input type="hidden" name="section" value={index} />

        {section.keys.map((k) => (
          <FieldInput
            key={k}
            name={k}
            field={page.fields[k]}
            value={v[k]}
            errors={errors}
            onChange={(next) => setV((prev) => ({ ...prev, [k]: next }))}
          />
        ))}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <PrimaryButton type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </PrimaryButton>
          <p
            aria-live="polite"
            className={
              state.status === "error" ? "text-sm font-medium text-[#8c3225]" : "text-sm font-medium text-navy"
            }
          >
            {pending ? "" : (state.message ?? "")}
          </p>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-body">
          {changed
            ? `Last changed ${when(changed.updated_at)} by ${changed.updated_by}.`
            : "Showing the original wording."}
        </p>
        {changed && (
          <form
            action={resetAction}
            onSubmit={(e) => {
              if (!window.confirm("Put this section back to the original wording? Your changes to it will be lost.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="page" value={pageKey} />
            <input type="hidden" name="section" value={index} />
            <button
              type="submit"
              disabled={resetting}
              className="text-sm font-medium text-body underline underline-offset-4 transition-colors hover:text-navy disabled:opacity-60"
            >
              {resetting ? "Restoring…" : "Restore the original wording"}
            </button>
          </form>
        )}
      </div>
      {resetState.status !== "idle" && resetState.message && (
        <p
          role={resetState.status === "error" ? "alert" : "status"}
          className={
            resetState.status === "error"
              ? "mt-2 text-sm font-medium text-[#8c3225]"
              : "mt-2 text-sm font-medium text-navy"
          }
        >
          {resetState.message}
        </p>
      )}
    </section>
  );
}

function FieldInput({
  name,
  field: f,
  value,
  errors,
  onChange,
}: {
  name: string;
  field: Field;
  value: Editable;
  errors: Record<string, string>;
  onChange: (next: Editable) => void;
}) {
  switch (f.kind) {
    case "text":
      return (
        <Labelled label={f.label} hint={f.hint} error={errors[name]}>
          <Input
            name={name}
            type={f.format === "email" ? "email" : "text"}
            value={value as string}
            maxLength={f.max ?? 160}
            onChange={(e) => onChange(e.target.value)}
          />
        </Labelled>
      );
    case "long":
      return (
        <Labelled label={f.label} hint={f.hint} error={errors[name]}>
          <Textarea
            name={name}
            rows={f.rows ?? 3}
            value={value as string}
            maxLength={f.max ?? 2000}
            onChange={(e) => onChange(e.target.value)}
          />
        </Labelled>
      );
    case "lines":
      return (
        <Labelled label={f.label} hint={f.hint ?? "One per line."} error={errors[name]}>
          <Textarea name={name} rows={f.rows ?? 5} value={value as string} onChange={(e) => onChange(e.target.value)} />
        </Labelled>
      );
    case "select":
      return (
        <div className="flex items-end gap-3">
          {f.preview === "discipline-icon" && (
            <div aria-hidden="true" className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center text-navy-700">
              {isSpecialtyIcon(value as string) && <DisciplineIcon icon={value as never} />}
            </div>
          )}
          <div className="flex-1">
            <Labelled label={f.label} hint={f.hint} error={errors[name]}>
              <Select name={name} value={value as string} onChange={(e) => onChange(e.target.value)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Labelled>
          </div>
        </div>
      );
    case "toggle":
      return (
        <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-body">
          <input
            type="checkbox"
            name={name}
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--color-navy)]"
          />
          <span>
            <span className="font-semibold text-navy">{f.label}.</span>
            {f.hint && <span className="block text-sm">{f.hint}</span>}
          </span>
        </label>
      );
    case "items":
      return <ItemsInput name={name} field={f} rows={value as Row[]} errors={errors} onChange={onChange} />;
  }
}

function IconButton({ label, d, disabled, onClick }: { label: string; d: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={d} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** A repeating group: process steps, specialties, guide sections. */
function ItemsInput({
  name,
  field: f,
  rows,
  errors,
  onChange,
}: {
  name: string;
  field: ItemsField;
  rows: Row[];
  errors: Record<string, string>;
  onChange: (next: Row[]) => void;
}) {
  const max = f.maxItems ?? 20;
  const min = f.minItems ?? 1;
  const noun = f.itemLabel;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const blank = (): Row =>
    Object.fromEntries(Object.entries(f.fields).map(([k, sf]) => [k, sf.kind === "select" ? sf.default : ""]));
  const update = (i: number, sub: string, val: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [sub]: val } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <fieldset>
      <legend className="eyebrow mb-2">{f.label}</legend>
      {f.hint && <p className="mb-3 text-xs leading-relaxed text-body">{f.hint}</p>}
      <input type="hidden" name={countName(name)} value={rows.length} />
      {errors[name] && (
        <p role="alert" className="mb-3 text-sm font-medium text-[#8c3225]">
          {errors[name]}
        </p>
      )}

      <ol className="space-y-4">
        {rows.map((row, i) => (
          <li key={i} className="rounded-2xl border border-line-soft bg-canvas p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-navy">
                {Noun} {i + 1}
              </p>
              <div className="flex gap-2">
                <IconButton label={`Move ${noun} ${i + 1} up`} d="M6 15l6-6 6 6" disabled={i === 0} onClick={() => move(i, -1)} />
                <IconButton
                  label={`Move ${noun} ${i + 1} down`}
                  d="M6 9l6 6 6-6"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                />
                <IconButton
                  label={`Remove ${noun} ${i + 1}`}
                  d="M6 6l12 12M18 6L6 18"
                  disabled={rows.length <= min}
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                />
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(f.fields).map(([sub, sf]) => (
                <FieldInput
                  key={sub}
                  name={itemName(name, i, sub)}
                  field={sf}
                  value={row[sub] ?? ""}
                  errors={errors}
                  onChange={(val) => update(i, sub, String(val))}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>

      {rows.length < max && (
        <GhostButton type="button" className="mt-4" onClick={() => onChange([...rows, blank()])}>
          Add a {noun}
        </GhostButton>
      )}
    </fieldset>
  );
}
