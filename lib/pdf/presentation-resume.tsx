import "server-only";

import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { PresentationResume } from "@/lib/ai/resume-presentation-schema";
import { registerBrandFonts } from "./fonts";

const NAVY = "#17314f";
const GOLD = "#ad7900";
const BODY = "#555f6b";
const LINE = "#dfd6c6";

function logoDataUri(): string | null {
  try {
    const file = path.join(process.cwd(), "public", "brand", "fit-lockup.png");
    return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
  } catch {
    return null;
  }
}

function styles(brandFonts: boolean) {
  const display = brandFonts ? "Cormorant" : "Helvetica";
  const body = brandFonts ? "Inter" : "Helvetica";

  return StyleSheet.create({
    page: {
      paddingTop: 44,
      paddingBottom: 62,
      paddingHorizontal: 52,
      fontFamily: body,
      fontSize: 9.5,
      lineHeight: 1.5,
      color: BODY,
    },
    letterhead: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: LINE,
      paddingBottom: 12,
      marginBottom: 22,
    },
    logo: { height: 22 },
    letterheadText: { fontSize: 7.5, color: BODY, textAlign: "right" },
    // Explicit lineHeight is not optional on the display face. With a
    // registered font and only the page-level multiplier, the heading box
    // collapses and the next line prints on top of the name.
    name: { fontFamily: display, fontSize: 27, lineHeight: 1.2, color: NAVY, marginBottom: 3 },
    headline: { fontFamily: display, fontSize: 12.5, lineHeight: 1.3, color: GOLD, marginBottom: 6 },
    contact: { fontSize: 8.5, color: BODY, marginBottom: 16 },
    summary: { fontSize: 10, color: NAVY, lineHeight: 1.6, marginBottom: 18 },
    sectionTitle: {
      fontFamily: body,
      fontWeight: 600,
      fontSize: 7.5,
      letterSpacing: 1.6,
      color: NAVY,
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: LINE,
      paddingBottom: 4,
      marginBottom: 9,
      marginTop: 4,
    },
    // A role must not be split across pages with its heading orphaned.
    role: { marginBottom: 11 },
    roleHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    roleTitle: { fontFamily: body, fontWeight: 600, fontSize: 10, color: NAVY },
    roleDates: { fontSize: 8.5, color: BODY },
    roleEmployer: { fontSize: 9, color: GOLD, marginBottom: 4 },
    bulletRow: { flexDirection: "row", marginBottom: 2.5 },
    bulletDot: { width: 9, fontSize: 9.5, color: GOLD },
    bulletText: { flex: 1 },
    eduRow: { marginBottom: 7 },
    eduInstitution: { fontFamily: body, fontWeight: 600, fontSize: 9.5, color: NAVY },
    inline: { marginBottom: 3 },
    footer: {
      position: "absolute",
      bottom: 28,
      left: 52,
      right: 52,
      borderTopWidth: 1,
      borderTopColor: LINE,
      paddingTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 7,
      color: BODY,
    },
  });
}

/**
 * A section heading that will not be left alone at the bottom of a page.
 * minPresenceAhead pushes it to the next page unless there is room for some of
 * what follows it.
 */
function SectionHeading({
  children,
  s,
}: {
  children: React.ReactNode;
  s: ReturnType<typeof styles>;
}) {
  return (
    <Text style={s.sectionTitle} minPresenceAhead={56}>
      {children}
    </Text>
  );
}

function Bullets({ items, s }: { items: string[]; s: ReturnType<typeof styles> }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

/**
 * The client-ready copy.
 *
 * `redactContact` defaults on because this document's purpose is to be sent to
 * a hiring manager BEFORE the candidate has agreed to be introduced. Handing
 * over someone's phone number and email at that point gives away a person's
 * contact details without their say-so, and it is not what the candidate
 * uploaded their résumé for. Turn it off once an introduction is agreed.
 */
export async function renderPresentationResume(
  content: PresentationResume,
  opts: { redactContact: boolean; preparedBy: string },
): Promise<Buffer> {
  const brandFonts = await registerBrandFonts();
  const s = styles(brandFonts);
  const logo = logoDataUri();

  const contactLine = opts.redactContact
    ? [content.location].filter(Boolean).join("")
    : [content.location, content.email, content.phone, ...content.links]
        .filter(Boolean)
        .join("   ·   ");

  return renderToBuffer(
    <Document
      title={`${content.full_name} — presented by Fit Recruiting`}
      author="Fit Recruiting"
      creator="Fit Recruiting"
      producer="Fit Recruiting"
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.letterhead} fixed>
          {logo ? (
            // Not an HTML img: this is @react-pdf/renderer's Image, which takes
            // no alt. The lockup is decorative here — the letterhead beside it
            // already says Fit Recruiting in text.
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logo} style={s.logo} />
          ) : (
            <Text style={s.roleTitle}>Fit Recruiting</Text>
          )}
          <Text style={s.letterheadText}>
            Presented by Fit Recruiting{"\n"}
            Mobile, Alabama · 251.300.3584
          </Text>
        </View>

        <Text style={s.name}>{content.full_name}</Text>
        {content.headline && <Text style={s.headline}>{content.headline}</Text>}
        {contactLine && <Text style={s.contact}>{contactLine}</Text>}
        {opts.redactContact && (
          <Text style={s.contact}>
            Contact details available through Fit Recruiting.
          </Text>
        )}

        {content.summary && <Text style={s.summary}>{content.summary}</Text>}

        {content.experience.length > 0 && (
          <>
            <SectionHeading s={s}>Experience</SectionHeading>
            {content.experience.map((role, i) => (
              <View key={i} style={s.role} wrap={false}>
                <View style={s.roleHead}>
                  <Text style={s.roleTitle}>{role.title}</Text>
                  {(role.start || role.end) && (
                    <Text style={s.roleDates}>
                      {[role.start, role.end].filter(Boolean).join(" – ")}
                    </Text>
                  )}
                </View>
                <Text style={s.roleEmployer}>
                  {[role.employer, role.location].filter(Boolean).join(", ")}
                </Text>
                <Bullets items={role.bullets} s={s} />
              </View>
            ))}
          </>
        )}

        {content.education.length > 0 && (
          <>
            <SectionHeading s={s}>Education</SectionHeading>
            {content.education.map((e, i) => (
              <View key={i} style={s.eduRow} wrap={false}>
                <Text style={s.eduInstitution}>{e.institution}</Text>
                <Text>
                  {[e.credential, e.detail, e.year].filter(Boolean).join(" · ")}
                </Text>
              </View>
            ))}
          </>
        )}

        {content.certifications.length > 0 && (
          <>
            <SectionHeading s={s}>Certifications</SectionHeading>
            <Bullets items={content.certifications} s={s} />
          </>
        )}

        {content.skills.length > 0 && (
          <View wrap={false}>
            <SectionHeading s={s}>Skills</SectionHeading>
            <Text style={s.inline}>{content.skills.join("   ·   ")}</Text>
          </View>
        )}

        {content.additional.map((block, i) => (
          <View key={i}>
            <SectionHeading s={s}>{block.heading}</SectionHeading>
            <Bullets items={block.items} s={s} />
          </View>
        ))}

        {/* Said on the document itself, not only in the email it is attached
            to. A hiring manager forwards a PDF; they do not forward context.

            No page numbers, and do not add them with a `render` prop: in
            @react-pdf/renderer 4.9.0, `render` on a Text silently drops the
            whole containing View once custom fonts are registered, so the
            footer vanishes from every page. The candidate's name is the more
            useful thing on a forwarded sheet anyway. */}
        <View style={s.footer} fixed>
          <Text>
            Prepared by Fit Recruiting from the candidate&apos;s own résumé.
            Formatting only; the content is theirs.
          </Text>
          <Text>{content.full_name}</Text>
        </View>
      </Page>
    </Document>,
  );
}
