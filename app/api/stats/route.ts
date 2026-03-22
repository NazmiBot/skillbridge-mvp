import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const revalidate = 300; // Cache for 5 min

export async function GET() {
  try {
    const db = getRedis();
    const count = await db.get("roadmaps:count");
    return NextResponse.json({
      blueprints: parseInt(count || "0", 10),
    });
  } catch {
    return NextResponse.json({ blueprints: 0 });
  }
}
