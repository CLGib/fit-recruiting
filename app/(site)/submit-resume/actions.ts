"use server";

import { RESUME_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getJob } from "@/lib/jobs/source";
import { getCopy } from "@/lib/site/copy/read";

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

/** The same rule the portal's team editor uses for LinkedIn addresses. */
const LINKEDIN = /^https:\/\/([a-z]+\.)?linkedin\.com\//i;

const FALLBACK =
  "Our online intake isn't available right now. Please email your résumé to jobs@fitrecruiting.com or call 251.300.3584 and we'll make sure it reaches the right person.";

/**
 * People paste "linkedin.com/in/name" as often as the full address, so the
 * scheme is added rather than the entry refused. Plain http is upgraded.
 */
function normalizeLinkedIn(raw: string): string {
  if (!raw) return "";
  if (/^http:\/\//i.test(raw)) return raw.replace(/^http:\/\//i, "https://");
  if (!/^https:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

/** Where the portal lives, built the same way app/layout.tsx builds its base URL. */
function siteBase(): string {
  const base =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return base.replace(/\/+$/, "");
}

type Alert = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  roleSlug: string;
  message: string;
  resume: File;
};

/**
 * The résumé alert, laid out the way Fit already receives résumés from their
 * current site (Chambliss's example, 2026-09-10): the candidate's details as a
 * plain list, the résumé attached, and Reply going to the candidate. Added on
 * top: the role's title and a link straight to the record in the portal.
 *
 * Storage is the source of truth; this exists so a submission does not sit
 * unseen. A silent no-op without RESEND_API_KEY, and never fails the
 * submission, because the résumé is already safely stored by this point.
 */
async function notify(a: Alert) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    // The candidate's name goes into the sender and subject, both email
    // headers. Anything that could break out of a header, or out of the quoted
    // display name, is stripped first.
    const name =
      `${a.firstName} ${a.lastName}`.replace(/["<>,\\\r\n]/g, " ").replace(/\s+/g, " ").trim() ||
      "Candidate";

    // APPLY_FROM_EMAIL may be a bare address or "Name <address>"; only the
    // address is used, so every alert shows who the résumé is from.
    const fromEnv = process.env.APPLY_FROM_EMAIL ?? "apply@fitrecruiting.com";
    const address = (/<([^>]+)>/.exec(fromEnv)?.[1] ?? fromEnv).trim();

    let role = "General submission";
    if (a.roleSlug) {
      try {
        role = (await getJob(a.roleSlug))?.title ?? a.roleSlug;
      } catch {
        role = a.roleSlug;
      }
    }

    const base = siteBase();
    const text = [
      `From: ${name} <${a.email}>`,
      `Applying for: ${role}`,
      `Cell phone: ${a.phone || "Not given"}`,
      `LinkedIn: ${a.linkedin || "Not given"}`,
      "",
      "Message:",
      a.message || "No message.",
      "",
      `View in the Fit portal: ${base}/admin/submissions/${a.id}`,
      "",
      "--",
      `This email was sent from the résumé form on Fit Recruiting (${base})`,
    ].join("\n");

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    // send() reports a rejected email in `error` rather than throwing, so it
    // has to be checked, or an alert refused for an unverified sender would
    // vanish without a trace, even in the logs.
    const { error } = await resend.emails.send({
      from: `"${name} via Fit Recruiting" <${address}>`,
      to: [process.env.APPLY_TO_EMAIL ?? "jobs@fitrecruiting.com"],
      replyTo: a.email,
      subject: `Resume from website: ${name}`,
      text,
      attachments: [
        { filename: a.resume.name, content: Buffer.from(await a.resume.arrayBuffer()) },
      ],
    });
    if (error) {
      console.error("[submitResume] alert rejected by Resend (submission was saved):", error);
    }
  } catch (err) {
    console.error("[submitResume] alert failed (submission was saved):", err);
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
  const linkedin = normalizeLinkedIn(String(formData.get("linkedin") ?? "").trim());
  const role = String(formData.get("role") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const file = formData.get("resume");

  const errors: Record<string, string> = {};

  if (!firstName) errors.firstName = "Please enter your first name.";
  if (!lastName) errors.lastName = "Please enter your last name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(email)) errors.email = "That doesn't look like a valid email address.";
  if (linkedin && (!LINKEDIN.test(linkedin) || linkedin.length > 300)) {
    errors.linkedin = "Paste your LinkedIn profile address, like linkedin.com/in/yourname.";
  }
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
        // Needs supabase/009-candidate-linkedin.sql. Without that column this
        // insert fails and every submission falls back to the error message.
        linkedin: linkedin || null,
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

    await notify({
      id: row.id,
      firstName,
      lastName,
      email,
      phone,
      linkedin,
      roleSlug: role,
      message,
      resume,
    });

    // Read after the résumé is safely stored, and never throws: if Fit's
    // edited message cannot be loaded, the built-in one is shown instead.
    const { submit } = await getCopy();
    return { status: "success", message: submit.success };
  } catch (err) {
    // Log for us, stay useful for them. A dropped application is a lost
    // candidate, so this must never fail silently.
    console.error("[submitResume] failed:", err);
    return { status: "error", message: FALLBACK };
  }
}
