"use server";

import { isAiConfigured } from "@/lib/ai/config";
import type { ResumeAudit } from "@/lib/ai/resume-audit-schema";

export type AuditState = {
  status: "idle" | "success" | "error";
  message?: string;
  audit?: ResumeAudit;
};

/**
 * 4 MB, matching the apply form. Vercel rejects request bodies over 4.5 MB at
 * the platform level before this action runs, so this leaves room for multipart
 * overhead and keeps the failure inside our own friendly validation.
 *
 * NOT exported: a "use server" file may only export async functions.
 * The client component mirrors this value.
 */
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * What someone sees when they hit a ceiling.
 *
 * Never says "rate limited". A candidate who has read their review three times
 * is not doing anything wrong, and the useful thing to tell them is that a
 * person here will read it if they want more.
 */
const LIMIT_MESSAGE: Record<"per_ip" | "per_day" | "unavailable", string> = {
  per_ip:
    "You have had a few reviews today already. Come back tomorrow, or send your résumé to jobs@fitrecruiting.com and someone here in Mobile will read it properly.",
  per_day:
    "The review tool has been busy today and has reached its limit. Try again tomorrow, or send your résumé to jobs@fitrecruiting.com.",
  unavailable:
    "The review tool is not available right now. Send your résumé to jobs@fitrecruiting.com and someone here will read it.",
};

/**
 * Review a résumé for the person who wrote it.
 *
 * Deliberately stores NOTHING. This is a stranger handing over a document with
 * their address and work history on it to get feedback, not an application. We
 * read it in memory, answer, and forget it. Anyone who wants Fit to keep their
 * résumé can use the apply form, which says plainly that it does.
 */
export async function auditResume(
  _prev: AuditState,
  formData: FormData,
): Promise<AuditState> {
  if (formData.get("company_website")) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please attach your résumé." };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "That file is larger than 4 MB. Please attach a smaller copy." };
  }
  if (file.type !== "application/pdf") {
    return {
      status: "error",
      message: "Please save your résumé as a PDF and try again. It is the only format we can read reliably.",
    };
  }
  if (!isAiConfigured()) {
    return {
      status: "error",
      message:
        "The review tool is offline right now. Send your résumé to jobs@fitrecruiting.com and someone here will read it.",
    };
  }

  // Checked after validation so a rejected file does not burn someone's slot,
  // and before the model runs so nothing gets read for free.
  const { claimAuditSlot } = await import("@/lib/ai/audit-limit");
  const slot = await claimAuditSlot();
  if (!slot.allowed) {
    return { status: "error", message: LIMIT_MESSAGE[slot.reason] };
  }

  try {
    const { auditResumePdf } = await import("@/lib/ai/resume-audit");
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const { audit } = await auditResumePdf(base64);
    return { status: "success", audit };
  } catch (err) {
    console.error("[auditResume] failed:", err);
    return {
      status: "error",
      message:
        "We could not read that one. If it is a scan or an image, a text PDF works better. You can also email it to jobs@fitrecruiting.com.",
    };
  }
}
