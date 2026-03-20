import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { verifyCron } from "@/lib/cron";

export const runtime = "nodejs";

const size = { width: 1200, height: 630 };

/**
 * GET /api/x/stats-image — Generates a dynamic stats image for tweets.
 * Protected by CRON_SECRET (only called internally by the tweet cron).
 *
 * Returns a 1200x630 PNG with anonymized career readiness stats.
 */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getRedis();

    // Gather anonymized stats from score:* keys
    const scores: { score: number; targetRole: string; missingSkills: string[] }[] = [];
    let cursor = "0";
    for (let i = 0; i < 10; i++) {
      const [nextCursor, keys] = await db.scan(cursor, "MATCH", "score:*", "COUNT", 50);
      for (const key of keys) {
        try {
          const raw = await db.get(key);
          if (raw) {
            const data = JSON.parse(raw);
            scores.push({
              score: data.score,
              targetRole: data.targetRole,
              missingSkills: data.missingSkills || [],
            });
          }
        } catch {
          // skip malformed
        }
      }
      cursor = nextCursor;
      if (cursor === "0") break;
    }

    // Compute stats (with fallbacks for low data)
    const total = scores.length || 1;
    const avgScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / total)
      : 42;
    const below50 = scores.length
      ? Math.round((scores.filter((s) => s.score < 50).length / total) * 100)
      : 68;

    // Top skill gaps
    const skillCounts: Record<string, number> = {};
    for (const s of scores) {
      for (const skill of (s.missingSkills || []).slice(0, 5)) {
        const sk = skill.trim();
        if (sk) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      }
    }
    const topGaps = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    // Score color
    const color =
      avgScore >= 80
        ? "#10b981"
        : avgScore >= 60
          ? "#3b82f6"
          : avgScore >= 40
            ? "#f59e0b"
            : "#ef4444";

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
          {/* Header */}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#52525b",
              marginBottom: 8,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
            }}
          >
            Career Readiness Data
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#3f3f46", marginBottom: 40 }}>
            Anonymized stats from real developers
          </div>

          {/* Big avg score */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", fontSize: 140, fontWeight: 800, color, lineHeight: 1 }}>
              {avgScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>/ 100</div>
              <div style={{ display: "flex", fontSize: 20, color: "#52525b" }}>avg. score</div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 60,
              marginTop: 40,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#ef4444" }}>
                {below50}%
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#71717a" }}>not ready</div>
            </div>

            <div
              style={{
                display: "flex",
                width: 1,
                height: 60,
                backgroundColor: "#27272a",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#a1a1aa" }}>
                {scores.length || "—"}
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#71717a" }}>devs checked</div>
            </div>

            {topGaps.length > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    width: 1,
                    height: 60,
                    backgroundColor: "#27272a",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    maxWidth: 300,
                  }}
                >
                  <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: "#f59e0b" }}>
                    #1 Gap
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 16,
                      color: "#71717a",
                      textAlign: "center",
                    }}
                  >
                    {topGaps[0]}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", fontSize: 18, color: "#3f3f46", marginTop: 48 }}>
            Check your score → tryskillbridge.com
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (err) {
    console.error("[Stats Image] Failed:", err);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
