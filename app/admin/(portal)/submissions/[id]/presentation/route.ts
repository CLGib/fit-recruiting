import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getPresentation, getSubmission } from "@/lib/admin/submissions";
import { isAdminPreview, PREVIEW_PRESENTATION, PREVIEW_ROWS } from "@/lib/admin/preview";
import { PresentationResumeSchema } from "@/lib/ai/resume-presentation-schema";
import { renderPresentationResume } from "@/lib/pdf/presentation-resume";

// Renders on demand and is never cached: it contains a named person's history.
export const dynamic = "force-dynamic";
// PDF rendering plus font fetching, so give it more than the default.
export const maxDuration = 60;

function fileName(name: string) {
  const safe = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safe || "candidate"}-Fit-Recruiting.pdf`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // A route handler is its own entry point. The portal layout does not run for
  // it, so the guard has to be here.
  await requireAdmin();

  const { id } = await params;
  const preview = isAdminPreview();

  // The preview walks the same path, including the real PDF render, so what a
  // recruiter sees in a demo is the document they would actually send.
  const [submission, content, preparedBy] = preview
    ? [
        PREVIEW_ROWS.find((r) => r.id === id) ?? null,
        id === "sample-1" ? PREVIEW_PRESENTATION : null,
        "preview mode",
      ]
    : await (async () => {
        const [sub, stored] = await Promise.all([getSubmission(id), getPresentation(id)]);
        return [sub, stored?.content ?? null, stored?.created_by ?? "Fit Recruiting"] as const;
      })();

  if (!submission || !content) {
    return new NextResponse("Not found", { status: 404 });
  }

  const parsed = PresentationResumeSchema.safeParse(content);
  if (!parsed.success) {
    return new NextResponse("The saved copy could not be read. Prepare it again.", {
      status: 409,
    });
  }

  // Contact details are withheld unless the recruiter explicitly asks for them.
  const redactContact =
    new URL(request.url).searchParams.get("contact") !== "include";

  const pdf = await renderPresentationResume(parsed.data, {
    redactContact,
    preparedBy,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName(parsed.data.full_name)}"`,
      // Never let a proxy or the browser hold on to a candidate's résumé.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
