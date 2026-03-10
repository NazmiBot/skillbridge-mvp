import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";
import OpenAI from "openai";
import { matchCareerProfile, CAREER_PROFILES } from "@/lib/career-data";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

    // Check for cached questions
    const cached = await db.get(`interview:questions:${slug}`);
    if (cached) {
      const data = JSON.parse(cached);
      return NextResponse.json(data);
    }

    // Load roadmap for context
    const raw = await db.get(`roadmap:${slug}`);
    if (!raw) {
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    const roadmap: SavedRoadmap = JSON.parse(raw);
    const { input, result } = roadmap;

    const questions = await generateQuestions(
      input.currentRole,
      input.targetRole,
      input.skills,
      result.roadmap.flatMap((step) => step.skills)
    );

    const responseData = { questions, targetRole: input.targetRole };

    // Cache for 30 days (paid content should persist)
    await db.set(
      `interview:questions:${slug}`,
      JSON.stringify(responseData),
      "EX",
      60 * 60 * 24 * 30
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Interview] Failed:", error);
    return NextResponse.json(
      { error: "Failed to load interview" },
      { status: 500 }
    );
  }
}

async function generateQuestions(
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  roadmapSkills: string[]
): Promise<InterviewQuestion[]> {
  const profileKey = matchCareerProfile(targetRole);
  const profile = profileKey ? CAREER_PROFILES[profileKey] : null;

  const categoryContext = profile
    ? `Career category: ${profile.category}. Key authority skills: ${profile.authority.skills.join(", ")}.`
    : "";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert career interview coach. Generate personalized mock interview questions for someone transitioning careers.

Output a JSON array of exactly 6 interview question objects. Each must have:
- "question": A specific, challenging interview question (not generic)
- "category": Short category label (e.g., "Technical Depth", "Leadership", "System Design", "Career Narrative")
- "tip": Actionable coaching advice for answering well (2-3 sentences, practical, specific)

Rules:
- Questions must be specifically tailored to the ${currentRole} → ${targetRole} transition
- Reference their actual skills (${currentSkills.join(", ")}) and the skills they need to develop
- Include a mix: 1 background/narrative, 2-3 role-specific technical/domain, 1 behavioral/leadership, 1 vision/future
- Tips should teach interview technique, not just say "be specific" — give frameworks (STAR, etc.)
- Questions should be ones a real hiring manager for ${targetRole} would ask
- Make questions progressively harder (start accessible, end challenging)

Output ONLY the JSON array, no markdown.`,
        },
        {
          role: "user",
          content: `Generate 6 interview questions for:
Current Role: ${currentRole || "Career Starter"}
Target Role: ${targetRole}
Current Skills: ${currentSkills.join(", ") || "Not specified"}
Roadmap Skills to Develop: ${roadmapSkills.slice(0, 8).join(", ")}
${categoryContext}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    // Handle both { questions: [...] } and direct array
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;

    if (!Array.isArray(questions) || questions.length < 3) {
      throw new Error("Invalid questions structure");
    }

    return questions.slice(0, 6);
  } catch (error) {
    console.error("[Interview AI] Falling back to templates:", error);
    return fallbackQuestions(currentRole, targetRole, currentSkills, roadmapSkills);
  }
}

function fallbackQuestions(
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  roadmapSkills: string[]
): InterviewQuestion[] {
  const profileKey = matchCareerProfile(targetRole);
  const profile = profileKey ? CAREER_PROFILES[profileKey] : null;

  const core: InterviewQuestion[] = [
    {
      question: `Walk me through your career trajectory from ${currentRole} to wanting to become a ${targetRole}. What's been the most pivotal moment?`,
      category: "Career Narrative",
      tip: "Don't just list jobs chronologically. Identify the inflection point — what shifted your trajectory. Interviewers want to see self-awareness and intentionality.",
    },
    {
      question: `You have experience with ${currentSkills.slice(0, 3).join(", ") || "your current tech stack"}. Tell me about a time one of these skills was critical to solving a hard problem.`,
      category: "Technical Depth",
      tip: "Pick your best war story. Use STAR (Situation, Task, Action, Result) but keep the Situation brief — spend 70% on Action and Result. Quantify the impact.",
    },
  ];

  const roleSpecific: InterviewQuestion[] = [];
  const category = profile?.category;

  if (category === "engineering" || category === "devops" || category === "security") {
    roleSpecific.push(
      {
        question: `You'll need to develop ${roadmapSkills.slice(0, 2).join(" and ")}. Walk me through how you'd approach learning a complex technical topic you've never touched before.`,
        category: "Learning Ability",
        tip: "Show your learning system — not just 'I'd Google it.' Mention specific strategies: reading source code, building toy projects, teaching it back, finding mentors.",
      },
      {
        question: `Describe a system you designed or significantly contributed to. What were the key trade-offs?`,
        category: "System Design",
        tip: "The 'what would you change' part is the real test. It shows intellectual honesty and growth. Don't just describe — analyze your own decisions critically.",
      }
    );
  } else if (category === "management") {
    roleSpecific.push(
      {
        question: `Two strong engineers on your team have a fundamental disagreement about architecture. How do you resolve it?`,
        category: "Conflict Resolution",
        tip: "Show you can facilitate, not just dictate. Mention creating a decision framework, ensuring both feel heard, and making a timely call when consensus isn't possible.",
      },
      {
        question: `Your team's velocity has dropped 30% over two quarters. What's your diagnostic process?`,
        category: "Team Performance",
        tip: "Don't jump to solutions. Walk through your investigation: 1:1s, process review, tech debt assessment, morale check. Systematic thinking beats gut reactions.",
      }
    );
  } else if (category === "product") {
    roleSpecific.push(
      {
        question: `Walk me through how you'd prioritize a backlog with 50 items, conflicting stakeholders, and a tight deadline.`,
        category: "Prioritization",
        tip: "Name your framework (RICE, ICE) but show it's a tool, not a religion. Mention stakeholder alignment and communicating the 'why' behind cuts.",
      },
      {
        question: `Describe a product you launched that failed. What did you learn?`,
        category: "Failure & Learning",
        tip: "Authenticity wins. Don't pick a fake failure. Describe what went wrong, what you'd do differently, and how it changed your process.",
      }
    );
  } else {
    roleSpecific.push(
      {
        question: `A ${targetRole} needs to master ${roadmapSkills.slice(0, 2).join(" and ")}. What's your concrete plan?`,
        category: "Growth Plan",
        tip: "Be specific: name courses, projects, mentors, and milestones. Vague answers like 'I'll practice more' don't inspire confidence.",
      },
      {
        question: `Describe a time you had to influence a decision without having direct authority.`,
        category: "Influence",
        tip: "This tests soft skills. Focus on communication strategy, understanding others' concerns, and the outcome. Evidence of empathy wins.",
      }
    );
  }

  const closing: InterviewQuestion = {
    question: `It's 12 months from now and you've been in the ${targetRole} role. What does success look like?`,
    category: "Vision",
    tip: "Be concrete and ambitious but realistic. Mention specific deliverables, team impact, and personal growth milestones.",
  };

  return [...core, ...roleSpecific, closing];
}
