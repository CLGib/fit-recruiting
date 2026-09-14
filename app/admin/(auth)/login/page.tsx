import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin-login-form";
import { isPinEnabled } from "@/lib/auth/pin";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sign in",
  // Never index or follow anything under /admin.
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Section className="pt-14 lg:pt-20">
      <Container>
        <div className="mx-auto max-w-md">
          <p className="eyebrow mb-5">Fit Recruiting</p>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-light leading-tight tracking-tight text-navy">
            Team sign in.
          </h1>
          <p className="mt-5 leading-relaxed text-body">
            For Fit staff. Candidates do not need an account.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-[#e0b4ab] bg-[#fbeeeb] px-5 py-4 text-[0.9375rem] leading-relaxed text-[#8c3225]"
            >
              {error === "denied"
                ? "That link is not valid for this account. Ask Chambliss to add your address."
                : "That sign-in link was incomplete. Please request a new one."}
            </p>
          )}

          <div className="mt-9">
            <AdminLoginForm pinEnabled={isPinEnabled()} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
