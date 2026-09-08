/**
 * Run with:  node --test lib/ai/audit-limit-rules.test.ts
 *
 * No framework and no config: these are pure functions, and Node runs
 * TypeScript directly.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, pickClientIp } from "./audit-limit-rules.ts";

test("pickClientIp trusts the last x-forwarded-for entry", () => {
  assert.equal(pickClientIp("203.0.113.9", null), "203.0.113.9");
  assert.equal(pickClientIp("1.2.3.4, 203.0.113.9", null), "203.0.113.9");
  assert.equal(pickClientIp("9.9.9.9, 8.8.8.8, 203.0.113.9", null), "203.0.113.9");
});

test("pickClientIp ignores a spoofed leading entry", () => {
  // Someone sending "X-Forwarded-For: 1.1.1.1" gets Vercel's real value
  // appended after theirs, so the last entry is the one that cannot be forged.
  assert.equal(pickClientIp("1.1.1.1, 203.0.113.9", null), "203.0.113.9");
});

test("pickClientIp tolerates whitespace and blanks", () => {
  assert.equal(pickClientIp(" , 203.0.113.9 ", null), "203.0.113.9");
  assert.equal(pickClientIp("   ", "198.51.100.4"), "198.51.100.4");
});

test("pickClientIp falls back, then gives up", () => {
  assert.equal(pickClientIp(null, "198.51.100.4"), "198.51.100.4");
  assert.equal(pickClientIp("", "198.51.100.4"), "198.51.100.4");
  assert.equal(pickClientIp(null, null), "unknown");
});

test("decide allows runs under both ceilings", () => {
  assert.deepEqual(decide(0, 0), { allowed: true });
  assert.deepEqual(decide(2, 99), { allowed: true });
});

test("decide stops one address at its own ceiling", () => {
  assert.deepEqual(decide(3, 0), { allowed: false, reason: "per_ip" });
  assert.deepEqual(decide(9, 0), { allowed: false, reason: "per_ip" });
});

test("decide stops everyone at the daily total", () => {
  assert.deepEqual(decide(0, 100), { allowed: false, reason: "per_day" });
});

test("decide reports the per-address reason when both are hit", () => {
  // The more useful thing to tell the person in front of you.
  assert.deepEqual(decide(3, 100), { allowed: false, reason: "per_ip" });
});
