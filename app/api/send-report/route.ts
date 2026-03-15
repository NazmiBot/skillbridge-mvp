import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getRedis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import ReportEmail from "@/emails/ReportEmail";
import type { EvaluationResult, SavedRoadmap } from "@/lib/types";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit("send-report", ip, 5, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const db = getRedis();

    // Check already sent
    const alreadySent = await db.get(`report:emailed:${slug}`);
    if (alreadySent) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    // Load evaluation, roadmap, and find lead email
    const [evalRaw, roadmapRaw] = await Promise.all([
      db.get(`interview:evaluation:${slug}`),
      db.get(`roadmap:${slug}`),
    ]);

    if (!evalRaw || !roadmapRaw) {
      return NextResponse.json({ error: "Report data not found" }, { status: 404 });
    }

    const evaluation: EvaluationResult = JSON.parse(evalRaw);
    const roadmap: SavedRoadmap = JSON.parse(roadmapRaw);

    // Find the email: check lead stored with this roadmap, or fall back to request body
    let email: string | null = null;

    // Scan for lead that references this slug
    const leadKeys = await db.keys("lead:*");
    for (const key of leadKeys) {
      const leadData = await db.get(key);
      if (!leadData) continue;
      try {
        const lead = JSON.parse(leadData);
        if (lead.roadmapSlug === slug) {
          email = lead.email;
          break;
        }
      } catch { /* skip malformed */ }
    }

    if (!email) {
      return NextResponse.json({ error: "No email found for this roadmap. User must unlock Authority phase first." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";
    const reportUrl = `${baseUrl}/r/${slug}/results`;

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: "SkillBridge <hello@tryskillbridge.com>",
      to: [email],
      subject: `Your Readiness Report: ${evaluation.score}/100 — ${roadmap.input.currentRole} → ${roadmap.input.targetRole}`,
      react: ReportEmail({
        targetRole: roadmap.input.targetRole,
        currentRole: roadmap.input.currentRole,
        score: evaluation.score,
        summary: evaluation.summary,
        strengths: evaluation.strengths.slice(0, 3),
        weaknesses: evaluation.weaknesses.slice(0, 3),
        topicsToStudy: evaluation.learningRoadmap?.topicsToStudy ?? [],
        reportUrl,
      }),
    });

    if (error) {
      console.error("[SendReport] Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Mark as sent (idempotent)
    await db.set(`report:emailed:${slug}`, "true", "EX", 90 * 86400);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SendReport] Failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
