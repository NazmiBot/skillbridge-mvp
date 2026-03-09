import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";

type Params = Promise<{ slug: string }>;

interface InterviewQuestion {
  question: string;
  category: string;
  tip: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { slug } = await params;
    const db = getRedis();

    // Check payment status
    const paid = await db.get(`interview:paid:${slug}`);
    if (paid !== "true") {
      return NextResponse.json(
        { error: "Interview not purchased", requiresPayment: true },
        { status: 403 }
      );
    }

    // Load roadmap for context
    const raw = await db.get(`roadmap:${slug}`);
    if (!raw) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const roadmap: SavedRoadmap = JSON.parse(raw);
    const { input, result } = roadmap;

    // Generate interview questions based on roadmap
    const questions = generateQuestions(
      input.currentRole,
      input.targetRole,
      input.skills,
      result.roadmap.flatMap((step) => step.skills)
    );

    return NextResponse.json({ questions, targetRole: input.targetRole });
  } catch (error) {
    console.error("[Interview] Failed:", error);
    return NextResponse.json({ error: "Failed to load interview" }, { status: 500 });
  }
}

function generateQuestions(
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  roadmapSkills: string[]
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [
    {
      question: `Tell me about your journey from ${currentRole} and why you're targeting a ${targetRole} position.`,
      category: "Background",
      tip: "Structure your answer chronologically. Highlight key growth moments and what drives your ambition.",
    },
    {
      question: `You listed ${currentSkills.slice(0, 3).join(", ")} as your current skills. How have you applied these in a challenging project?`,
      category: "Technical Depth",
      tip: "Use the STAR method: Situation, Task, Action, Result. Be specific about your contribution.",
    },
    {
      question: `A ${targetRole} needs to master ${roadmapSkills.slice(0, 2).join(" and ")}. What's your plan to develop these skills?`,
      category: "Growth Plan",
      tip: "Show self-awareness about your gaps. Mention specific resources, timelines, and how you'll measure progress.",
    },
    {
      question: `Describe a time you had to influence a technical decision without having direct authority.`,
      category: "Leadership",
      tip: "Focus on communication strategy, how you built consensus, and the outcome. This tests soft skills critical for senior roles.",
    },
    {
      question: `How would you handle a situation where your team disagrees on the architecture for a critical system?`,
      category: "Conflict Resolution",
      tip: "Demonstrate you can facilitate productive debate, weigh trade-offs objectively, and commit to a decision.",
    },
    {
      question: `What does success look like for you 12 months into a ${targetRole} role?`,
      category: "Vision",
      tip: "Be concrete: mention metrics, team impact, and personal milestones. Show you've thought deeply about the role.",
    },
  ];

  return questions;
}
