import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";

export const revalidate = 300; // ISR: revalidate every 5 min

export async function GET() {
  try {
    const db = getRedis();
    const keys = await db.keys("roadmap:*");

    if (!keys.length) {
      return NextResponse.json([]);
    }

    // Fetch all roadmaps in parallel (cap at 100 to avoid explosion)
    const pipeline = db.pipeline();
    for (const key of keys.slice(0, 100)) {
      pipeline.get(key);
    }
    const results = await pipeline.exec();

    const roadmaps: {
      slug: string;
      currentRole: string;
      targetRole: string;
      estimatedTimeline: string;
      phases: string[];
      createdAt: string;
    }[] = [];

    for (const [err, raw] of results || []) {
      if (err || !raw) continue;
      try {
        const data: SavedRoadmap = JSON.parse(raw as string);
        roadmaps.push({
          slug: data.slug,
          currentRole: data.input.currentRole || "Career Starter",
          targetRole: data.input.targetRole,
          estimatedTimeline: data.result.estimatedTimeline,
          phases: data.result.roadmap.map((p) => p.title),
          createdAt: data.createdAt,
        });
      } catch { /* skip malformed */ }
    }

    // Sort by most recent
    roadmaps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(roadmaps.slice(0, 30));
  } catch (err) {
    console.error("[Explore] Failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
