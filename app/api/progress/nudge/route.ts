import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, loadProgress } from "@/lib/progress";
import { getRedis } from "@/lib/redis";
import { getResend } from "@/lib/resend";
import { verifyCron } from "@/lib/cron";
import type { SavedRoadmap } from "@/lib/types";
import NudgeEmail from "@/emails/NudgeEmail";

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscribers = await getSubscribers();
    const db = getRedis();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";
    let sent = 0;
    let failed = 0;

    for (const { email, slug } of subscribers) {
      try {
        // Load roadmap data
        const roadmapRaw = await db.get(`roadmap:${slug}`);
        if (!roadmapRaw) continue;
        const roadmap = JSON.parse(roadmapRaw) as SavedRoadmap;

        // Load progress
        const progress = await loadProgress(email, slug);
        const completedSkills = progress?.completedSkills || [];
        const totalSkills = roadmap.result.roadmap.reduce((n, s) => n + s.skills.length, 0);
        const overallPercent = totalSkills > 0 ? Math.round((completedSkills.length / totalSkills) * 100) : 0;

        // Find current phase and next skill
        let currentPhase = 1;
        let nextSkill = "";
        for (const step of roadmap.result.roadmap) {
          const phaseCompleted = step.skills.every((s) => completedSkills.includes(s));
          if (!phaseCompleted) {
            currentPhase = step.phase;
            nextSkill = step.skills.find((s) => !completedSkills.includes(s)) || "";
            break;
          }
        }

        await getResend().emails.send({
          from: "SkillBridge <noreply@tryskillbridge.com>",
          to: email,
          subject: `You're ${overallPercent}% through your ${roadmap.input.targetRole} roadmap 🚀`,
          react: NudgeEmail({
            targetRole: roadmap.input.targetRole,
            overallPercent,
            currentPhase,
            nextSkill,
            roadmapUrl: `${baseUrl}/r/${slug}`,
            unsubscribeUrl: `${baseUrl}/r/${slug}?unsubscribe=true&email=${encodeURIComponent(email)}`,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`Nudge failed for ${email}:${slug}`, err);
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, total: subscribers.length });
  } catch (err) {
    console.error("Nudge cron error:", err);
    return NextResponse.json({ error: "Nudge cron failed" }, { status: 500 });
  }
}
