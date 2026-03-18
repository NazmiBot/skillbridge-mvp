import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SkillBridge Mock Interview Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let score = 0;
  let label = "";
  let currentRole = "";
  let targetRole = "";
  let summary = "";

  try {
    const { getRedis } = await import("@/lib/redis");
    const db = getRedis();
    const [roadmapRaw, evalRaw] = await Promise.all([
      db.get(`roadmap:${slug}`),
      db.get(`interview:evaluation:${slug}`),
    ]);
    if (roadmapRaw && evalRaw) {
      const roadmap = JSON.parse(roadmapRaw);
      const evaluation = JSON.parse(evalRaw);
      score = evaluation.score;
      summary = evaluation.summary;
      currentRole = roadmap.input.currentRole;
      targetRole = roadmap.input.targetRole;
    }
  } catch {
    // fallback defaults
  }

  if (score >= 80) label = "Excellent";
  else if (score >= 60) label = "Strong";
  else if (score >= 40) label = "Developing";
  else label = "Needs Work";

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
        {/* Brand */}
        <div style={{ display: "flex", fontSize: 24, color: "#71717a", marginBottom: 16 }}>
          SkillBridge — Mock Interview Results
        </div>

        {/* Career transition */}
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginBottom: 40 }}>
          {currentRole || "You"} → {targetRole || "Your Dream Role"}
        </div>

        {/* Big score */}
        <div style={{ display: "flex", fontSize: 160, fontWeight: 800, color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#71717a", marginTop: 8 }}>
          / 100 — {label}
        </div>

        {/* Summary (truncated) */}
        {summary && (
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#a1a1aa",
              marginTop: 32,
              maxWidth: 900,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {summary.length > 140 ? summary.slice(0, 137) + "..." : summary}
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", fontSize: 20, color: "#52525b", marginTop: 40 }}>
          Check your career readiness → tryskillbridge.com
        </div>
      </div>
    ),
    { ...size }
  );
}
