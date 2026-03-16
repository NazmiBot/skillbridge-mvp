import { NextRequest, NextResponse } from "next/server";
import { saveProgress } from "@/lib/progress";

export async function POST(req: NextRequest) {
  try {
    const { email, slug, completedSkills, completedMilestones } = await req.json();

    if (!email || !slug) {
      return NextResponse.json({ error: "email and slug are required" }, { status: 400 });
    }

    const data = await saveProgress(
      email,
      slug,
      completedSkills || [],
      completedMilestones || []
    );

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
