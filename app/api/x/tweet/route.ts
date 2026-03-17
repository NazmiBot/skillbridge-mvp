import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getTwitterClient } from "@/lib/twitter";
import { TWEET_BANK } from "@/lib/x-content";

function verifyCron(req: NextRequest): boolean {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Also accept x-cron-secret header for manual calls
  const header = req.headers.get("x-cron-secret");
  if (header === process.env.CRON_SECRET) return true;
  return false;
}

/**
 * GET /api/x/tweet — Vercel Cron handler
 * POST /api/x/tweet — Manual trigger
 *
 * Posts a daily tweet from the content bank.
 * Protected by CRON_SECRET.
 *
 * Query params:
 *   ?preview=true  — returns the tweet text without posting
 */
export async function GET(req: NextRequest) { return handler(req); }
export async function POST(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preview = req.nextUrl.searchParams.get("preview") === "true";

  try {
    const db = getRedis();

    // Get list of already-posted tweet indices
    const postedRaw = await db.get("x:posted_tweets");
    const posted: number[] = postedRaw ? JSON.parse(postedRaw) : [];

    // Find next unposted tweet
    const available = TWEET_BANK.map((t, i) => ({ ...t, index: i })).filter(
      (t) => !posted.includes(t.index)
    );

    if (available.length === 0) {
      return NextResponse.json({
        message: "All tweets in the bank have been posted. Time to refill!",
        totalPosted: posted.length,
      });
    }

    // Pick based on day-of-week pillar preference
    const day = new Date().getDay(); // 0=Sun ... 6=Sat
    const pillarPreference: Record<number, string> = {
      0: "wisdom",     // Sunday
      1: "wisdom",     // Monday
      2: "tip",        // Tuesday
      3: "engagement", // Wednesday
      4: "insight",    // Thursday
      5: "wisdom",     // Friday
      6: "tip",        // Saturday
    };

    const preferred = pillarPreference[day] || "wisdom";
    let tweet = available.find((t) => t.pillar === preferred) || available[0];

    if (preview) {
      return NextResponse.json({
        preview: true,
        tweet: tweet.text,
        pillar: tweet.pillar,
        remaining: available.length - 1,
      });
    }

    // Post it
    const client = getTwitterClient();
    const result = await client.v2.tweet(tweet.text);

    // Mark as posted
    posted.push(tweet.index);
    await db.set("x:posted_tweets", JSON.stringify(posted));

    // Log activity
    await logActivity(db, "tweet", {
      tweetId: result.data.id,
      text: tweet.text,
      pillar: tweet.pillar,
    });

    return NextResponse.json({
      success: true,
      tweetId: result.data.id,
      text: tweet.text,
      pillar: tweet.pillar,
      remaining: available.length - 1,
    });
  } catch (err) {
    console.error("[X Tweet] Failed:", err);
    return NextResponse.json({ error: "Failed to post tweet" }, { status: 500 });
  }
}

async function logActivity(
  db: ReturnType<typeof getRedis>,
  type: string,
  data: Record<string, unknown>
) {
  const entry = {
    type,
    ...data,
    timestamp: new Date().toISOString(),
  };
  await db.lpush("x:activity_log", JSON.stringify(entry));
  // Keep last 200 entries
  await db.ltrim("x:activity_log", 0, 199);
}
