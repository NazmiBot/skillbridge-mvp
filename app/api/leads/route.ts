import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit("leads", ip, 10, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const db = getRedis();
    const key = `lead:${email}`;

    // Store the lead with metadata
    await db.set(
      key,
      JSON.stringify({
        email,
        roadmapSlug: body.roadmapSlug ?? null,
        capturedAt: new Date().toISOString(),
        source: "authority-gate",
      }),
      "EX",
      7 * 86400
    );

    // Track total leads count
    await db.incr("leads:count");

    return NextResponse.json(
      { success: true, message: "Authority Blueprint unlocked" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Leads] Capture failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
