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

interface ReportEmailProps {
  targetRole: string;
  currentRole: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  topicsToStudy: string[];
  reportUrl: string;
}

export default function ReportEmail({
  targetRole = "Staff Engineer",
  currentRole = "Developer",
  score = 65,
  summary = "",
  strengths = [],
  weaknesses = [],
  topicsToStudy = [],
  reportUrl = "https://tryskillbridge.com",
}: ReportEmailProps) {
  const scoreLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Strong" : score >= 40 ? "Developing" : "Needs Work";
  const scoreColor =
    score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <Html>
      <Head />
      <Preview>Your SkillBridge Readiness Report: {score}/100 — {currentRole} → {targetRole}</Preview>
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
            <Heading style={h1}>Your Readiness Report</Heading>
            <Text style={subtitle}>
              {currentRole} → <strong style={{ color: "#60a5fa" }}>{targetRole}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Score */}
          <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>
            <Text style={{ ...scoreNumber, color: scoreColor }}>{score}</Text>
            <Text style={scoreLabelStyle}>/ 100 — {scoreLabel}</Text>
            {summary && <Text style={summaryText}>{summary}</Text>}
          </Section>

          <Hr style={divider} />

          {/* Strengths */}
          {strengths.length > 0 && (
            <Section style={card}>
              <Text style={cardHeader}>💪 Strengths</Text>
              {strengths.map((s, i) => (
                <Text key={i} style={listItem}>✓ {s}</Text>
              ))}
            </Section>
          )}

          {/* Areas to Improve */}
          {weaknesses.length > 0 && (
            <Section style={card}>
              <Text style={{ ...cardHeader, color: "#f59e0b" }}>🎯 Areas to Improve</Text>
              {weaknesses.map((w, i) => (
                <Text key={i} style={listItem}>▲ {w}</Text>
              ))}
            </Section>
          )}

          {/* What to Study */}
          {topicsToStudy.length > 0 && (
            <Section style={card}>
              <Text style={{ ...cardHeader, color: "#3b82f6" }}>📘 What to Study Next</Text>
              {topicsToStudy.map((t, i) => (
                <Text key={i} style={listItem}>→ {t}</Text>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, padding: "24px 0" }}>
            <Text style={ctaText}>View your full report with STAR rewrites & learning roadmap:</Text>
            <Link href={reportUrl} style={button}>
              View Full Report →
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>SkillBridge — Career blueprints, engineered.</Text>
            <Text style={footerMuted}>
              You received this because you completed a mock interview on{" "}
              <Link href="https://tryskillbridge.com" style={footerLink}>tryskillbridge.com</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const container = { maxWidth: "600px", margin: "0 auto", padding: "40px 20px" };
const header = { textAlign: "center" as const, paddingBottom: "24px" };
const logo = { fontSize: "24px", fontWeight: "700" as const, color: "#ffffff", margin: "0" };
const heroSection = { textAlign: "center" as const, padding: "0 0 8px" };
const h1 = { color: "#ffffff", fontSize: "28px", fontWeight: "800" as const, margin: "0 0 12px" };
const subtitle = { color: "#a1a1aa", fontSize: "18px", margin: "0" };
const divider = { borderColor: "#27272a", margin: "24px 0" };
const scoreNumber = { fontSize: "56px", fontWeight: "800" as const, margin: "0", lineHeight: "1" };
const scoreLabelStyle = { color: "#71717a", fontSize: "16px", margin: "8px 0 0" };
const summaryText = { color: "#a1a1aa", fontSize: "14px", margin: "16px auto 0", maxWidth: "480px", lineHeight: "1.6" };
const card = { backgroundColor: "#18181b", borderRadius: "12px", border: "1px solid #27272a", padding: "20px", marginBottom: "16px" };
const cardHeader = { color: "#10b981", fontSize: "16px", fontWeight: "700" as const, margin: "0 0 12px" };
const listItem = { color: "#d4d4d8", fontSize: "13px", lineHeight: "1.8", margin: "0" };
const ctaText = { color: "#a1a1aa", fontSize: "14px", margin: "0 0 16px" };
const button = { backgroundColor: "#3b82f6", borderRadius: "8px", color: "#ffffff", display: "inline-block", fontSize: "14px", fontWeight: "600" as const, padding: "12px 32px", textDecoration: "none" };
const footer = { textAlign: "center" as const, padding: "8px 0 0" };
const footerText = { color: "#52525b", fontSize: "13px", margin: "0 0 4px" };
const footerMuted = { color: "#3f3f46", fontSize: "11px", margin: "0" };
const footerLink = { color: "#3f3f46", textDecoration: "underline" };
