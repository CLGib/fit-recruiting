/**
 * Run with:  npm test
 *
 * Guards the two things that would break the editor quietly rather than
 * loudly: a field that no section shows (so it can never be edited), and a
 * default that fails its own validation (so the first save of an untouched
 * section would be rejected for text Fit never wrote).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Field } from "./fields.ts";
import { schemaFor } from "./fields.ts";
import { PAGE_KEYS, PAGES } from "./index.ts";

test("every field appears in exactly one section", () => {
  for (const key of PAGE_KEYS) {
    const page = PAGES[key];
    const shown = page.sections.flatMap((s) => [...s.keys] as string[]);
    const dupes = shown.filter((k, i) => shown.indexOf(k) !== i);
    assert.deepEqual(dupes, [], `${key}: shown in more than one section: ${dupes.join(", ")}`);
    const missing = Object.keys(page.fields).filter((k) => !shown.includes(k));
    assert.deepEqual(missing, [], `${key}: never shown in the editor: ${missing.join(", ")}`);
    const unknown = shown.filter((k) => !(k in page.fields));
    assert.deepEqual(unknown, [], `${key}: section lists a field that does not exist: ${unknown.join(", ")}`);
  }
});

test("every default passes its own validation", () => {
  for (const key of PAGE_KEYS) {
    for (const [name, f] of Object.entries(PAGES[key].fields as Record<string, Field>)) {
      const result = schemaFor(f).safeParse(f.default);
      assert.ok(
        result.success,
        `${key}.${name} default is invalid: ${result.success ? "" : JSON.stringify(result.error.issues)}`,
      );
    }
  }
});

test("field keys are safe to use in a storage key", () => {
  for (const key of PAGE_KEYS) {
    for (const name of Object.keys(PAGES[key].fields)) {
      assert.match(name, /^[A-Za-z][A-Za-z0-9]*$/, `${key}.${name} must be plain letters and digits`);
    }
  }
});

test("defaults follow Fit's copy rules", () => {
  // Only the rules that are really about words. "No 48-hour guarantee" is not
  // one of them: it forbids PROMISING clients candidates within 48 hours, and
  // the interview guide legitimately tells candidates to send a thank-you note
  // within 48 hours. A pattern cannot tell a promise from advice, so that rule
  // lives in the list at the top of index.ts and is checked by a person.
  const banned: [RegExp, string][] = [
    [/\bhard\b/i, "the word 'hard'"],
    [/\bdeep\b/i, "the word 'deep'"],
    [/—/, "an em dash"],
  ];
  for (const key of PAGE_KEYS) {
    for (const [name, f] of Object.entries(PAGES[key].fields as Record<string, Field>)) {
      const text = JSON.stringify(f.default);
      for (const [pattern, what] of banned) {
        assert.ok(!pattern.test(text), `${key}.${name} contains ${what}`);
      }
    }
  }
});
