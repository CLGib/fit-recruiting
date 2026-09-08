"use server";

import { RESUME_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

/**
 * 4 MB, not 5. Vercel Functions reject request bodies over 4.5 MB at the
 * platform level (413), before this action ever runs, so this leaves room for
 * multipart overhead and keeps the failure inside our own friendly validation.
 *
 * Raising the cap means uploading straight from the browser to Supabase with a
 * signed URL, so the file never crosses a Vercel function. Worth doing if Fit
 * starts seeing large portfolio-style résumés; unnecessary at 4 MB.
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

const FALLBACK =
  "Our online intake isn't available right now. Please email your résumé to jobs@fitrecruiting.com or call 251.300.3584 and we'll make sure it reaches the right person.";

/**
 * Optional notification. Storage is the source of truth; this exists so a
 * submission does not sit unseen in a bucket nobody is watching. Silent no-op
 * when RESEND_API_KEY is absent, and a failure here never fails the submission,
 * because the résumé is already safely stored by this point.
 */
async function notify(summary: string, subject: string, replyTo: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.APPLY_FROM_EMAIL ?? "Fit Recruiting <apply@fitrecruiting.com>",
      to: [process.env.APPLY_TO_EMAIL ?? "jobs@fitrecruiting.com"],
      replyTo,
      subject: subject.replace(/[\r\n]+/g, " ").trim(),
      text: summary,
    });
  } catch (err) {
    console.error("[submitResume] notification failed (submission was saved):", err);
  }
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

  if (!isSupabaseConfigured()) {
    // Fail honestly rather than pretending the submission landed.
    return { status: "error", message: FALLBACK };
  }

  const resume = file as File;
  const extension = ALLOWED.get(resume.type)!;

  try {
    const supabase = createSupabaseAdminClient();

    // Insert first so the row id can namespace the stored file.
    const { data: row, error: insertError } = await supabase
      .from("candidate_submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role_slug: role || null,
        message: message || null,
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !row) throw insertError ?? new Error("Insert returned no row.");

    const path = `${row.id}/resume.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, resume, { contentType: resume.type, upsert: false });

    if (uploadError) {
      // Never leave a row pointing at a file that is not there. A submission
      // with no résumé looks answered but cannot be actioned.
      await supabase.from("candidate_submissions").delete().eq("id", row.id);
      throw uploadError;
    }

    await supabase
      .from("candidate_submissions")
      .update({ resume_path: path, resume_filename: resume.name })
      .eq("id", row.id);

    const name = `${firstName} ${lastName}`;
    await notify(
      [
        `Name:  ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        role ? `Role:  ${role}` : "Role:  General submission (no specific role)",
        "",
        message ? `Message:\n${message}` : "No message provided.",
        "",
        `Résumé stored at ${path} in the "${RESUME_BUCKET}" bucket.`,
        "Open it from the Supabase dashboard under Storage.",
      ]
        .filter(Boolean)
        .join("\n"),
      role ? `Application: ${name} — ${role}` : `Résumé submission: ${name}`,
      email,
    );

    return {
      status: "success",
      message:
        "Thank you. Your résumé is in, a real person here in Mobile will read it, and we'll reach out when something fits.",
    };
  } catch (err) {
    // Log for us, stay useful for them. A dropped application is a lost
    // candidate, so this must never fail silently.
    console.error("[submitResume] failed:", err);
    return { status: "error", message: FALLBACK };
  }
}
