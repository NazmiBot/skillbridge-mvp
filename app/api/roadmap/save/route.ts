import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { createHash } from "crypto";
import type { SavedRoadmap } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, result } = body;

    if (!input?.targetRole || !result?.roadmap?.length) {
      return NextResponse.json(
        { error: "Missing roadmap data" },
        { status: 400 }
      );
    }

    // Generate a short slug from the input payload
    const hash = createHash("sha256")
      .update(JSON.stringify({ input, generatedAt: result.generatedAt }))
      .digest("base64url")
      .slice(0, 8);

    const slug = hash;
    const db = getRedis();

    const saved: SavedRoadmap = {
      slug,
      input,
      result,
      createdAt: new Date().toISOString(),
    };

    // Store with 7-day TTL for free users; extended to 90 days on payment
    await db.set(`roadmap:${slug}`, JSON.stringify(saved), "EX", 7 * 86400);

    // Track total saves
    await db.incr("roadmaps:count");

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000");

    return NextResponse.json({
      success: true,
      slug,
      url: `${baseUrl}/r/${slug}`,
    });
  } catch (error) {
    console.error("[Roadmap Save] Failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
