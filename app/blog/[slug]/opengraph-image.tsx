import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const runtime = "nodejs";
export const alt = "SkillBridge Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title || "SkillBridge Blog";
  const description = post?.description || "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111118 50%, #0a0a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          <span style={{ color: "#ffffff" }}>Skill</span>
          <span style={{ color: "#60a5fa" }}>Bridge</span>
          <span
            style={{
              marginLeft: "16px",
              fontSize: "14px",
              color: "#71717a",
              fontWeight: 400,
            }}
          >
            Blog
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            marginBottom: "20px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: "20px",
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            {description.slice(0, 120)}
            {description.length > 120 ? "..." : ""}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
