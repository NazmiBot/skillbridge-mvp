import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import {
  CAREER_PROFILES,
  matchCareerProfile,
  inferSeniority,
  type CareerProfile,
} from "@/lib/career-data";

// SkillBridge AI Engine — Career Roadmap Generator
// Rich, role-aware generation with 15+ career profiles and intelligent matching

const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 24; // 24h

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

    const roadmap = generateRoadmap(body);

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

function generateRoadmap(input: RoadmapRequest): RoadmapResponse {
  const pace = input.preferences?.pace ?? "balanced";
  const paceMult =
    pace === "aggressive" ? 0.7 : pace === "relaxed" ? 1.4 : 1.0;

  const seniority = inferSeniority(
    input.experience,
    input.currentRole || "Career Starter"
  );
  const profileKey = matchCareerProfile(input.targetRole);

  if (profileKey) {
    return buildFromProfile(
      CAREER_PROFILES[profileKey],
      input,
      seniority,
      paceMult
    );
  }

  // Fallback: intelligent generic roadmap
  return buildGenericRoadmap(input, seniority, paceMult);
}

function buildFromProfile(
  profile: CareerProfile,
  input: RoadmapRequest,
  seniority: "junior" | "mid" | "senior",
  paceMult: number
): RoadmapResponse {
  const senMod = profile.seniorityModifiers[seniority];
  const totalMult = paceMult * senMod.durationMult;

  // Filter out skills the user already has
  const userSkillsLower = (input.skills || []).map((s) => s.toLowerCase().trim());

  function filterKnownSkills(skills: string[]): string[] {
    return skills.filter(
      (s) =>
        !userSkillsLower.some(
          (us) => s.toLowerCase().includes(us) || us.includes(s.toLowerCase())
        )
    );
  }

  // Build foundation skills: profile foundation + seniority extras, minus what they know
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

  // If they already know most foundation skills, compress that phase
  const foundationCompression =
    foundationSkills.length <= 2 ? 0.6 : 1.0;

  const fDur = Math.max(
    1,
    Math.round(profile.foundation.baseDurationMonths * totalMult * foundationCompression)
  );
  const eDur = Math.max(
    2,
    Math.round(profile.execution.baseDurationMonths * totalMult)
  );
  const aDur = Math.max(
    2,
    Math.round(profile.authority.baseDurationMonths * totalMult)
  );

  const formatResource = (r: { name: string; type: string }): string => {
    const icons: Record<string, string> = {
      course: "🎓",
      book: "📚",
      practice: "🔨",
      community: "👥",
    };
    return `${icons[r.type] || "→"} ${r.name}`;
  };

  const phases: RoadmapStep[] = [
    {
      phase: 1,
      title: "Foundation",
      duration: `${fDur} month${fDur !== 1 ? "s" : ""}`,
      skills:
        foundationSkills.length > 0
          ? foundationSkills
          : ["Solidify existing fundamentals", "Fill specific knowledge gaps"],
      resources: profile.foundation.resources.map(formatResource),
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
      resources: profile.execution.resources.map(formatResource),
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
      resources: profile.authority.resources.map(formatResource),
      milestone: profile.authority.milestone,
    },
  ];

  const totalMonths = fDur + eDur + aDur;

  return {
    roadmap: phases,
    estimatedTimeline: `${totalMonths} months`,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Fallback for roles not in our profile database.
 * Still generates a useful, personalized roadmap.
 */
function buildGenericRoadmap(
  input: RoadmapRequest,
  seniority: "junior" | "mid" | "senior",
  paceMult: number
): RoadmapResponse {
  const senMult =
    seniority === "junior" ? 1.5 : seniority === "senior" ? 0.7 : 1.0;
  const totalMult = paceMult * senMult;

  const target = input.targetRole;
  const current = input.currentRole || "your current role";

  const fDur = Math.max(1, Math.round(3 * totalMult));
  const eDur = Math.max(2, Math.round(5 * totalMult));
  const aDur = Math.max(2, Math.round(4 * totalMult));

  const juniorExtras =
    seniority === "junior"
      ? [
          "Core fundamentals of the field",
          "Professional networking & mentorship",
        ]
      : [];

  const phases: RoadmapStep[] = [
    {
      phase: 1,
      title: "Foundation",
      duration: `${fDur} month${fDur !== 1 ? "s" : ""}`,
      skills: [
        ...juniorExtras,
        `Core ${target} competencies & terminology`,
        `Gap analysis: ${current} → ${target}`,
        "Industry best practices & standards",
      ].slice(0, 5),
      resources: [
        `🎓 Research top-rated courses for ${target} roles`,
        `📚 Read 2-3 foundational books in the field`,
        `🔨 Build a portfolio project relevant to ${target}`,
        `👥 Join communities & forums for ${target} professionals`,
      ],
      milestone: `Demonstrate foundational knowledge required for ${target} through a portfolio piece or certification`,
    },
    {
      phase: 2,
      title: "Execution",
      duration: `${eDur} months`,
      skills: [
        `Advanced ${target} skills & tooling`,
        "Real-world project delivery at scale",
        "Cross-functional collaboration",
        "Problem-solving in ambiguous situations",
        "Metrics-driven decision making",
      ],
      resources: [
        `🔨 Take on ${target}-level responsibilities at work or freelance`,
        "🔨 Contribute to open-source or community projects",
        "📚 Study case studies from industry leaders",
        "👥 Find a mentor who is currently in a similar role",
      ],
      milestone: `Your work output is at ${target} level — you have concrete results to point to`,
    },
    {
      phase: 3,
      title: "Authority",
      duration: `${aDur} months`,
      skills: [
        "Thought leadership & public presence",
        "Strategic thinking & vision",
        "Mentoring & knowledge sharing",
        "Industry networking & reputation building",
        "Executive communication skills",
      ],
      resources: [
        "🔨 Write about your expertise (blog, LinkedIn, Medium)",
        "👥 Speak at meetups or industry events",
        "👥 Mentor 2+ people in earlier career stages",
        "🔨 Lead a significant initiative from proposal to completion",
      ],
      milestone: `You're recognized as a ${target} — peers, leadership, and the industry see you as one`,
    },
  ];

  const totalMonths = fDur + eDur + aDur;

  return {
    roadmap: phases,
    estimatedTimeline: `${totalMonths} months`,
    generatedAt: new Date().toISOString(),
  };
}
