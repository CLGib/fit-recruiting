import type { Metadata } from "next";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import ResumeReviewerTool from "@/components/admin/tools/resume-reviewer-tool";
import { requireAdmin } from "@/lib/auth/guard";
import { isAiConfigured } from "@/lib/ai/config";
import { isBullhornConfigured } from "@/lib/bullhorn/config";

export const metadata: Metadata = { title: "Résumé reviewer" };
export const dynamic = "force-dynamic";

export default async function ResumeReviewerPage() {
  await requireAdmin();

  return (
    <PortalPage>
      <PageHeader
        eyebrow="API-friendly tools"
        title="Résumé reviewer."
        intro={
          <>
            Upload a résumé and get a summary of the person, plus a read against the roles on your job board.
            {isBullhornConfigured()
              ? " The roles come straight from Bullhorn."
              : " Once Bullhorn is connected, the roles come straight from there."}{" "}
            Nothing is saved.
          </>
        }
      />
      {isAiConfigured() ? (
        <ResumeReviewerTool />
      ) : (
        <p className="text-body">This tool is switched off until an Anthropic API key is set on this deployment.</p>
      )}
    </PortalPage>
  );
}
