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
 * Posts a daily tweet from the content bank (with Unsplash image)
 * or a curiosity stats tweet (with inline-generated stats image).
 * Protected by CRON_SECRET.
 *
 * Query params:
 *   ?preview=true  — returns the tweet text without posting
 */
export async function GET(req: NextRequest) { return handler(req); }
export async function POST(req: NextRequest) { return handler(req); }

// ── Unsplash queries by pillar ──
const PILLAR_IMAGE_QUERIES: Record<string, string[]> = {
  wisdom: ["career growth", "mountain summit", "road ahead", "compass direction", "chess strategy"],
  tip: ["coding laptop", "productivity desk", "notebook planning", "developer workspace", "whiteboard ideas"],
  insight: ["data analytics", "tech industry", "city skyline night", "innovation technology", "circuit board"],
  engagement: ["team collaboration", "conversation coffee", "community meetup", "brainstorm session", "diverse team"],
};

/**
 * Fetches a random Pexels image for the given pillar and uploads it to Twitter.
 * Returns media_id or null on failure.
 */
async function uploadPillarImage(pillar: string): Promise<string | null> {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.error("[X Tweet] PEXELS_API_KEY not set");
      return null;
    }

    const queries = PILLAR_IMAGE_QUERIES[pillar] || PILLAR_IMAGE_QUERIES.wisdom;
    const query = queries[Math.floor(Math.random() * queries.length)];

    // Use Pexels API to search for a landscape image
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&size=medium&per_page=15`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: apiKey },
    });

    if (!searchRes.ok) {
      console.error("[X Tweet] Pexels search failed:", searchRes.status);
      return null;
    }

    const data = await searchRes.json();
    if (!data.photos || data.photos.length === 0) {
      console.error("[X Tweet] Pexels returned no photos for:", query);
      return null;
    }

    // Pick a random photo from results and use the landscape size
    const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
    const imageUrl = photo.src.landscape; // 1200x627 — close to 1200x630

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.error("[X Tweet] Pexels image download failed:", imgRes.status);
      return null;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const client = getTwitterClient();
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: "image/jpeg" });
    return mediaId;
  } catch (err) {
    console.error("[X Tweet] Pillar image upload failed:", err);
    return null;
  }
}

/**
 * Generates the stats image directly (no self-fetch) and uploads to Twitter.
 * Returns media_id or null on failure.
 */
async function generateAndUploadStatsImage(
  db: ReturnType<typeof getRedis>
): Promise<string | null> {
  try {
    const { ImageResponse } = await import("next/og");

    // Gather anonymized stats
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
        } catch { /* skip malformed */ }
      }
      cursor = nextCursor;
      if (cursor === "0") break;
    }

    const total = scores.length || 1;
    const avgScore = scores.length
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / total)
      : 42;
    const below50 = scores.length
      ? Math.round((scores.filter((s) => s.score < 50).length / total) * 100)
      : 68;

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

    const color =
      avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#3b82f6" : avgScore >= 40 ? "#f59e0b" : "#ef4444";

    const imageResponse = new ImageResponse(
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
          <div style={{ display: "flex", fontSize: 22, color: "#52525b", marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" as const }}>
            Career Readiness Data
          </div>
          <div style={{ display: "flex", fontSize: 16, color: "#3f3f46", marginBottom: 40 }}>
            Anonymized stats from real developers
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 140, fontWeight: 800, color, lineHeight: 1 }}>
              {avgScore}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>/ 100</div>
              <div style={{ display: "flex", fontSize: 20, color: "#52525b" }}>avg. score</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 60, marginTop: 40, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#ef4444" }}>{below50}%</div>
              <div style={{ display: "flex", fontSize: 16, color: "#71717a" }}>not ready</div>
            </div>
            <div style={{ display: "flex", width: 1, height: 60, backgroundColor: "#27272a" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: "#a1a1aa" }}>{scores.length || "—"}</div>
              <div style={{ display: "flex", fontSize: 16, color: "#71717a" }}>devs checked</div>
            </div>
            {topGaps.length > 0 && (
              <>
                <div style={{ display: "flex", width: 1, height: 60, backgroundColor: "#27272a" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 300 }}>
                  <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: "#f59e0b" }}>#1 Gap</div>
                  <div style={{ display: "flex", fontSize: 16, color: "#71717a", textAlign: "center" }}>{topGaps[0]}</div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#3f3f46", marginTop: 48 }}>
            Check your score → tryskillbridge.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const client = getTwitterClient();
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType: "image/png" });
    return mediaId;
  } catch (err) {
    console.error("[X Tweet] Stats image generation/upload failed:", err);
    return null;
  }
}

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

        // Generate stats image inline (no self-fetch)
        mediaId = await generateAndUploadStatsImage(db);

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

      // (A) Attach a pillar-themed Unsplash image to bank tweets
      mediaId = await uploadPillarImage(tweetPillar);

      if (preview) {
        return NextResponse.json({
          preview: true,
          tweet: tweetText,
          pillar: tweetPillar,
          remaining: available.length - 1,
          source: "bank",
          hasMedia: !!mediaId,
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
      hasMedia: !!mediaId,
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
 * Scans recent scores in Redis and generates an anonymized curiosity tweet.
 * Returns null if there isn't enough data to be interesting.
 */
async function generateCuriosityTweet(
  db: ReturnType<typeof getRedis>
): Promise<string | null> {
  try {
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
        } catch { /* skip malformed */ }
      }
      cursor = nextCursor;
      if (cursor === "0") break;
    }

    if (scores.length < 5) return null;

    const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

    const roleCounts: Record<string, number> = {};
    for (const s of scores) {
      const role = s.targetRole.toLowerCase().trim();
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    }
    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([role]) => role);

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

    const below50 = scores.filter((s) => s.score < 50).length;
    const below50Pct = Math.round((below50 / scores.length) * 100);

    // (C) Bumped max_tokens and character target for meatier tweets
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: `You write polarizing, opinionated Twitter posts for a career readiness account. You weaponize anonymized user data into takes so sharp people HAVE to quote-tweet.

VOICE: You're the person at the meetup who says the thing everyone's thinking but nobody says out loud. Confident. Slightly unhinged. Never corporate.

STYLE EXAMPLES (match this energy):
- "The Invisible Developer is the most dangerous role in tech. You ship code nobody notices, get passed over for promo, and wonder why. Meanwhile the person who presents your work at standup got Staff."
- "Companies say they want Seniors but they actually just want 3 Juniors in a trench coat. The JD is a wishlist, the interview is a hazing ritual, and the offer is 30% below market."
- "68% of devs who checked their readiness scored below 50. The job market isn't broken — your self-assessment is. You think you're a 7 because nobody told you you're a 4."
- "System design is the #1 skill gap we see. Not because it's hard. Because nobody practices it until the interview. Then they draw boxes on a whiteboard and pray."

RULES:
- Aim for 200-280 characters. Pack in a hot take + the data to back it up. Make it feel like a mini-rant, not a fortune cookie.
- NEVER link to the website or mention the product name.
- Weave the stats in naturally — they're evidence for your hot take, not a report.
- Lead with a provocative claim. Let the data back it up. End with a gut punch.
- No hashtags. Max 1 emoji if it hits harder with one.
- Output ONLY the tweet text. Nothing else.`,
      max_tokens: 300,
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
  const entry = { type, ...data, timestamp: new Date().toISOString() };
  await db.lpush("x:activity_log", JSON.stringify(entry));
  await db.ltrim("x:activity_log", 0, 199);
}
