import type { Metadata } from "next";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import JobDescriptionTool from "@/components/admin/tools/job-description-tool";
import { requireAdmin } from "@/lib/auth/guard";
import { isAiConfigured } from "@/lib/ai/config";

export const metadata: Metadata = { title: "Job description writer" };
export const dynamic = "force-dynamic";

export default async function JobDescriptionPage() {
  await requireAdmin();

  return (
    <PortalPage>
      <PageHeader
        eyebrow="API-friendly tools"
        title="Job description writer."
        intro={
          <>
            Type what you know about a role and get a draft posting to copy into Bullhorn. Nothing is saved
            or posted from here.
          </>
        }
      />
      {isAiConfigured() ? (
        <JobDescriptionTool />
      ) : (
        <p className="text-body">This tool is switched off until an Anthropic API key is set on this deployment.</p>
      )}
    </PortalPage>
  );
}
