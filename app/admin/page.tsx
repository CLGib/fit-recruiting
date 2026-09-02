import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { Container, Section } from "@/components/ui";
import { isAllowedEmail } from "@/lib/auth/access";
import { RESUME_BUCKET, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/auth-client";
import { isAdminPreview, PREVIEW_ROWS } from "@/lib/admin/preview";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Submissions",
  robots: { index: false, follow: false },
};

// Candidate data must never be cached or statically rendered.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
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

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminPage() {
  // Local design preview. Unreachable in any deployed build: see lib/admin/preview.
  const preview = isAdminPreview();

  let rows: Row[] = [];
  let error: { message: string } | null = null;
  let signedInAs = "preview mode";
  const links = new Map<string, string>();

  if (preview) {
    rows = PREVIEW_ROWS as Row[];
  } else {
    // Two gates: a valid session, and an allowlisted address. A session alone is
    // not enough, since anyone can request a magic link for their own address.
    const user = await getSessionUser();
    if (!user) redirect("/admin/login");
    if (!isAllowedEmail(user.email)) redirect("/admin/login?error=denied");
    signedInAs = user.email ?? "unknown";

    if (!isSupabaseConfigured()) {
      return (
        <Section className="pt-14">
          <Container>
            <p className="text-body">Supabase is not configured.</p>
          </Container>
        </Section>
      );
    }

    const supabase = createSupabaseAdminClient();
    const res = await supabase
      .from("candidate_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    rows = (res.data ?? []) as Row[];
    error = res.error;

    // Signed URLs are generated per request and expire, so a résumé link
    // cannot be forwarded or bookmarked into a permanent public URL.
    await Promise.all(
      rows
        .filter((r) => r.resume_path)
        .map(async (r) => {
          const { data: signed } = await supabase.storage
            .from(RESUME_BUCKET)
            .createSignedUrl(r.resume_path!, 60 * 10);
          if (signed?.signedUrl) links.set(r.id, signed.signedUrl);
        }),
    );
  }

  return (
    <Section className="pt-12 lg:pt-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-4">Fit Recruiting</p>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-light leading-tight tracking-tight text-navy">
              Résumé submissions
            </h1>
            <p className="mt-4 text-body">
              {rows.length} {rows.length === 1 ? "submission" : "submissions"}, newest first.
              Signed in as {signedInAs}.
            </p>
          </div>
          <form action={signOut} hidden={preview}>
            <button
              type="submit"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-canvas"
            >
              Sign out
            </button>
          </form>
        </div>

        {preview && (
          <p
            role="status"
            className="mt-8 rounded-2xl border border-dashed border-line bg-canvas-warm/60 px-6 py-5 text-[0.9375rem] leading-relaxed text-body"
          >
            <span className="font-semibold text-navy">Design preview.</span> These
            are invented sample records, not real submissions, and this mode only
            runs locally. Résumé links are inert here.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-8 rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-6 py-5 text-[#8c3225]">
            Could not load submissions: {error.message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-dashed border-line bg-canvas-warm/40 px-8 py-20 text-center">
            <p className="font-display text-3xl font-light text-navy">No submissions yet.</p>
            <p className="mx-auto mt-4 max-w-md text-body">
              Applications from the website will appear here as they come in.
            </p>
          </div>
        ) : (
          <ul className="mt-12 space-y-4">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-[1.75rem] border border-line-soft bg-canvas-warm/50 p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.5rem] font-normal leading-tight text-navy">
                      {r.first_name} {r.last_name}
                    </h2>
                    <p className="mt-1.5 text-sm text-body">
                      {when(r.created_at)}
                      {r.role_slug ? ` · applied for ${r.role_slug}` : " · general submission"}
                    </p>
                  </div>
                  <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-xs font-medium text-navy-700">
                    {r.status}
                  </span>
                </div>

                <dl className="mt-5 grid gap-x-8 gap-y-2 text-[0.9375rem] sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="text-body">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${r.email}`}
                        className="text-navy underline underline-offset-4 hover:text-gold-deep"
                      >
                        {r.email}
                      </a>
                    </dd>
                  </div>
                  {r.phone && (
                    <div className="flex gap-2">
                      <dt className="text-body">Phone</dt>
                      <dd>
                        <a
                          href={`tel:${r.phone}`}
                          className="text-navy underline underline-offset-4 hover:text-gold-deep"
                        >
                          {r.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                {r.message && (
                  <p className="mt-5 whitespace-pre-line border-l-2 border-gold pl-4 leading-relaxed text-body">
                    {r.message}
                  </p>
                )}

                <div className="mt-6">
                  {links.has(r.id) ? (
                    <a
                      href={links.get(r.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-canvas transition-all hover:bg-navy-700"
                    >
                      Open résumé
                      <span className="sr-only">
                        {" "}
                        for {r.first_name} {r.last_name}, opens in a new tab
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 3v13M7 12l5 5 5-5M4 21h16" />
                      </svg>
                    </a>
                  ) : preview && r.resume_path ? (
                    <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-body">
                      Open résumé (inert in preview)
                    </span>
                  ) : (
                    <p className="text-sm text-body">No résumé file on this record.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
