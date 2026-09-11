import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, PortalPage } from "@/components/admin/page-header";
import TeamMemberForm from "@/components/admin/website/team-forms";
import { requireAdmin } from "@/lib/auth/guard";
import { isAdminPreview } from "@/lib/admin/preview";
import { listTeam } from "@/lib/site/team";
import { initials } from "@/lib/team";
import { moveTeamMember } from "../actions";

export const metadata: Metadata = { title: "Team" };

export const dynamic = "force-dynamic";

function MoveButton({
  id,
  direction,
  disabled,
  name,
}: {
  id: string;
  direction: "up" | "down";
  disabled: boolean;
  name: string;
}) {
  return (
    <form action={moveTeamMember}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={`Move ${name} ${direction}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d={direction === "up" ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}

export default async function TeamAdminPage() {
  await requireAdmin();
  const team = await listTeam({ includeHidden: true });

  return (
    <PortalPage>
      <PageHeader
        eyebrow="Team portal"
        title="Team."
        intro={
          <>
            The people on the Meet the Team page, in the order they appear. Edit
            a bio, swap a headshot, or hide someone without losing their details.
          </>
        }
      />

      {isAdminPreview() && (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
        >
          <span className="font-semibold text-navy">Design preview.</span> You
          can try every field, but nothing is saved.
        </p>
      )}

      <ol className="space-y-4">
        {team.map((m, i) => (
          <li key={m.id} className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/40 p-5 lg:p-6">
            <div className="flex items-center gap-4">
              {m.photo_url ? (
                <Image
                  src={m.photo_url}
                  alt=""
                  width={112}
                  height={140}
                  sizes="56px"
                  className="h-[70px] w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-[70px] w-14 shrink-0 items-center justify-center rounded-xl border border-line-soft bg-canvas font-display text-lg text-navy-700"
                >
                  {initials(m.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-normal leading-tight text-navy">{m.name}</h2>
                <p className="mt-0.5 text-sm text-body">
                  {m.title ?? "No title"}
                  {!m.visible && " · hidden from the website"}
                  {!m.photo_url && " · no photo yet"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <MoveButton id={m.id} direction="up" disabled={i === 0} name={m.name} />
                <MoveButton id={m.id} direction="down" disabled={i === team.length - 1} name={m.name} />
              </div>
            </div>

            {/* Collapsed by default so the list reads as a list. */}
            <details className="group mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-navy underline underline-offset-4 marker:content-none hover:text-gold-deep">
                Edit {m.name}
              </summary>
              <div className="mt-5 border-t border-line pt-5">
                <TeamMemberForm member={m} />
              </div>
            </details>
          </li>
        ))}
      </ol>

      <details className="mt-8 rounded-[1.75rem] border border-dashed border-line p-6">
        <summary className="cursor-pointer font-display text-xl text-navy marker:content-none">
          Add a team member
        </summary>
        <div className="mt-5">
          <TeamMemberForm member={null} />
        </div>
      </details>
    </PortalPage>
  );
}
