import { z } from "zod";

/**
 * The building blocks of editable copy.
 *
 * Every piece of text on the public site is declared once as a field: what
 * kind it is, what the editor calls it, and its default, which is the site's
 * current wording. From that one declaration come the validation, the portal
 * form, and the value a page renders. Making new copy editable means adding a
 * field, not writing a form.
 *
 * No JSX, no server APIs and no path aliases in this folder: the portal (in
 * the browser), the server, and the node test runner all import it directly.
 */

type Base = { label: string; hint?: string };

export type TextField = Base & {
  kind: "text";
  default: string;
  max?: number;
  optional?: boolean;
  format?: "email";
};
export type LongField = Base & {
  kind: "long";
  default: string;
  max?: number;
  rows?: number;
  optional?: boolean;
};
export type SelectField = Base & {
  kind: "select";
  default: string;
  options: readonly { value: string; label: string }[];
  /** Show the chosen specialty icon beside the dropdown. */
  preview?: "discipline-icon";
};
export type ToggleField = Base & { kind: "toggle"; default: boolean };
/** A list of short strings, edited one per line. */
export type LinesField = Base & {
  kind: "lines";
  default: readonly string[];
  maxItems?: number;
  itemMax?: number;
  rows?: number;
};
/** A photo Fit can swap: the file itself, and a description for screen readers. */
export type ImageValue = { src: string; alt: string };
export type ImageField = Base & { kind: "image"; default: ImageValue };
export type ItemField = TextField | LongField | SelectField;
/** A repeating group, such as process steps or specialties. */
export type ItemsField<I extends Record<string, ItemField> = Record<string, ItemField>> = Base & {
  kind: "items";
  /** What one entry is called in the editor: "step", "specialty". */
  itemLabel: string;
  fields: I;
  default: readonly { [K in keyof I]: string }[];
  minItems?: number;
  maxItems?: number;
};
export type Field = TextField | LongField | SelectField | ToggleField | LinesField | ItemsField | ImageField;

export type FieldValue<F> = F extends ImageField
  ? ImageValue
  : F extends ToggleField
  ? boolean
  : F extends LinesField
    ? string[]
    : F extends ItemsField<infer I>
      ? { [K in keyof I]: string }[]
      : string;

type Opts<F> = Omit<Partial<F>, "kind" | "label" | "default">;

export const text = (label: string, value: string, o: Opts<TextField> = {}): TextField => ({
  ...o,
  kind: "text",
  label,
  default: value,
});
export const long = (label: string, value: string, o: Opts<LongField> = {}): LongField => ({
  ...o,
  kind: "long",
  label,
  default: value,
});
export const select = (
  label: string,
  value: string,
  options: readonly { value: string; label: string }[],
  o: Opts<SelectField> = {},
): SelectField => ({ ...o, kind: "select", label, default: value, options });
export const toggle = (label: string, value: boolean, o: Opts<ToggleField> = {}): ToggleField => ({
  ...o,
  kind: "toggle",
  label,
  default: value,
});
export const lines = (label: string, value: string[], o: Opts<LinesField> = {}): LinesField => ({
  ...o,
  kind: "lines",
  label,
  default: value,
});
export const image = (label: string, value: ImageValue, o: Opts<ImageField> = {}): ImageField => ({
  ...o,
  kind: "image",
  label,
  default: value,
});
export function items<const I extends Record<string, ItemField>>(
  label: string,
  itemLabel: string,
  fields: I,
  value: { [K in keyof I]: string }[],
  o: Opts<ItemsField<I>> = {},
): ItemsField<I> {
  return { ...o, kind: "items", label, itemLabel, fields, default: value };
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export type Section<K extends string = string> = {
  title: string;
  hint?: string;
  keys: readonly K[];
};

export type PageDef<F extends Record<string, Field> = Record<string, Field>> = {
  label: string;
  /** Where "View on the website" goes. */
  path: string;
  description: string;
  fields: F;
  /** How the editor groups the fields. Every field appears in exactly one. */
  sections: readonly Section<Extract<keyof F, string>>[];
};

export function definePage<F extends Record<string, Field>>(def: PageDef<F>): PageDef<F> {
  return def;
}

export type PageCopy<P> = P extends PageDef<infer F> ? { [K in keyof F]: FieldValue<F[K]> } : never;

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

const SHIPPED = /^\/photos\/[A-Za-z0-9._-]+$/;
const UPLOADED = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/site-media\/[A-Za-z0-9._/-]+$/;

/**
 * Where a page image may come from: a photo shipped with the site, or one Fit
 * uploaded to their public site-media storage. Nothing else.
 *
 * This is a safety check, not a formality. next/image throws on any host it
 * has not been configured for, so a stray URL in the database would take the
 * whole page down rather than just show a broken picture. The editor never
 * lets anyone type an address, but the server checks anyway.
 */
export function isAllowedImageSrc(src: string): boolean {
  return !src.includes("..") && (SHIPPED.test(src) || UPLOADED.test(src));
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const REQUIRED = "This cannot be empty.";
const tooLong = (n: number) => `Keep this under ${n.toLocaleString()} characters.`;

export function schemaFor(f: Field): z.ZodType {
  switch (f.kind) {
    case "text": {
      const max = f.max ?? 160;
      const s = z.string().trim().max(max, tooLong(max));
      if (f.format === "email") return s.email("That does not look like an email address.");
      return f.optional ? s : s.min(1, REQUIRED);
    }
    case "long": {
      const max = f.max ?? 2000;
      const s = z.string().trim().max(max, tooLong(max));
      return f.optional ? s : s.min(1, REQUIRED);
    }
    case "select":
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]], {
        message: "Pick one of the options.",
      });
    case "toggle":
      return z.boolean();
    case "image":
      return z.object({
        src: z.string().refine(isAllowedImageSrc, "That photo could not be used. Please upload it again."),
        alt: z
          .string()
          .trim()
          .min(1, "Describe the photo in a few words, for people using screen readers.")
          .max(200, tooLong(200)),
      });
    case "lines": {
      const max = f.itemMax ?? 400;
      return z
        .array(z.string().trim().min(1).max(max, tooLong(max)))
        .min(1, "Add at least one line.")
        .max(f.maxItems ?? 30, `Keep it to ${f.maxItems ?? 30} lines or fewer.`);
    }
    case "items":
      return z
        .array(
          z.object(Object.fromEntries(Object.entries(f.fields).map(([k, sf]) => [k, schemaFor(sf)]))),
        )
        .min(f.minItems ?? 1, `Keep at least ${f.minItems ?? 1}.`)
        .max(f.maxItems ?? 20, `Keep it to ${f.maxItems ?? 20} or fewer.`);
  }
}

/** A fresh, mutable copy of every default on a page. */
export function defaultsOf<F extends Record<string, Field>>(page: PageDef<F>): PageCopy<PageDef<F>> {
  return Object.fromEntries(
    Object.entries(page.fields).map(([k, f]) => [k, structuredClone(f.default)]),
  ) as PageCopy<PageDef<F>>;
}

// ---------------------------------------------------------------------------
// Forms
//
// Shared by the portal editor (which names its inputs) and the save action
// (which reads them back), so the two can never disagree about a name.
// ---------------------------------------------------------------------------

export const countName = (field: string) => `${field}__count`;
/** An image field posts its current source, its description, and maybe a new file. */
export const imageNames = (field: string) => ({
  src: `${field}__src`,
  alt: `${field}__alt`,
  file: `${field}__file`,
});
export const itemName = (field: string, i: number, sub: string) => `${field}__${i}__${sub}`;

type FormLike = { get(name: string): FormDataEntryValue | null };
const str = (fd: FormLike, name: string) => String(fd.get(name) ?? "");

/** Read one field's value back out of a submitted form. */
export function readField(f: Field, name: string, fd: FormLike): unknown {
  switch (f.kind) {
    case "text":
    case "long":
    case "select":
      return str(fd, name);
    case "toggle":
      return fd.get(name) === "on";
    case "image": {
      // Only the current source and description. A newly chosen file is
      // handled by the save action, which uploads it and swaps in the result.
      const n = imageNames(name);
      return { src: str(fd, n.src), alt: str(fd, n.alt).trim() };
    }
    case "lines":
      return str(fd, name)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    case "items": {
      const count = Math.min(Number(fd.get(countName(name)) ?? 0) || 0, 50);
      const rows: Record<string, string>[] = [];
      for (let i = 0; i < count; i++) {
        const row = Object.fromEntries(
          Object.keys(f.fields).map((sub) => [sub, str(fd, itemName(name, i, sub)).trim()]),
        );
        // A row whose words are all cleared is a removal, not an error. Only
        // text counts: a dropdown always has a value.
        const hasWords = Object.entries(f.fields).some(([sub, sf]) => sf.kind !== "select" && row[sub]);
        if (hasWords) rows.push(row);
      }
      return rows;
    }
  }
}

/** Map a validation error back to the input it belongs to. */
export function errorName(field: string, path: readonly PropertyKey[]): string {
  if (typeof path[0] === "number" && typeof path[1] === "string") {
    return itemName(field, path[0], path[1]);
  }
  // An image's description error belongs under its description input.
  if (path[0] === "alt") return imageNames(field).alt;
  return field;
}
