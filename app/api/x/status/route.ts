import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { verifyCron } from "@/lib/cron";
import { TWEET_BANK } from "@/lib/x-content";

/**
 * GET /api/x/status
 * Returns activity log and stats for the X automation.
 * Protected by CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getRedis();

    // Posted tweets count
    const postedRaw = await db.get("x:posted_tweets");
    const posted: number[] = postedRaw ? JSON.parse(postedRaw) : [];

    // Today's replies
    const today = new Date().toISOString().slice(0, 10);
    const dailyReplies = parseInt((await db.get(`x:replies:${today}`)) || "0");

    // Last reply time
    const lastReply = await db.get("x:last_reply_time");

    // Activity log (last 20)
    const logRaw = await db.lrange("x:activity_log", 0, 19);
    const log = logRaw.map((l) => JSON.parse(l));

    return NextResponse.json({
      stats: {
        tweetsPosted: posted.length,
        tweetsRemaining: TWEET_BANK.length - posted.length,
        totalInBank: TWEET_BANK.length,
        repliesToday: dailyReplies,
        maxRepliesToday: 3,
        lastReplyAt: lastReply || null,
      },
      recentActivity: log,
    });
  } catch (err) {
    console.error("[X Status] Failed:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
