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

interface BlueprintEmailProps {
  targetRole: string;
  currentRole: string;
  phases: { title: string; duration: string; skills: string[]; milestone: string }[];
  estimatedTimeline: string;
  shareUrl?: string;
}

export default function BlueprintEmail({
  targetRole = "Staff Engineer",
  currentRole = "Developer",
  phases = [],
  estimatedTimeline = "12–18 months",
  shareUrl,
}: BlueprintEmailProps) {
  const phaseEmoji: Record<string, string> = {
    Foundation: "🧱",
    Execution: "⚡",
    Authority: "👑",
  };

  return (
    <Html>
      <Head />
      <Preview>Your career blueprint: {currentRole} → {targetRole}</Preview>
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
            <Heading style={h1}>Your Career Blueprint</Heading>
            <Text style={subtitle}>
              {currentRole} → <strong style={{ color: "#60a5fa" }}>{targetRole}</strong>
            </Text>
            <Text style={timeline}>
              ⏱ Estimated timeline: <strong>{estimatedTimeline}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Phases */}
          {phases.map((phase, i) => (
            <Section key={i} style={phaseCard}>
              <Text style={phaseHeader}>
                {phaseEmoji[phase.title] || "📍"} Phase {i + 1}: {phase.title}
              </Text>
              <Text style={phaseDuration}>{phase.duration}</Text>

              <Text style={sectionLabel}>Skills to develop:</Text>
              <Text style={skillPills}>
                {phase.skills.map((s) => `▸ ${s}`).join("  •  ")}
              </Text>

              <Text style={milestoneBox}>
                🏁 <strong>Milestone:</strong> {phase.milestone}
              </Text>
            </Section>
          ))}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, padding: "24px 0" }}>
            {shareUrl ? (
              <>
                <Text style={ctaText}>View your full interactive blueprint:</Text>
                <Link href={shareUrl} style={button}>
                  Open Blueprint →
                </Link>
              </>
            ) : (
              <>
                <Text style={ctaText}>Generate more career blueprints:</Text>
                <Link href="https://tryskillbridge.com" style={button}>
                  Visit SkillBridge →
                </Link>
              </>
            )}
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              SkillBridge — Career blueprints, engineered.
            </Text>
            <Text style={footerMuted}>
              You received this because you unlocked a blueprint on{" "}
              <Link href="https://tryskillbridge.com" style={footerLink}>
                tryskillbridge.com
              </Link>
              .
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
};

const timeline = {
  color: "#71717a",
  fontSize: "14px",
  fontFamily: "monospace",
  margin: "0",
};

const divider = {
  borderColor: "#27272a",
  margin: "24px 0",
};

const phaseCard = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "20px",
  marginBottom: "16px",
};

const phaseHeader = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700" as const,
  margin: "0 0 4px",
};

const phaseDuration = {
  color: "#71717a",
  fontSize: "13px",
  fontFamily: "monospace",
  margin: "0 0 16px",
};

const sectionLabel = {
  color: "#71717a",
  fontSize: "11px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 6px",
};

const skillPills = {
  color: "#d4d4d8",
  fontSize: "13px",
  lineHeight: "1.8",
  margin: "0 0 16px",
};

const milestoneBox = {
  color: "#d4d4d8",
  fontSize: "13px",
  backgroundColor: "#0a0a0a",
  borderRadius: "8px",
  padding: "12px",
  border: "1px solid #27272a",
  margin: "0",
};

const ctaText = {
  color: "#a1a1aa",
  fontSize: "14px",
  margin: "0 0 16px",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600" as const,
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
