import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getAnthropic } from "@/lib/anthropic";
import { Resend } from "resend";
import FollowUpEmail from "@/emails/FollowUpEmail";
import type { SavedRoadmap } from "@/lib/types";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function verifyCron(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const header = req.headers.get("x-cron-secret");
  if (header === process.env.CRON_SECRET) return true;
  return false;
}

/**
 * GET /api/cron/follow-up — Vercel Cron handler
 *
 * Sends a 48-hour follow-up email to free blueprint users who haven't
 * purchased the premium interview. Uses a sorted set index (roadmaps:created)
 * to efficiently find roadmaps in the 47–49 hour window — no keyspace scan.
 */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getRedis();
    const now = Date.now();

    // Window: roadmaps created 47–49 hours ago
    const windowStart = now - 49 * 60 * 60 * 1000;
    const windowEnd = now - 47 * 60 * 60 * 1000;

    // O(log N) lookup via sorted set — no SCAN needed
    const slugs = await db.zrangebyscore("roadmaps:created", windowStart, windowEnd);

    if (slugs.length === 0) {
      return NextResponse.json({ message: "No roadmaps in the 48h window.", sent: 0 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";
    const results: { slug: string; status: string }[] = [];

    for (const slug of slugs) {
      try {
        // Load roadmap
        const roadmapRaw = await db.get(`roadmap:${slug}`);
        if (!roadmapRaw) {
          results.push({ slug, status: "skipped:expired" });
          continue;
        }

        const roadmap: SavedRoadmap = JSON.parse(roadmapRaw);

        // Check: already paid for interview?
        const paid = await db.get(`interview:paid:${slug}`);
        if (paid === "true") {
          results.push({ slug, status: "skipped:already_paid" });
          continue;
        }

        // Check: follow-up already sent?
        const followUpSent = await db.get(`followup:sent:${slug}`);
        if (followUpSent) {
          results.push({ slug, status: "skipped:already_sent" });
          continue;
        }

        // Find the lead email associated with this roadmap
        // Leads are stored as lead:<email> with a roadmapSlug field
        const email = await findEmailForSlug(db, slug);
        if (!email) {
          results.push({ slug, status: "skipped:no_email" });
          continue;
        }

        // Generate personalized insider tip via Claude
        const insiderTip = await generateInsiderTip(
          roadmap.input.currentRole,
          roadmap.input.targetRole
        );

        // Send the email
        const resend = getResend();
        const { error } = await resend.emails.send({
          from: "SkillBridge <hello@tryskillbridge.com>",
          to: [email],
          subject: `The #1 thing ${roadmap.input.targetRole} interviewers look for`,
          react: FollowUpEmail({
            targetRole: roadmap.input.targetRole,
            currentRole: roadmap.input.currentRole,
            insiderTip,
            interviewUrl: `${baseUrl}/r/${slug}/interview`,
          }),
        });

        if (error) {
          console.error(`[FollowUp] Resend error for ${slug}:`, error);
          results.push({ slug, status: "error:send_failed" });
          continue;
        }

        // Mark as sent (no TTL — we never want to double-send)
        await db.set(`followup:sent:${slug}`, new Date().toISOString());

        // Log activity
        await db.lpush(
          "x:activity_log",
          JSON.stringify({
            type: "follow_up_email",
            slug,
            email: email.replace(/(.{2}).*(@.*)/, "$1***$2"), // redact
            targetRole: roadmap.input.targetRole,
            timestamp: new Date().toISOString(),
          })
        );
        await db.ltrim("x:activity_log", 0, 199);

        results.push({ slug, status: "sent" });
      } catch (err) {
        console.error(`[FollowUp] Error processing ${slug}:`, err);
        results.push({ slug, status: "error:processing" });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    return NextResponse.json({
      message: `Processed ${slugs.length} roadmaps, sent ${sent} follow-ups.`,
      sent,
      total: slugs.length,
      results,
    });
  } catch (err) {
    console.error("[FollowUp] Cron failed:", err);
    return NextResponse.json({ error: "Follow-up cron failed" }, { status: 500 });
  }
}

/**
 * Find the email address associated with a roadmap slug.
 * Uses the direct lead:by-slug:<slug> index (O(1) lookup).
 * Falls back to scanning lead:* for leads created before the index existed.
 */
async function findEmailForSlug(
  db: ReturnType<typeof getRedis>,
  slug: string
): Promise<string | null> {
  // Fast path: direct index (set by /api/leads since this feature)
  const indexed = await db.get(`lead:by-slug:${slug}`);
  if (indexed) return indexed;

  // Slow fallback: scan for legacy leads (remove once all old leads expire)
  let cursor = "0";
  for (let i = 0; i < 20; i++) {
    const [nextCursor, keys] = await db.scan(cursor, "MATCH", "lead:*", "COUNT", 100);
    for (const key of keys) {
      // Skip index keys
      if (key.startsWith("lead:by-slug:")) continue;
      try {
        const raw = await db.get(key);
        if (raw) {
          const lead = JSON.parse(raw);
          if (lead.roadmapSlug === slug) return lead.email;
        }
      } catch {
        // skip malformed
      }
    }
    cursor = nextCursor;
    if (cursor === "0") break;
  }

  return null;
}

/**
 * Generate a one-sentence insider tip personalized to the career transition.
 */
async function generateInsiderTip(
  currentRole: string,
  targetRole: string
): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: `You are a career coach who helps people transition between tech roles. Generate a single, specific, actionable insider tip about what interviewers REALLY look for when hiring for the target role.

RULES:
- One sentence only. Under 200 characters.
- Be specific to this exact role transition — not generic advice.
- Focus on what most candidates miss or underestimate.
- Sound like advice from someone who's been on the hiring panel.
- No fluff, no "Remember to..." — just the insight.
- Output ONLY the tip. Nothing else.`,
      max_tokens: 100,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: `Career transition: ${currentRole} → ${targetRole}. What's the one thing most candidates miss in their interview?`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Non-text response");
    return block.text.replace(/^["']|["']$/g, "").trim();
  } catch (err) {
    console.error("[FollowUp] Tip generation failed:", err);
    // Solid fallback
    return `Most ${targetRole} interview panels care less about what you've built and more about how you made technical decisions under constraints.`;
  }
}
