import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "SkillBridge Career Blueprint";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const phaseColors: Record<string, { bg: string; text: string; icon: string }> = {
  Foundation: { bg: "#78350f", text: "#fbbf24", icon: "🧱" },
  Execution: { bg: "#1e3a5f", text: "#60a5fa", icon: "⚡" },
  Authority: { bg: "#4a1d6a", text: "#c084fc", icon: "👑" },
};

// Fetch Inter font (regular weight) — cached across warm invocations
const interFont = fetch(
  "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2"
).then((res) => {
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  return res.arrayBuffer();
});

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fontData = await interFont;

  let roadmap: SavedRoadmap | null = null;
  try {
    const db = getRedis();
    const data = await db.get(`roadmap:${slug}`);
    if (data) roadmap = JSON.parse(data) as SavedRoadmap;
  } catch {
    // fall through to fallback
  }

  if (!roadmap) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            color: "white",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          SkillBridge
        </div>
      ),
      {
        ...size,
        fonts: [{ name: "Inter", data: fontData, style: "normal" as const, weight: 400 }],
      }
    );
  }

  const { input, result } = roadmap;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          padding: "48px 56px",
          fontFamily: "Inter",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            <span style={{ color: "#ffffff" }}>Skill</span>
            <span style={{ color: "#60a5fa" }}>Bridge</span>
          </div>
          <div
            style={{
              display: "flex",
              color: "#71717a",
              fontSize: 18,
              border: "1px solid #27272a",
              borderRadius: 999,
              padding: "6px 16px",
            }}
          >
            ⏱ {result.estimatedTimeline}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 36, color: "#a1a1aa", fontWeight: 600 }}>
            {input.currentRole}
          </span>
          <span style={{ fontSize: 36, color: "#3f3f46" }}>→</span>
          <span style={{ fontSize: 36, color: "#818cf8", fontWeight: 700 }}>
            {input.targetRole}
          </span>
        </div>

        {/* Three phase cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flex: 1,
          }}
        >
          {result.roadmap.map((step) => {
            const colors = phaseColors[step.title] ?? {
              bg: "#27272a",
              text: "#a1a1aa",
              icon: "📍",
            };

            return (
              <div
                key={step.phase}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  background: `${colors.bg}22`,
                  border: `1px solid ${colors.bg}66`,
                  borderRadius: 20,
                  padding: "24px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{colors.icon}</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: colors.text,
                      fontWeight: 600,
                      background: `${colors.bg}44`,
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                  >
                    Phase {step.phase}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#71717a",
                    marginBottom: 16,
                  }}
                >
                  {step.duration}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {step.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontSize: 12,
                        color: "#d4d4d8",
                        background: "#ffffff0d",
                        border: "1px solid #ffffff0d",
                        borderRadius: 6,
                        padding: "3px 8px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    fontSize: 13,
                    color: "#a1a1aa",
                    paddingTop: 12,
                    borderTop: "1px solid #ffffff0a",
                  }}
                >
                  🏁 {step.milestone}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
            fontSize: 16,
            color: "#52525b",
          }}
        >
          skillbridge.app — Generate your own career blueprint
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: fontData, style: "normal" as const, weight: 400 },
      ],
    }
  );
}
