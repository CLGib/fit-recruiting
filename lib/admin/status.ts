/**
 * Pipeline stages. Shared by server and client, so this module deliberately
 * carries no server-only marker and no database access.
 *
 * These are OUR stages: where a recruiter is in deciding whether to put someone
 * forward. Bullhorn's JobSubmission stages take over once a candidate is
 * formally submitted to a client.
 */

export const STATUSES = [
  "new",
  "reviewing",
  "contacted",
  "submitted",
  "placed",
  "not_a_fit",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  submitted: "Submitted to client",
  placed: "Placed",
  not_a_fit: "Not a fit",
};

/** Stages that still need someone to act. */
export const OPEN_STATUSES: Status[] = ["new", "reviewing", "contacted"];
