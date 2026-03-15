import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import { CAREER_PROFILES, matchCareerProfile } from "@/lib/career-data";
import { randomBytes } from "crypto";

interface ScoreRequest {
  currentRole: string;
  targetRole: string;
  skills: string[];
  experience: number;
}

interface ScoreResult {
  id: string;
  score: number;
  label: string;
  currentRole: string;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit("score", ip, 20, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body: ScoreRequest = await request.json();
    if (!body.targetRole?.trim()) {
      return NextResponse.json({ error: "Target role required" }, { status: 400 });
    }

    const userSkills = (body.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
    const profileKey = matchCareerProfile(body.targetRole);
    const profile = profileKey ? CAREER_PROFILES[profileKey] : null;

    let allRequired: string[] = [];
    if (profile) {
      allRequired = [
        ...profile.foundation.skills,
        ...profile.execution.skills,
        ...profile.authority.skills,
      ];
    } else {
      // Generic fallback — use target role name to generate generic skills
      allRequired = [
        `Core ${body.targetRole} fundamentals`,
        "Industry best practices",
        "Cross-functional collaboration",
        "Strategic thinking",
        "Technical leadership",
        "Metrics-driven decision making",
        "Stakeholder management",
        "System design",
        "Project delivery",
        "Mentoring & coaching",
      ];
    }

    const matched: string[] = [];
    const missing: string[] = [];

    for (const req of allRequired) {
      const reqLower = req.toLowerCase();
      const isMatched = userSkills.some(
        (us) => reqLower.includes(us) || us.includes(reqLower.split(" ")[0])
      );
      if (isMatched) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }

    // Score: base from skill match + experience bonus
    const skillScore = allRequired.length > 0 ? (matched.length / allRequired.length) * 80 : 30;
    const expBonus = Math.min(20, (body.experience || 0) * 2.5);
    const rawScore = Math.round(skillScore + expBonus);
    const score = Math.min(99, Math.max(5, rawScore)); // Never 0 or 100

    const label =
      score >= 80 ? "Excellent" : score >= 60 ? "Strong" : score >= 40 ? "Developing" : "Early Stage";

    const id = randomBytes(6).toString("hex");
    const result: ScoreResult = {
      id,
      score,
      label,
      currentRole: body.currentRole || "Career Starter",
      targetRole: body.targetRole,
      matchedSkills: matched.slice(0, 5),
      missingSkills: missing.slice(0, 5),
      totalRequired: allRequired.length,
      createdAt: new Date().toISOString(),
    };

    const db = getRedis();
    await db.set(`score:${id}`, JSON.stringify(result), "EX", 30 * 86400);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Score] Failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
