import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/redis";

export const runtime = "edge";
export const alt = "SkillBridge Career Gap Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let score = 0;
  let label = "";
  let currentRole = "";
  let targetRole = "";

  try {
    const db = getRedis();
    const raw = await db.get(`score:${id}`);
    if (raw) {
      const data = JSON.parse(raw);
      score = data.score;
      label = data.label;
      currentRole = data.currentRole;
      targetRole = data.targetRole;
    }
  } catch {
    // fallback defaults
  }

  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginBottom: 20 }}>
          SkillBridge
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#71717a", marginBottom: 40 }}>
          {currentRole} → {targetRole}
        </div>
        <div style={{ display: "flex", fontSize: 140, fontWeight: 800, color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#71717a", marginTop: 10 }}>
          / 100 — {label}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#52525b", marginTop: 40 }}>
          How ready are you? → tryskillbridge.com/score
        </div>
      </div>
    ),
    { ...size }
  );
}
