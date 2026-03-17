import { NextRequest, NextResponse } from "next/server";
import { saveProgress } from "@/lib/progress";

export async function POST(req: NextRequest) {
  try {
    const { email, slug, completedSkills, completedMilestones } = await req.json();

    if (!email || !slug) {
      return NextResponse.json({ error: "email and slug are required" }, { status: 400 });
    }

    // Validate input sizes to prevent Redis bloat
    const skills = Array.isArray(completedSkills) ? completedSkills.slice(0, 50) : [];
    const milestones = Array.isArray(completedMilestones)
      ? completedMilestones.filter((m: unknown) => typeof m === "number" && m >= 1 && m <= 10).slice(0, 10)
      : [];

    const data = await saveProgress(email, slug, skills, milestones);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
