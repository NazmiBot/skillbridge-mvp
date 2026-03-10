import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillBridge — AI Career Blueprint Architect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            Skill
          </span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#60a5fa",
              letterSpacing: "-1px",
            }}
          >
            Bridge
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Your next career move,</span>
          <span
            style={{
              background: "linear-gradient(90deg, #60a5fa, #a855f7, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            engineered.
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "700px",
            display: "flex",
          }}
        >
          AI-powered 3-phase career roadmaps. Free.
        </div>

        {/* Phase pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(245,158,11,0.3)",
              background: "rgba(245,158,11,0.1)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🧱</span>
            <span style={{ color: "#fbbf24", fontSize: "18px", fontWeight: 600 }}>
              Foundation
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.1)",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚡</span>
            <span style={{ color: "#60a5fa", fontSize: "18px", fontWeight: 600 }}>
              Execution
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(168,85,247,0.3)",
              background: "rgba(168,85,247,0.1)",
            }}
          >
            <span style={{ fontSize: "20px" }}>👑</span>
            <span style={{ color: "#a855f7", fontSize: "18px", fontWeight: 600 }}>
              Authority
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
