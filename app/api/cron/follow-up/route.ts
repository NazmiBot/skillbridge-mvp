import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getAnthropic } from "@/lib/anthropic";
import { Resend } from "resend";
import FollowUpEmail from "@/emails/FollowUpEmail";
import CaseStudyEmail from "@/emails/CaseStudyEmail";
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
 * 3-step email sequence for free blueprint users:
 *   Day 2 (24–48h): Insider tip email (personalized career advice)
 *   Day 5 (96–144h): Case study email (data-driven social proof)
 *
 * Uses a sorted set index (roadmaps:created) for efficient lookups.
 * Runs once daily on Hobby plan — wider windows ensure no one is missed.
 */
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getRedis();
    const now = Date.now();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";
    const results: { slug: string; step: string; status: string }[] = [];

    // ── Step 1: Day 2 emails (24–48h window) ──
    const day2Start = now - 48 * 60 * 60 * 1000;
    const day2End = now - 24 * 60 * 60 * 1000;
    const day2Slugs = await db.zrangebyscore("roadmaps:created", day2Start, day2End);

    for (const slug of day2Slugs) {
      const result = await sendDay2Email(db, slug, baseUrl);
      results.push({ slug, step: "day2", ...result });
    }

    // ── Step 2: Day 5 emails (96–144h window) ──
    const day5Start = now - 144 * 60 * 60 * 1000; // 6 days ago
    const day5End = now - 96 * 60 * 60 * 1000;     // 4 days ago
    const day5Slugs = await db.zrangebyscore("roadmaps:created", day5Start, day5End);

    for (const slug of day5Slugs) {
      const result = await sendDay5Email(db, slug, baseUrl);
      results.push({ slug, step: "day5", ...result });
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const total = day2Slugs.length + day5Slugs.length;

    return NextResponse.json({
      message: `Processed ${total} roadmaps, sent ${sent} emails.`,
      sent,
      total,
      day2: { checked: day2Slugs.length, sent: results.filter(r => r.step === "day2" && r.status === "sent").length },
      day5: { checked: day5Slugs.length, sent: results.filter(r => r.step === "day5" && r.status === "sent").length },
      results,
    });
  } catch (err) {
    console.error("[FollowUp] Cron failed:", err);
    return NextResponse.json({ error: "Follow-up cron failed" }, { status: 500 });
  }
}

/**
 * Day 2 email: Insider tip (existing logic, extracted)
 */
async function sendDay2Email(
  db: ReturnType<typeof getRedis>,
  slug: string,
  baseUrl: string
): Promise<{ status: string }> {
  try {
    const roadmapRaw = await db.get(`roadmap:${slug}`);
    if (!roadmapRaw) return { status: "skipped:expired" };

    const roadmap: SavedRoadmap = JSON.parse(roadmapRaw);

    const paid = await db.get(`interview:paid:${slug}`);
    if (paid === "true") return { status: "skipped:already_paid" };

    const followUpSent = await db.get(`followup:sent:${slug}`);
    if (followUpSent) return { status: "skipped:already_sent" };

    const email = await findEmailForSlug(db, slug);
    if (!email) return { status: "skipped:no_email" };

    const insiderTip = await generateInsiderTip(
      roadmap.input.currentRole,
      roadmap.input.targetRole
    );

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
      console.error(`[FollowUp] Day 2 Resend error for ${slug}:`, error);
      return { status: "error:send_failed" };
    }

    await db.set(`followup:sent:${slug}`, new Date().toISOString());

    await db.lpush(
      "x:activity_log",
      JSON.stringify({
        type: "follow_up_email",
        step: "day2",
        slug,
        email: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
        targetRole: roadmap.input.targetRole,
        timestamp: new Date().toISOString(),
      })
    );
    await db.ltrim("x:activity_log", 0, 199);

    return { status: "sent" };
  } catch (err) {
    console.error(`[FollowUp] Day 2 error for ${slug}:`, err);
    return { status: "error:processing" };
  }
}

/**
 * Day 5 email: Case study / social proof
 */
async function sendDay5Email(
  db: ReturnType<typeof getRedis>,
  slug: string,
  baseUrl: string
): Promise<{ status: string }> {
  try {
    const roadmapRaw = await db.get(`roadmap:${slug}`);
    if (!roadmapRaw) return { status: "skipped:expired" };

    const roadmap: SavedRoadmap = JSON.parse(roadmapRaw);

    const paid = await db.get(`interview:paid:${slug}`);
    if (paid === "true") return { status: "skipped:already_paid" };

    // Check: Day 5 email already sent?
    const day5Sent = await db.get(`followup:day5:${slug}`);
    if (day5Sent) return { status: "skipped:already_sent" };

    const email = await findEmailForSlug(db, slug);
    if (!email) return { status: "skipped:no_email" };

    const caseStudy = await generateCaseStudy(
      roadmap.input.currentRole,
      roadmap.input.targetRole
    );

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "SkillBridge <hello@tryskillbridge.com>",
      to: [email],
      subject: `How someone went from ${roadmap.input.currentRole} to ${roadmap.input.targetRole}`,
      react: CaseStudyEmail({
        targetRole: roadmap.input.targetRole,
        currentRole: roadmap.input.currentRole,
        caseStudy,
        interviewUrl: `${baseUrl}/r/${slug}/interview`,
        blueprintUrl: `${baseUrl}/r/${slug}`,
      }),
    });

    if (error) {
      console.error(`[FollowUp] Day 5 Resend error for ${slug}:`, error);
      return { status: "error:send_failed" };
    }

    await db.set(`followup:day5:${slug}`, new Date().toISOString());

    await db.lpush(
      "x:activity_log",
      JSON.stringify({
        type: "follow_up_email",
        step: "day5",
        slug,
        email: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
        targetRole: roadmap.input.targetRole,
        timestamp: new Date().toISOString(),
      })
    );
    await db.ltrim("x:activity_log", 0, 199);

    return { status: "sent" };
  } catch (err) {
    console.error(`[FollowUp] Day 5 error for ${slug}:`, err);
    return { status: "error:processing" };
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
 * Generate a short case study / pattern observation for the Day 5 email.
 */
async function generateCaseStudy(
  currentRole: string,
  targetRole: string
): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: `You write short, compelling career transition case studies. They sound like real data observations, not made-up stories. The tone is "pattern we've noticed" — analytical but encouraging.

RULES:
- 2-3 sentences max. Under 300 characters.
- Frame it as a pattern, not a single person's story ("engineers who transition from X to Y tend to...")
- Include a specific, actionable detail (a skill, a timeframe, a strategy)
- Sound like data, not marketing
- Output ONLY the case study text. Nothing else.`,
      max_tokens: 150,
      temperature: 0.85,
      messages: [
        {
          role: "user",
          content: `Write a data-backed observation about the ${currentRole} → ${targetRole} career transition. What pattern do successful transitioners follow?`,
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Non-text response");
    return block.text.replace(/^["']|["']$/g, "").trim();
  } catch (err) {
    console.error("[FollowUp] Case study generation failed:", err);
    return `Engineers who successfully transition from ${currentRole} to ${targetRole} share one trait: they focused on closing 3 specific skill gaps rather than trying to learn everything. The ones who paired that with mock interviews landed offers 40% faster.`;
  }
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
