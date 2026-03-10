import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import OpenAI from "openai";
import {
  CAREER_PROFILES,
  matchCareerProfile,
  inferSeniority,
} from "@/lib/career-data";

const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 24;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:generate:${ip}`;
  const db = getRedis();
  const count = await db.incr(key);
  if (count === 1) await db.expire(key, RATE_WINDOW);
  return {
    allowed: count <= RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - count),
  };
}

interface RoadmapRequest {
  currentRole: string;
  targetRole: string;
  skills: string[];
  experience: number;
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
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { allowed, remaining } = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. You can generate up to 3 blueprints per 24 hours.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(RATE_WINDOW),
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body: RoadmapRequest = await request.json();

    if (!body.targetRole?.trim()) {
      return NextResponse.json(
        { error: "Please provide your target role." },
        { status: 400 }
      );
    }

    const roadmap = await generateRoadmap(body);

    return NextResponse.json(roadmap, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    console.error("[API Engine] Generation failed:", error);
    return NextResponse.json(
      { error: "Internal generation error" },
      { status: 500 }
    );
  }
}

async function generateRoadmap(
  input: RoadmapRequest
): Promise<RoadmapResponse> {
  const seniority = inferSeniority(
    input.experience,
    input.currentRole || "Career Starter"
  );
  const profileKey = matchCareerProfile(input.targetRole);
  const profile = profileKey ? CAREER_PROFILES[profileKey] : null;

  // Build context for the LLM from our career intelligence database
  let profileContext = "";
  if (profile) {
    profileContext = `
Reference career profile (use as a starting point, personalize based on the user's specific situation):
- Category: ${profile.category}
- Foundation skills: ${profile.foundation.skills.join(", ")}
- Execution skills: ${profile.execution.skills.join(", ")}
- Authority skills: ${profile.authority.skills.join(", ")}
- Foundation resources: ${profile.foundation.resources.map((r) => `${r.name} (${r.type})`).join(", ")}
- Execution resources: ${profile.execution.resources.map((r) => `${r.name} (${r.type})`).join(", ")}
- Authority resources: ${profile.authority.resources.map((r) => `${r.name} (${r.type})`).join(", ")}
- Seniority modifiers for ${seniority}: duration multiplier ${profile.seniorityModifiers[seniority].durationMult}x, extra foundation skills: ${profile.seniorityModifiers[seniority].extraFoundationSkills.join(", ") || "none"}`;
  }

  const pace = input.preferences?.pace ?? "balanced";
  const focus = input.preferences?.focus ?? "hybrid";

  const systemPrompt = `You are SkillBridge, an expert career architect. You generate hyper-personalized 3-phase career roadmaps.

Your output must be a valid JSON object matching this exact schema:
{
  "roadmap": [
    {
      "phase": 1,
      "title": "Foundation",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, measurable milestone"
    },
    {
      "phase": 2,
      "title": "Execution",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, measurable milestone"
    },
    {
      "phase": 3,
      "title": "Authority",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, measurable milestone"
    }
  ],
  "estimatedTimeline": "X months"
}

Rules:
- Each phase MUST have exactly 5 skills and exactly 4 resources
- Resources must start with an emoji: 🎓 for courses, 📚 for books, 🔨 for hands-on practice, 👥 for communities/mentorship
- Skills the user already has should NOT appear — identify genuine gaps
- Duration must account for seniority (${seniority}) and pace preference (${pace})
- Milestones must be specific and measurable — not vague ("Ship X" not "Learn X")
- Resources must be REAL (actual course names, actual book titles, actual communities)
- Tailor everything to the specific transition from "${input.currentRole}" to "${input.targetRole}"
- Focus preference: ${focus}
- Output ONLY the JSON object, no markdown, no explanation`;

  const userPrompt = `Generate a career roadmap for this person:

Current Role: ${input.currentRole || "Career Starter"}
Target Role: ${input.targetRole}
Current Skills: ${input.skills?.length ? input.skills.join(", ") : "Not specified"}
Years of Experience: ${input.experience || 0}
Pace: ${pace}
Focus: ${focus}
Inferred Seniority: ${seniority}
${profileContext}

Generate a deeply personalized 3-phase roadmap. Remove any skills they already have. Be specific with resource names — use real courses, books, and communities.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);

    // Validate structure
    if (
      !parsed.roadmap ||
      !Array.isArray(parsed.roadmap) ||
      parsed.roadmap.length !== 3
    ) {
      throw new Error("Invalid roadmap structure");
    }

    // Ensure all fields exist
    for (const step of parsed.roadmap) {
      if (
        !step.phase ||
        !step.title ||
        !step.duration ||
        !Array.isArray(step.skills) ||
        !Array.isArray(step.resources) ||
        !step.milestone
      ) {
        throw new Error("Invalid step structure");
      }
    }

    return {
      roadmap: parsed.roadmap,
      estimatedTimeline:
        parsed.estimatedTimeline ||
        `${parsed.roadmap.reduce((sum: number, s: RoadmapStep) => sum + parseInt(s.duration), 0)} months`,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AI Engine] OpenAI call failed, falling back:", error);
    // Fall back to template-based generation
    return fallbackGenerate(input, seniority, profile, pace, focus);
  }
}

/**
 * Template-based fallback if OpenAI is unavailable
 */
function fallbackGenerate(
  input: RoadmapRequest,
  seniority: "junior" | "mid" | "senior",
  profile: (typeof CAREER_PROFILES)[string] | null,
  pace: string,
  focus: string
): RoadmapResponse {
  const paceMult =
    pace === "aggressive" ? 0.7 : pace === "relaxed" ? 1.4 : 1.0;

  if (profile) {
    const senMod = profile.seniorityModifiers[seniority];
    const totalMult = paceMult * senMod.durationMult;
    const userSkillsLower = (input.skills || []).map((s) =>
      s.toLowerCase().trim()
    );

    function filterKnownSkills(skills: string[]): string[] {
      return skills.filter(
        (s) =>
          !userSkillsLower.some(
            (us) =>
              s.toLowerCase().includes(us) || us.includes(s.toLowerCase())
          )
      );
    }

    const foundationSkills = filterKnownSkills([
      ...senMod.extraFoundationSkills,
      ...profile.foundation.skills,
    ]).slice(0, 5);
    const executionSkills = filterKnownSkills(profile.execution.skills).slice(
      0,
      5
    );
    const authoritySkills = filterKnownSkills(profile.authority.skills).slice(
      0,
      5
    );

    const fComp = foundationSkills.length <= 2 ? 0.6 : 1.0;
    const fDur = Math.max(
      1,
      Math.round(profile.foundation.baseDurationMonths * totalMult * fComp)
    );
    const eDur = Math.max(
      2,
      Math.round(profile.execution.baseDurationMonths * totalMult)
    );
    const aDur = Math.max(
      2,
      Math.round(profile.authority.baseDurationMonths * totalMult)
    );

    const icons: Record<string, string> = {
      course: "🎓",
      book: "📚",
      practice: "🔨",
      community: "👥",
    };
    const fmt = (r: { name: string; type: string }) =>
      `${icons[r.type] || "→"} ${r.name}`;

    return {
      roadmap: [
        {
          phase: 1,
          title: "Foundation",
          duration: `${fDur} month${fDur !== 1 ? "s" : ""}`,
          skills:
            foundationSkills.length > 0
              ? foundationSkills
              : [
                  "Solidify existing fundamentals",
                  "Fill specific knowledge gaps",
                ],
          resources: profile.foundation.resources.map(fmt),
          milestone: profile.foundation.milestone,
        },
        {
          phase: 2,
          title: "Execution",
          duration: `${eDur} months`,
          skills:
            executionSkills.length > 0
              ? executionSkills
              : profile.execution.skills.slice(0, 4),
          resources: profile.execution.resources.map(fmt),
          milestone: profile.execution.milestone,
        },
        {
          phase: 3,
          title: "Authority",
          duration: `${aDur} months`,
          skills:
            authoritySkills.length > 0
              ? authoritySkills
              : profile.authority.skills.slice(0, 4),
          resources: profile.authority.resources.map(fmt),
          milestone: profile.authority.milestone,
        },
      ],
      estimatedTimeline: `${fDur + eDur + aDur} months`,
      generatedAt: new Date().toISOString(),
    };
  }

  // Generic fallback
  const target = input.targetRole;
  const senMult =
    seniority === "junior" ? 1.5 : seniority === "senior" ? 0.7 : 1.0;
  const totalMult = paceMult * senMult;

  const fDur = Math.max(1, Math.round(3 * totalMult));
  const eDur = Math.max(2, Math.round(5 * totalMult));
  const aDur = Math.max(2, Math.round(4 * totalMult));

  return {
    roadmap: [
      {
        phase: 1,
        title: "Foundation",
        duration: `${fDur} month${fDur !== 1 ? "s" : ""}`,
        skills: [
          `Core ${target} competencies`,
          "Industry best practices",
          `Gap analysis: current → ${target}`,
          "Foundational tools & frameworks",
          `${focus === "leadership" ? "Communication skills" : "Technical fundamentals"}`,
        ],
        resources: [
          `🎓 Top-rated courses for ${target}`,
          `📚 2-3 foundational books in the field`,
          `🔨 Build a portfolio project`,
          `👥 Join ${target} communities`,
        ],
        milestone: `Demonstrate foundational ${target} knowledge through a portfolio piece`,
      },
      {
        phase: 2,
        title: "Execution",
        duration: `${eDur} months`,
        skills: [
          `Advanced ${target} skills`,
          "Real-world project delivery",
          "Cross-functional collaboration",
          "Metrics-driven decisions",
          "Problem-solving at scale",
        ],
        resources: [
          `🔨 Take on ${target}-level responsibilities`,
          "🔨 Contribute to open-source projects",
          "📚 Study industry case studies",
          "👥 Find a mentor in the role",
        ],
        milestone: `Your output is at ${target} level with concrete results`,
      },
      {
        phase: 3,
        title: "Authority",
        duration: `${aDur} months`,
        skills: [
          "Thought leadership",
          "Strategic thinking",
          "Mentoring others",
          "Industry networking",
          "Executive communication",
        ],
        resources: [
          "🔨 Write about your expertise publicly",
          "👥 Speak at meetups or events",
          "👥 Mentor 2+ people",
          "🔨 Lead a significant initiative",
        ],
        milestone: `Recognized as a ${target} by peers and industry`,
      },
    ],
    estimatedTimeline: `${fDur + eDur + aDur} months`,
    generatedAt: new Date().toISOString(),
  };
}
