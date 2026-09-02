/**
 * Local-only preview of the admin dashboard.
 *
 * SAFETY: gated on NODE_ENV === "development", which `next build` and every
 * Vercel deployment set to "production". The branch is therefore unreachable in
 * any deployed build, not merely discouraged. It additionally requires an
 * explicit ADMIN_DEV_PREVIEW=1 opt-in, so it stays off during normal local work.
 *
 * The rows below are invented sample data. This never reads real candidate
 * records, so previewing the layout cannot expose anyone's résumé or PII.
 */

export function isAdminPreview(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_PREVIEW === "1";
}

export type PreviewRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role_slug: string | null;
  message: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  status: string;
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const PREVIEW_ROWS: PreviewRow[] = [
  {
    id: "sample-1",
    created_at: hoursAgo(3),
    first_name: "Sample",
    last_name: "Candidate",
    email: "sample.candidate@example.com",
    phone: "251.555.0142",
    role_slug: "tax-accountant-mobile-al",
    message:
      "I have four years in public accounting and I'm looking to move in-house. Available to start in about three weeks.",
    resume_path: "sample-1/resume.pdf",
    resume_filename: "sample-candidate-resume.pdf",
    status: "new",
  },
  {
    id: "sample-2",
    created_at: hoursAgo(28),
    first_name: "Second",
    last_name: "Example",
    email: "second.example@example.com",
    phone: null,
    role_slug: null,
    message: null,
    resume_path: "sample-2/resume.docx",
    resume_filename: "second-example-resume.docx",
    status: "reviewed",
  },
  {
    id: "sample-3",
    created_at: hoursAgo(76),
    first_name: "Third",
    last_name: "Placeholder",
    email: "third.placeholder@example.com",
    phone: "251.555.0198",
    role_slug: "legal-assistant-mobile-al",
    message:
      "Six years as a legal assistant, currently in Baldwin County and happy to commute to Mobile.",
    resume_path: null,
    resume_filename: null,
    status: "contacted",
  },
];
