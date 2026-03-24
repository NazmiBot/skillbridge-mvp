import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import {
  CAREER_PROFILES,
  matchCareerProfile,
  inferSeniority,
} from "@/lib/career-data";
import { getAnthropic } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { validateJobTitle } from "@/lib/validate-input";

const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 24;

// IPs exempt from rate limiting (owner/dev testing)
const RATE_LIMIT_WHITELIST = new Set(
  (process.env.RATE_LIMIT_WHITELIST || "").split(",").map((s) => s.trim()).filter(Boolean)
);

async function checkGenerateRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (RATE_LIMIT_WHITELIST.has(ip)) {
    return { allowed: true, remaining: RATE_LIMIT };
  }
  return checkRateLimit("generate", ip, RATE_LIMIT, RATE_WINDOW);
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
    const ip = getClientIp(request);

    const { allowed, remaining } = await checkGenerateRateLimit(ip);
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

    // 🛡️ Validate inputs before burning Anthropic tokens
    const targetCheck = validateJobTitle(body.targetRole, "Target role");
    if (!targetCheck.valid) {
      return NextResponse.json({ error: targetCheck.error }, { status: 400 });
    }

    if (body.currentRole?.trim()) {
      const currentCheck = validateJobTitle(body.currentRole, "Current role");
      if (!currentCheck.valid) {
        return NextResponse.json({ error: currentCheck.error }, { status: 400 });
      }
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

  const systemPrompt = `You are SkillBridge, a friendly career coach who helps people change careers. You create personalized 3-phase career roadmaps that anyone can follow — even if they've never worked in the target field before.

Write everything at an 8th-grade reading level. Use plain, simple language. No jargon or buzzwords unless the job absolutely requires knowing them.

Your output must be a valid JSON object matching this exact schema:
{
  "roadmap": [
    {
      "phase": 1,
      "title": "Learn the Basics",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, achievable milestone"
    },
    {
      "phase": 2,
      "title": "Build Real Experience",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, achievable milestone"
    },
    {
      "phase": 3,
      "title": "Become the Expert",
      "duration": "X months",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "resources": ["emoji resourceName", "emoji resourceName", "emoji resourceName", "emoji resourceName"],
      "milestone": "A specific, achievable milestone"
    }
  ],
  "estimatedTimeline": "X months"
}

Rules:
- Each phase MUST have exactly 5 skills and exactly 4 resources
- Resources must start with an emoji: 🎓 for courses, 📚 for books, 🔨 for hands-on practice, 👥 for communities/mentorship
- Skills the user already has should NOT appear — identify genuine gaps
- IMPORTANT: Identify transferable skills from the user's current role ("${input.currentRole}") and acknowledge them. A teacher has communication skills. A barista has customer service skills. Build on what they already know.
- Duration must account for seniority (${seniority}) and pace preference (${pace})
- Milestones must be specific and feel achievable — not intimidating. Use "Complete X" or "Get your first Y" instead of demanding language.
- Resources must be REAL and accessible: free YouTube channels, affordable online courses, books available at any library, practical projects anyone can do at home
- Tailor everything to the specific transition from "${input.currentRole}" to "${input.targetRole}"
- Focus preference: ${focus}
- Describe every skill in plain language a non-expert would understand
- Output ONLY the JSON object, no markdown, no explanation. Do not wrap the JSON in markdown code fences.`;

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
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      system: systemPrompt,
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: "user", content: userPrompt },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") throw new Error("Non-text response from AI");
    const content = block.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
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
    console.error("[AI Engine] Anthropic call failed, falling back:", error);
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
          title: "Learn the Basics",
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
          title: "Build Real Experience",
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
          title: "Become the Expert",
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
        title: "Learn the Basics",
        duration: `${fDur} month${fDur !== 1 ? "s" : ""}`,
        skills: [
          `Core ${target} knowledge and vocabulary`,
          "Industry best practices and standards",
          `Understanding the gap between your current role and ${target}`,
          "Essential tools used in the field",
          `${focus === "leadership" ? "Communication and people skills" : "Key technical skills for the role"}`,
        ],
        resources: [
          `🎓 Top-rated beginner courses for ${target}`,
          `📚 2-3 beginner-friendly books in the field`,
          `🔨 Build a starter project or portfolio piece`,
          `👥 Join ${target} communities and forums`,
        ],
        milestone: `Show you understand the basics of ${target} through a portfolio piece or project`,
      },
      {
        phase: 2,
        title: "Build Real Experience",
        duration: `${eDur} months`,
        skills: [
          `Intermediate ${target} skills`,
          "Hands-on project delivery",
          "Working with other teams and departments",
          "Tracking your results with numbers",
          "Solving real problems in the field",
        ],
        resources: [
          `🔨 Take on real ${target} responsibilities (volunteer, freelance, or at work)`,
          "🔨 Work on a real project with measurable results",
          "📚 Study real-world examples and case studies",
          "👥 Find a mentor who works in the role",
        ],
        milestone: `You're doing ${target}-level work with real results to show for it`,
      },
      {
        phase: 3,
        title: "Become the Expert",
        duration: `${aDur} months`,
        skills: [
          "Sharing your knowledge with others",
          "Strategic thinking and planning",
          "Teaching and mentoring newcomers",
          "Building your professional network",
          "Communicating with leadership",
        ],
        resources: [
          "🔨 Write about what you've learned (blog, LinkedIn, etc.)",
          "👥 Speak at a meetup or event",
          "👥 Mentor 2+ people who are earlier in their journey",
          "🔨 Lead an important project or initiative",
        ],
        milestone: `People recognize you as a skilled ${target} — peers and leaders trust your expertise`,
      },
    ],
    estimatedTimeline: `${fDur + eDur + aDur} months`,
    generatedAt: new Date().toISOString(),
  };
}
