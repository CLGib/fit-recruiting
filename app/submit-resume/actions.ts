"use server";

import { Resend } from "resend";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

/**
 * 4 MB, not 5. Vercel Functions reject bodies over 4.5 MB at the platform
 * level, so this leaves room for multipart overhead and keeps the failure
 * inside our own friendly validation.
 *
 * NOT exported: a "use server" module may only export async functions.
 * components/resume-form.tsx mirrors this value for the client-side check.
 */
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
]);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Where applications land. Verified sending domain required for `from`. */
const TO = process.env.APPLY_TO_EMAIL ?? "jobs@fitrecruiting.com";
const FROM = process.env.APPLY_FROM_EMAIL ?? "Fit Recruiting <apply@fitrecruiting.com>";

/** Never interpolate raw input into a mail header. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function submitResume(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot. Bots fill hidden fields, humans do not.
  if (formData.get("company_website")) {
    return { status: "success", message: "Thanks, we'll be in touch." };
  }

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const file = formData.get("resume");

  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "Please enter your first name.";
  if (!lastName) errors.lastName = "Please enter your last name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(email)) errors.email = "That doesn't look like a valid email address.";
  if (message.length > 4000) errors.message = "Please keep this under 4,000 characters.";
  if (!consent) errors.consent = "Please confirm before submitting.";

  if (!(file instanceof File) || file.size === 0) {
    errors.resume = "Please attach your résumé.";
  } else if (file.size > MAX_BYTES) {
    errors.resume = "That file is larger than 4 MB. Please attach a smaller copy.";
  } else if (!ALLOWED.has(file.type)) {
    errors.resume = "Please attach a PDF, DOC, or DOCX file.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const fallback =
    "Our online intake isn't available right now. Please email your résumé to jobs@fitrecruiting.com or call 251.300.3584 and we'll make sure it reaches the right person.";

  if (!process.env.RESEND_API_KEY) {
    // Fail honestly rather than pretending the submission landed.
    return { status: "error", message: fallback };
  }

  const resume = file as File;
  const extension = ALLOWED.get(resume.type)!;
  const name = `${firstName} ${lastName}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const lines = [
      `Name:  ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      role ? `Role:  ${role}` : "Role:  General submission (no specific role)",
      "",
      message ? `Message:\n${message}` : "No message provided.",
      "",
      `Résumé attached as ${resume.name} (${Math.round(resume.size / 1024)} KB).`,
      "Submitted via the fitrecruiting.com website.",
    ].filter(Boolean);

    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      // Recruiters can reply straight to the candidate.
      replyTo: email,
      subject: headerSafe(
        role ? `Application: ${name} — ${role}` : `Résumé submission: ${name}`,
      ),
      text: lines.join("\n"),
      attachments: [
        {
          filename: `${firstName}-${lastName}-resume.${extension}`.toLowerCase(),
          content: Buffer.from(await resume.arrayBuffer()),
          contentType: resume.type,
        },
      ],
    });

    if (error) throw new Error(`${error.name}: ${error.message}`);

    return {
      status: "success",
      message:
        "Thank you. Your résumé is in, a real person here in Mobile will read it, and we'll reach out when something fits.",
    };
  } catch (err) {
    // Log for us, stay useful for them. Never swallow this silently: a dropped
    // application is a lost candidate.
    console.error("[submitResume] delivery failed:", err);
    return { status: "error", message: fallback };
  }
}
