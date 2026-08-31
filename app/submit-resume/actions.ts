"use server";

import { RESUME_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
]);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitResume(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // Honeypot — bots fill hidden fields, humans don't.
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
    errors.resume = "That file is larger than 5 MB. Please attach a smaller copy.";
  } else if (!ALLOWED.has(file.type)) {
    errors.resume = "Please attach a PDF, DOC, or DOCX file.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Fail loudly and honestly rather than pretending the submission landed.
    return {
      status: "error",
      message:
        "Our résumé intake isn't available right now. Please email your résumé to jobs@fitrecruiting.com or call 251.300.3584 and we'll make sure it gets to the right person.",
    };
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
      // Don't leave an orphan row pointing at a file that isn't there.
      await supabase.from("candidate_submissions").delete().eq("id", row.id);
      throw uploadError;
    }

    await supabase
      .from("candidate_submissions")
      .update({ resume_path: path, resume_filename: resume.name })
      .eq("id", row.id);

    return {
      status: "success",
      message:
        "Thank you. Your résumé is in, a real person here in Mobile will read it, and we'll reach out when something fits.",
    };
  } catch (error) {
    console.error("[submitResume] failed:", error);
    return {
      status: "error",
      message:
        "Something went wrong on our end. Please email jobs@fitrecruiting.com or call 251.300.3584 and we'll take it from there.",
    };
  }
}
