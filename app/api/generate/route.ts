import { NextRequest, NextResponse } from "next/server";

// SkillBridge AI Engine — Foundational Route
// Generates personalized career roadmaps based on user input

interface RoadmapRequest {
  currentRole: string;
  targetRole: string;
  skills: string[];
  experience: number; // years
  preferences?: {
    pace: "aggressive" | "balanced" | "relaxed";
    focus: "technical" | "leadership" | "hybrid";
  };
}

interface RoadmapStep {
  phase: number;
  title: string;
  duration: string;
  skills: string[];
  resources: string[];
  milestone: string;
}

interface RoadmapResponse {
  roadmap: RoadmapStep[];
  estimatedTimeline: string;
  generatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RoadmapRequest = await request.json();

    // Validate foundational inputs
    if (!body.currentRole || !body.targetRole || !body.skills?.length) {
      return NextResponse.json(
        { error: "Missing required fields: currentRole, targetRole, skills" },
        { status: 400 }
      );
    }

    // Generate roadmap (placeholder logic — will integrate AI provider)
    const roadmap = generateRoadmap(body);

    return NextResponse.json(roadmap, { status: 200 });
  } catch (error) {
    console.error("[API Engine] Generation failed:", error);
    return NextResponse.json(
      { error: "Internal generation error" },
      { status: 500 }
    );
  }
}

function generateRoadmap(input: RoadmapRequest): RoadmapResponse {
  const pace = input.preferences?.pace ?? "balanced";
  const focus = input.preferences?.focus ?? "hybrid";

  const durationMultiplier =
    pace === "aggressive" ? 0.7 : pace === "relaxed" ? 1.4 : 1.0;

  const phases: RoadmapStep[] = [
    {
      phase: 1,
      title: "Foundation",
      duration: `${Math.round(3 * durationMultiplier)} months`,
      skills: identifyGapSkills(input.skills, input.targetRole),
      resources: ["Documentation deep-dive", "Hands-on projects"],
      milestone: `Core ${focus} competencies established`,
    },
    {
      phase: 2,
      title: "Execution",
      duration: `${Math.round(4 * durationMultiplier)} months`,
      skills: [`Advanced ${input.targetRole} patterns`, "System design"],
      resources: ["Real-world projects", "Open source contributions"],
      milestone: `Portfolio demonstrates ${input.targetRole} capability`,
    },
    {
      phase: 3,
      title: "Authority",
      duration: `${Math.round(3 * durationMultiplier)} months`,
      skills: ["Technical leadership", "Architecture decisions"],
      resources: ["Mentorship", "Conference talks", "Blog posts"],
      milestone: `Recognized as ${input.targetRole}`,
    },
  ];

  const totalMonths = phases.reduce((sum, p) => {
    return sum + parseInt(p.duration);
  }, 0);

  return {
    roadmap: phases,
    estimatedTimeline: `${totalMonths} months`,
    generatedAt: new Date().toISOString(),
  };
}

function identifyGapSkills(
  currentSkills: string[],
  targetRole: string
): string[] {
  // Placeholder — will be replaced by AI-driven skill gap analysis
  const roleSkillMap: Record<string, string[]> = {
    "Senior Frontend Engineer": [
      "Performance optimization",
      "Accessibility",
      "Design systems",
      "Testing strategy",
    ],
    "Staff Engineer": [
      "System design",
      "Cross-team influence",
      "Technical strategy",
      "Mentoring",
    ],
    "Engineering Manager": [
      "People management",
      "Project planning",
      "Stakeholder communication",
      "Hiring",
    ],
  };

  const targetSkills = roleSkillMap[targetRole] ?? [
    "Domain expertise",
    "Leadership",
    "System thinking",
  ];
  return targetSkills.filter(
    (s) => !currentSkills.map((c) => c.toLowerCase()).includes(s.toLowerCase())
  );
}
