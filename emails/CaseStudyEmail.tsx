import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CaseStudyEmailProps {
  targetRole: string;
  currentRole: string;
  caseStudy: string;
  interviewUrl: string;
  blueprintUrl: string;
}

export default function CaseStudyEmail({
  targetRole = "Staff Engineer",
  currentRole = "Developer",
  caseStudy = "One engineer went from Mid-level to Staff in 11 months by focusing on exactly three skills: system design documentation, cross-team influence, and technical mentorship.",
  interviewUrl = "https://tryskillbridge.com",
  blueprintUrl = "https://tryskillbridge.com",
}: CaseStudyEmailProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style>{`
          :root { color-scheme: dark; }
          @media (prefers-color-scheme: dark) {
            .email-body, .email-body * { color-scheme: dark !important; }
          }
        `}</style>
      </Head>
      <Preview>
        How someone went from {currentRole} to {targetRole} (real breakdown)
      </Preview>
      <Body style={main} className="email-body">
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Skill<span style={{ color: "#60a5fa" }}>Bridge</span>
            </Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>
              How someone actually made the jump to{" "}
              <span style={{ color: "#60a5fa" }}>{targetRole}</span>
            </Heading>
            <Text style={subtitle}>
              A real pattern we&apos;ve seen from career roadmap data.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Case Study Card */}
          <Section style={caseCard}>
            <Text style={caseLabel}>📊 FROM THE DATA</Text>
            <Text style={caseText}>{caseStudy}</Text>
            <Text style={caseAttribution}>
              Pattern from {currentRole} → {targetRole} roadmaps
            </Text>
          </Section>

          {/* Insight */}
          <Section style={bodySection}>
            <Text style={bodyText}>
              The common thread in every successful career transition we&apos;ve
              analyzed? <strong style={{ color: "#ffffff" }}>Specificity.</strong>
            </Text>
            <Text style={bodyText}>
              People who close 3 targeted skill gaps grow faster than people who
              try to learn everything. Your blueprint already identified the gaps
              — the question is whether you&apos;re ready to prove you&apos;ve closed them.
            </Text>
            <Text style={bodyText}>
              That&apos;s where mock interviews come in. They&apos;re not practice —
              they&apos;re <em>evidence</em>. Evidence that your new skills hold up
              under pressure.
            </Text>
          </Section>

          {/* Dual CTA */}
          <Section style={ctaSection}>
            <Link href={interviewUrl} style={buttonPrimary}>
              Test Your Readiness — $9
            </Link>
            <Text style={ctaSubtext}>
              15 min • Role-specific questions • Detailed evaluation
            </Text>
          </Section>

          <Section style={ctaSectionSecondary}>
            <Link href={blueprintUrl} style={buttonSecondary}>
              Revisit Your Blueprint →
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              SkillBridge — Career blueprints, engineered.
            </Text>
            <Text style={footerMuted}>
              You received this because you created a career blueprint on{" "}
              <Link href="https://tryskillbridge.com" style={footerLink}>
                tryskillbridge.com
              </Link>
              . This is the last email in this series.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ────────────────────────────────────────────────

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 20px",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "24px",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#ffffff",
  margin: "0",
};

const heroSection = {
  textAlign: "center" as const,
  padding: "0 0 8px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800" as const,
  lineHeight: "1.3",
  margin: "0 0 12px",
};

const subtitle = {
  color: "#a1a1aa",
  fontSize: "16px",
  margin: "0",
};

const divider = {
  borderColor: "#27272a",
  margin: "24px 0",
};

const caseCard = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #1e3a5f",
  padding: "24px",
  marginBottom: "24px",
};

const caseLabel = {
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 12px",
};

const caseText = {
  color: "#e0f2fe",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const caseAttribution = {
  color: "#71717a",
  fontSize: "12px",
  margin: "0",
};

const bodySection = {
  padding: "0 0 8px",
};

const bodyText = {
  color: "#d4d4d8",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "8px 0 0",
};

const buttonPrimary = {
  backgroundColor: "#7c3aed",
  borderRadius: "10px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "700" as const,
  padding: "14px 36px",
  textDecoration: "none",
};

const ctaSubtext = {
  color: "#71717a",
  fontSize: "13px",
  margin: "12px 0 0",
};

const ctaSectionSecondary = {
  textAlign: "center" as const,
  padding: "16px 0 24px",
};

const buttonSecondary = {
  color: "#60a5fa",
  fontSize: "14px",
  textDecoration: "underline",
};

const footer = {
  textAlign: "center" as const,
  padding: "8px 0 0",
};

const footerText = {
  color: "#52525b",
  fontSize: "13px",
  margin: "0 0 4px",
};

const footerMuted = {
  color: "#3f3f46",
  fontSize: "11px",
  margin: "0",
};

const footerLink = {
  color: "#3f3f46",
  textDecoration: "underline",
};
