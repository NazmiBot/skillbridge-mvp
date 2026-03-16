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

interface NudgeEmailProps {
  targetRole: string;
  overallPercent: number;
  currentPhase: number;
  nextSkill: string;
  roadmapUrl: string;
  unsubscribeUrl: string;
}

export default function NudgeEmail({
  targetRole = "Staff Engineer",
  overallPercent = 35,
  currentPhase = 2,
  nextSkill = "System Design",
  roadmapUrl = "https://tryskillbridge.com/r/abc123",
  unsubscribeUrl = "https://tryskillbridge.com/r/abc123?unsubscribe=true",
}: NudgeEmailProps) {
  const phaseNames: Record<number, string> = { 1: "Foundation", 2: "Execution", 3: "Authority" };
  const phaseName = phaseNames[currentPhase] || `Phase ${currentPhase}`;

  return (
    <Html>
      <Head />
      <Preview>{`You're ${overallPercent}% through your ${targetRole} roadmap — keep going!`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Skill<span style={{ color: "#60a5fa" }}>Bridge</span>
            </Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>Keep up the momentum! 🔥</Heading>
            <Text style={subtitle}>
              You&apos;re <strong style={{ color: "#34d399" }}>{overallPercent}%</strong> through
              your{" "}
              <strong style={{ color: "#60a5fa" }}>{targetRole}</strong> roadmap.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Progress context */}
          <Section style={card}>
            <Text style={cardLabel}>Currently in</Text>
            <Text style={cardValue}>
              Phase {currentPhase}: {phaseName}
            </Text>

            {nextSkill && (
              <>
                <Text style={{ ...cardLabel, marginTop: "16px" }}>
                  This week, focus on:
                </Text>
                <Text style={nextSkillStyle}>▸ {nextSkill}</Text>
              </>
            )}
          </Section>

          {/* Progress bar visual */}
          <Section style={{ padding: "0 0 8px" }}>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={progressBarBg}>
                    <div
                      style={{
                        ...progressBarFill,
                        width: `${Math.max(overallPercent, 3)}%`,
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <Text style={progressLabel}>{overallPercent}% complete</Text>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, padding: "24px 0" }}>
            <Link href={roadmapUrl} style={button}>
              Continue Your Roadmap →
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              SkillBridge — Career blueprints, engineered.
            </Text>
            <Text style={footerMuted}>
              You&apos;re receiving this because you subscribed to progress nudges.{" "}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
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
  fontSize: "28px",
  fontWeight: "800" as const,
  margin: "0 0 12px",
};

const subtitle = {
  color: "#a1a1aa",
  fontSize: "18px",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const divider = {
  borderColor: "#27272a",
  margin: "24px 0",
};

const card = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "20px",
  marginBottom: "16px",
};

const cardLabel = {
  color: "#71717a",
  fontSize: "11px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const cardValue = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700" as const,
  margin: "0",
};

const nextSkillStyle = {
  color: "#34d399",
  fontSize: "16px",
  fontWeight: "600" as const,
  margin: "0",
};

const progressBarBg = {
  backgroundColor: "#27272a",
  borderRadius: "999px",
  height: "8px",
  overflow: "hidden" as const,
  padding: "0",
};

const progressBarFill = {
  backgroundColor: "#34d399",
  borderRadius: "999px",
  height: "8px",
};

const progressLabel = {
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "8px 0 0",
};

const button = {
  backgroundColor: "#34d399",
  borderRadius: "8px",
  color: "#0a0a0a",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700" as const,
  padding: "12px 32px",
  textDecoration: "none",
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
