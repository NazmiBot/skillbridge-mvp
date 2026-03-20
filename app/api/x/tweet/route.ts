import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getTwitterClient } from "@/lib/twitter";
import { getAnthropic } from "@/lib/anthropic";
import { verifyCron } from "@/lib/cron";
import { TWEET_BANK } from "@/lib/x-content";

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

    // Every 3rd day, try a curiosity stats tweet instead of the bank
    const day = new Date().getDay(); // 0=Sun ... 6=Sat
    const dayOfMonth = new Date().getDate();
    const isCuriosityDay = dayOfMonth % 3 === 0;

    let tweetText: string;
    let tweetPillar: string;
    let tweetIndex: number | null = null;

    let mediaId: string | null = null;

    if (isCuriosityDay) {
      // Try to generate a curiosity stats tweet from real data
      const statsTweet = await generateCuriosityTweet(db);
      if (statsTweet) {
        tweetText = statsTweet;
        tweetPillar = "curiosity_stats";

        // Generate and upload the stats image as media
        mediaId = await uploadStatsImage(req);

        if (preview) {
          return NextResponse.json({
            preview: true,
            tweet: tweetText,
            pillar: tweetPillar,
            remaining: available.length,
            source: "curiosity_stats",
            hasMedia: !!mediaId,
          });
        }
      } else {
        // Not enough data — fall through to bank
        tweetText = "";
        tweetPillar = "";
      }
    } else {
      tweetText = "";
      tweetPillar = "";
    }

    // Fall back to tweet bank if no curiosity tweet was generated
    if (!tweetText) {
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
      const tweet = available.find((t) => t.pillar === preferred) || available[0];
      tweetText = tweet.text;
      tweetPillar = tweet.pillar;
      tweetIndex = tweet.index;

      if (preview) {
        return NextResponse.json({
          preview: true,
          tweet: tweetText,
          pillar: tweetPillar,
          remaining: available.length - 1,
          source: "bank",
        });
      }
    }

    // Post it (with media if available)
    const client = getTwitterClient();
    const result = mediaId
      ? await client.v2.tweet({ text: tweetText, media: { media_ids: [mediaId] } })
      : await client.v2.tweet(tweetText);

    // Mark bank tweet as posted (curiosity tweets don't consume bank)
    if (tweetIndex !== null) {
      posted.push(tweetIndex);
      await db.set("x:posted_tweets", JSON.stringify(posted));
    }

    // Log activity
    await logActivity(db, "tweet", {
      tweetId: result.data.id,
      text: tweetText,
      pillar: tweetPillar,
    });

    return NextResponse.json({
      success: true,
      tweetId: result.data.id,
      text: tweetText,
      pillar: tweetPillar,
      remaining: tweetIndex !== null ? available.length - 1 : available.length,
      source: tweetIndex !== null ? "bank" : "curiosity_stats",
      hasMedia: !!mediaId,
    });
  } catch (err) {
    console.error("[X Tweet] Failed:", err);
    return NextResponse.json({ error: "Failed to post tweet" }, { status: 500 });
  }
}

/**
 * Fetches the stats image from our own /api/x/stats-image endpoint
 * and uploads it to Twitter as media. Returns media_id or null on failure.
 */
async function uploadStatsImage(req: NextRequest): Promise<string | null> {
  try {
    const baseUrl = new URL(req.url).origin;
    const secret = process.env.CRON_SECRET;
    const imageRes = await fetch(
      `${baseUrl}/api/x/stats-image?secret=${encodeURIComponent(secret || "")}`,
      { headers: { authorization: `Bearer ${secret}` } }
    );

    if (!imageRes.ok) {
      console.error("[X Tweet] Stats image fetch failed:", imageRes.status);
      return null;
    }

    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const client = getTwitterClient();
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: "image/png" });
    return mediaId;
  } catch (err) {
    console.error("[X Tweet] Media upload failed:", err);
    return null; // graceful fallback — tweet still goes out without image
  }
}

/**
 * Scans recent scores in Redis and generates an anonymized curiosity tweet.
 * Returns null if there isn't enough data to be interesting.
 */
async function generateCuriosityTweet(
  db: ReturnType<typeof getRedis>
): Promise<string | null> {
  try {
    // Scan for score:* keys to gather anonymized stats
    const scores: { score: number; targetRole: string; missingSkills: string[] }[] = [];
    let cursor = "0";

    // Scan up to 500 keys
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
          // skip malformed entries
        }
      }
      cursor = nextCursor;
      if (cursor === "0") break;
    }

    // Need at least 5 scores to make stats interesting
    if (scores.length < 5) return null;

    // Compute stats
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

    // Most popular target roles
    const roleCounts: Record<string, number> = {};
    for (const s of scores) {
      const role = s.targetRole.toLowerCase().trim();
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    }
    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([role]) => role);

    // Most common skill gaps
    const skillCounts: Record<string, number> = {};
    for (const s of scores) {
      for (const skill of s.missingSkills.slice(0, 5)) {
        const sk = skill.toLowerCase().trim();
        skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      }
    }
    const topGaps = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    // Score distribution
    const below50 = scores.filter((s) => s.score < 50).length;
    const below50Pct = Math.round((below50 / scores.length) * 100);

    // Use Claude to craft the tweet from raw stats
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: `You write polarizing, opinionated Twitter posts for a career readiness account. You weaponize anonymized user data into takes so sharp people HAVE to quote-tweet.

VOICE: You're the person at the meetup who says the thing everyone's thinking but nobody says out loud. Confident. Slightly unhinged. Never corporate.

STYLE EXAMPLES (match this energy):
- "The Invisible Developer is the most dangerous role in tech. You ship code nobody notices, get passed over for promo, and wonder why."
- "Companies say they want Seniors but they actually just want 3 Juniors in a trench coat."
- "68% of devs who checked their readiness scored below 50. The job market isn't broken — your self-assessment is."
- "System design is the #1 skill gap we see. Not because it's hard. Because nobody practices it until the interview."

RULES:
- Under 250 characters. Make every word earn its spot.
- NEVER link to the website or mention the product name.
- Weave the stats in naturally — they're evidence for your hot take, not a report.
- Lead with a provocative claim. Let the data back it up.
- No hashtags. Max 1 emoji if it hits harder with one.
- Output ONLY the tweet text. Nothing else.`,
      max_tokens: 150,
      temperature: 0.9,
      messages: [
        {
          role: "user",
          content: `Write a curiosity tweet from these anonymized career data stats:
- ${scores.length} people checked their career readiness recently
- Average readiness score: ${avgScore}/100
- ${below50Pct}% scored below 50 (not ready)
- Most popular target roles: ${topRoles.join(", ") || "various tech roles"}
- Biggest skill gaps: ${topGaps.join(", ") || "system design, communication, leadership"}`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") return null;

    const tweet = block.text.replace(/^["']|["']$/g, "").trim();
    // Safety: reject if it accidentally mentions the product
    if (tweet.toLowerCase().includes("skillbridge") || tweet.includes("tryskillbridge")) {
      return null;
    }

    return tweet;
  } catch (err) {
    console.error("[X Tweet] Curiosity stats generation failed:", err);
    return null;
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
