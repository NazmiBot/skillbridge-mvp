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

interface FollowUpEmailProps {
  targetRole: string;
  currentRole: string;
  insiderTip: string;
  interviewUrl: string;
}

export default function FollowUpEmail({
  targetRole = "HR Specialist",
  currentRole = "Teacher",
  insiderTip = "Most career changers undersell their people skills. Interviewers want to hear how you handled real situations — not just that you're a 'people person.'",
  interviewUrl = "https://tryskillbridge.com",
}: FollowUpEmailProps) {
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
          u + .email-body .tip-card { background-color: #18181b !important; }
        `}</style>
      </Head>
      <Preview>
        The #1 thing {targetRole} interviewers look for (that most candidates miss)
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
              You mapped your path to{" "}
              <span style={{ color: "#60a5fa" }}>{targetRole}</span>.
            </Heading>
            <Text style={subtitle}>
              Now let&apos;s make sure you can talk about it in an interview.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Insider Tip */}
          <Section style={tipCard}>
            <Text style={tipLabel}>💡 INSIDER TIP</Text>
            <Text style={tipText}>{insiderTip}</Text>
            <Text style={tipAttribution}>
              Based on real {currentRole} → {targetRole} transitions
            </Text>
          </Section>

          {/* The pitch */}
          <Section style={bodySection}>
            <Text style={bodyText}>
              Your roadmap covers <em>what</em> to learn. But interviews test
              <em> how you think</em> — and that&apos;s a different skill entirely.
            </Text>
            <Text style={bodyText}>
              Our mock interview simulates the real thing: questions tailored
              to your target role, a structured evaluation of your answers, and
              a personalized report showing exactly where you&apos;d trip up.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={interviewUrl} style={button}>
              Take Your Mock Interview — $9
            </Link>
            <Text style={ctaSubtext}>
              15 min • AI-evaluated • Shareable results
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              SkillBridge — Career roadmaps for real people.
            </Text>
            <Text style={footerMuted}>
              You received this because you created a career roadmap on{" "}
              <Link href="https://tryskillbridge.com" style={footerLink}>
                tryskillbridge.com
              </Link>
              . We&apos;ll only email you this once.
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

const tipCard = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #854d0e",
  padding: "24px",
  marginBottom: "24px",
  // Prevent email client dark mode from inverting this card
  color: "#fef3c7",
};

const tipLabel = {
  color: "#fbbf24",
  fontSize: "11px",
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 12px",
};

const tipText = {
  color: "#fef3c7",
  fontSize: "16px",
  lineHeight: "1.6",
  fontStyle: "italic" as const,
  margin: "0 0 12px",
};

const tipAttribution = {
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
  padding: "8px 0 24px",
};

const button = {
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
