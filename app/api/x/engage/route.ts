import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getTwitterClient } from "@/lib/twitter";
import { getAnthropic } from "@/lib/anthropic";
import { TARGET_ACCOUNTS, RELEVANT_TOPICS } from "@/lib/x-content";

function verifyCron(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const header = req.headers.get("x-cron-secret");
  if (header === process.env.CRON_SECRET) return true;
  return false;
}

/**
 * GET /api/x/engage — Vercel Cron handler
 * POST /api/x/engage — Manual trigger
 *
 * Finds a recent tweet from a target account and posts a helpful reply.
 * Protected by CRON_SECRET.
 *
 * Query params:
 *   ?preview=true  — drafts the reply but doesn't post
 *   ?account=swyx  — target a specific account (optional)
 */
export async function GET(req: NextRequest) { return handler(req); }
export async function POST(req: NextRequest) { return handler(req); }

async function handler(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preview = req.nextUrl.searchParams.get("preview") === "true";
  const forceAccount = req.nextUrl.searchParams.get("account");

  try {
    const db = getRedis();
    const client = getTwitterClient();

    // Safety: check daily reply count (max 3/day)
    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = `x:replies:${today}`;
    const dailyCount = parseInt((await db.get(dailyKey)) || "0");

    if (dailyCount >= 3 && !preview) {
      return NextResponse.json({
        message: "Daily reply limit reached (3/day). Staying safe.",
        repliedToday: dailyCount,
      });
    }

    // Safety: check cooldown (min 2 hours between replies)
    const lastReplyTime = await db.get("x:last_reply_time");
    if (lastReplyTime && !preview) {
      const hoursSince =
        (Date.now() - new Date(lastReplyTime).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 2) {
        return NextResponse.json({
          message: `Cooldown active. Last reply was ${hoursSince.toFixed(1)}h ago. Minimum 2h between replies.`,
        });
      }
    }

    // Pick an account to engage with (rotate, avoid repeats this week)
    const weekKey = `x:replied_accounts:${getWeekNumber()}`;
    const repliedThisWeek: string[] = JSON.parse(
      (await db.get(weekKey)) || "[]"
    );

    let targetAccount: string;
    if (forceAccount) {
      targetAccount = forceAccount;
    } else {
      // Filter to accounts we haven't replied to 2x this week
      const eligible = TARGET_ACCOUNTS.filter((a) => {
        const count = repliedThisWeek.filter((r) => r === a).length;
        return count < 2;
      });

      if (eligible.length === 0) {
        return NextResponse.json({
          message: "Already engaged with all target accounts this week. Chilling.",
        });
      }

      // Random pick
      targetAccount = eligible[Math.floor(Math.random() * eligible.length)];
    }

    // Fetch recent tweets from this account
    const user = await client.v2.userByUsername(targetAccount);
    if (!user.data) {
      return NextResponse.json({ error: `User @${targetAccount} not found` }, { status: 404 });
    }

    const timeline = await client.v2.userTimeline(user.data.id, {
      max_results: 10,
      exclude: ["retweets", "replies"],
      "tweet.fields": ["created_at", "public_metrics", "text"],
    });

    const tweets = timeline.data?.data || [];
    if (tweets.length === 0) {
      return NextResponse.json({
        message: `No recent tweets from @${targetAccount}`,
      });
    }

    // Filter for relevant tweets
    const repliedTweetIds: string[] = JSON.parse(
      (await db.get("x:replied_tweet_ids")) || "[]"
    );

    const relevantTweets = tweets.filter((t) => {
      // Skip if already replied
      if (repliedTweetIds.includes(t.id)) return false;
      // Check relevance
      const lower = t.text.toLowerCase();
      return RELEVANT_TOPICS.some((topic) => lower.includes(topic));
    });

    // If no relevant ones, pick the most engaged non-replied tweet
    const targetTweet =
      relevantTweets[0] ||
      tweets.find((t) => !repliedTweetIds.includes(t.id));

    if (!targetTweet) {
      return NextResponse.json({
        message: `Already replied to all recent tweets from @${targetAccount}`,
      });
    }

    // Generate a reply using Claude
    const reply = await generateReply(
      targetAccount,
      targetTweet.text,
    );

    if (preview) {
      return NextResponse.json({
        preview: true,
        account: targetAccount,
        originalTweet: targetTweet.text,
        draftReply: reply,
        tweetId: targetTweet.id,
      });
    }

    // Like the tweet first (feels natural)
    const me = await client.v2.me();
    try {
      await client.v2.like(me.data.id, targetTweet.id);
    } catch {
      // Like failed — not critical, continue
    }

    // Post the reply (may fail for new accounts due to X restrictions)
    let result;
    let replyPosted = false;
    try {
      result = await client.v2.tweet({
        text: reply,
        reply: { in_reply_to_tweet_id: targetTweet.id },
      });
      replyPosted = true;
    } catch (replyErr: unknown) {
      const detail = (replyErr as { data?: { detail?: string } }).data?.detail || "";
      const status = (replyErr as { code?: number; status?: number }).code
        ?? (replyErr as { code?: number; status?: number }).status;

      // Gracefully degrade to like-only on 403s (reply restrictions,
      // new-account limits, suspended targets, etc.) or known error messages
      if (
        status === 403 ||
        detail.includes("not allowed") ||
        detail.includes("not been mentioned")
      ) {
        const reason = detail || `Reply blocked (HTTP ${status ?? "unknown"})`;

        await logActivity(db, "like_only", {
          account: targetAccount,
          originalTweet: targetTweet.text,
          tweetId: targetTweet.id,
          draftReply: reply,
          reason,
        });

        return NextResponse.json({
          success: true,
          mode: "like_only",
          account: targetAccount,
          originalTweet: targetTweet.text,
          draftReply: reply,
          message: `Reply blocked by X: ${reason}. Liked the tweet and saved draft reply.`,
        });
      }
      throw replyErr; // Re-throw if it's a genuinely unexpected error
    }

    if (!replyPosted || !result) {
      return NextResponse.json({ error: "Reply failed unexpectedly" }, { status: 500 });
    }

    // Update tracking
    repliedTweetIds.push(targetTweet.id);
    // Keep last 500 IDs
    if (repliedTweetIds.length > 500) repliedTweetIds.splice(0, repliedTweetIds.length - 500);
    await db.set("x:replied_tweet_ids", JSON.stringify(repliedTweetIds));

    repliedThisWeek.push(targetAccount);
    await db.set(weekKey, JSON.stringify(repliedThisWeek));
    await db.expire(weekKey, 7 * 86400);

    await db.incr(dailyKey);
    await db.expire(dailyKey, 86400);
    await db.set("x:last_reply_time", new Date().toISOString());

    // Log
    await logActivity(db, "reply", {
      replyId: result.data.id,
      inReplyTo: targetTweet.id,
      account: targetAccount,
      originalTweet: targetTweet.text,
      reply,
    });

    return NextResponse.json({
      success: true,
      replyId: result.data.id,
      account: targetAccount,
      originalTweet: targetTweet.text,
      reply,
      repliedToday: dailyCount + 1,
    });
  } catch (err) {
    console.error("[X Engage] Failed:", err);
    return NextResponse.json({ error: "Engagement failed" }, { status: 500 });
  }
}

async function generateReply(
  account: string,
  tweetText: string,
): Promise<string> {
  const anthropic = getAnthropic();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    system: `You are the voice behind @tryskillbridge — a thoughtful, knowledgeable person in the career development space. You write short, insightful Twitter replies.

RULES:
- Reply in 1-2 sentences MAX (under 200 characters is ideal)
- Be genuinely helpful or insightful — add value to the conversation
- Sound like a real person, not a brand. Casual but smart.
- NEVER mention SkillBridge, your product, or any link
- NEVER use hashtags in replies
- NEVER be sycophantic ("Great point!", "So true!", "This! 👆")
- Don't start with "I" — vary your sentence starters
- Match the energy of the original tweet
- If the tweet is funny, be witty. If serious, be thoughtful.
- Add a unique perspective or personal insight — don't just agree

Output ONLY the reply text. Nothing else.`,
    max_tokens: 150,
    temperature: 0.9,
    messages: [
      {
        role: "user",
        content: `Write a reply to this tweet by @${account}:\n\n"${tweetText}"`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Non-text response");

  // Clean up — remove quotes if the model wrapped it
  return block.text.replace(/^["']|["']$/g, "").trim();
}

function getWeekNumber(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${week}`;
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
