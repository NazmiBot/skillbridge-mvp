import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap } from "@/lib/types";
import { matchCareerProfile, CAREER_PROFILES } from "@/lib/career-data";

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
      return NextResponse.json(
        { error: "Roadmap not found" },
        { status: 404 }
      );
    }

    const roadmap: SavedRoadmap = JSON.parse(raw);
    const { input, result } = roadmap;

    const questions = generateQuestions(
      input.currentRole,
      input.targetRole,
      input.skills,
      result.roadmap.flatMap((step) => step.skills)
    );

    return NextResponse.json({ questions, targetRole: input.targetRole });
  } catch (error) {
    console.error("[Interview] Failed:", error);
    return NextResponse.json(
      { error: "Failed to load interview" },
      { status: 500 }
    );
  }
}

function generateQuestions(
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  roadmapSkills: string[]
): InterviewQuestion[] {
  const profileKey = matchCareerProfile(targetRole);
  const profile = profileKey ? CAREER_PROFILES[profileKey] : null;

  // Core questions every interview gets
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

  // Role-specific questions based on career profile
  const roleSpecific: InterviewQuestion[] = [];

  if (profile) {
    const category = profile.category;

    if (
      category === "engineering" ||
      category === "devops" ||
      category === "security"
    ) {
      roleSpecific.push(
        {
          question: `You'll need to develop ${roadmapSkills.slice(0, 2).join(" and ")}. Walk me through how you'd approach learning a complex technical topic you've never touched before.`,
          category: "Learning Ability",
          tip: "Show your learning system — not just 'I'd Google it.' Mention specific strategies: reading source code, building toy projects, teaching it back, finding mentors.",
        },
        {
          question: `Describe a system you designed or significantly contributed to. What were the key trade-offs, and what would you change with hindsight?`,
          category: "System Design",
          tip: "The 'what would you change' part is the real test. It shows intellectual honesty and growth. Don't just describe — analyze your own decisions critically.",
        },
        {
          question: `A junior engineer on your team pushes code that passes review but causes a production incident. How do you handle this?`,
          category: "Technical Leadership",
          tip: "This tests empathy + process thinking. Cover: immediate response (no blame), root cause analysis, process improvement (what failed in review?), and how you coach the engineer.",
        }
      );
    }

    if (category === "management") {
      roleSpecific.push(
        {
          question: `Two strong engineers on your team have a fundamental disagreement about architecture. Both have valid points. How do you resolve it?`,
          category: "Conflict Resolution",
          tip: "Show you can facilitate, not just dictate. Mention creating a decision framework (RFC?), ensuring both feel heard, and making a timely call when consensus isn't possible.",
        },
        {
          question: `Your team's velocity has dropped 30% over two quarters. What's your diagnostic process?`,
          category: "Team Performance",
          tip: "Don't jump to solutions. Walk through your investigation: 1:1s, process review, technical debt assessment, morale check. The best answer shows systematic thinking, not gut reactions.",
        },
        {
          question: `How do you decide when to shield your team from organizational chaos vs. being transparent about it?`,
          category: "Management Philosophy",
          tip: "This is a values question. Show nuance — pure shielding creates trust issues; pure transparency creates anxiety. Discuss how context and team maturity influence your approach.",
        }
      );
    }

    if (category === "product") {
      roleSpecific.push(
        {
          question: `Walk me through how you'd prioritize a backlog with 50 items, conflicting stakeholder requests, and a tight deadline.`,
          category: "Prioritization",
          tip: "Name your framework (RICE, ICE, impact mapping) but show it's a tool, not a religion. Mention stakeholder alignment, saying no gracefully, and communicating the 'why' behind cuts.",
        },
        {
          question: `You have strong data suggesting Feature A will outperform Feature B, but your CEO wants Feature B. What do you do?`,
          category: "Stakeholder Management",
          tip: "This tests political savvy + data integrity. Show you'd present the data clearly, understand the CEO's context (strategic reasons?), and propose a way to test both hypotheses.",
        },
        {
          question: `Describe a product you launched that failed. What did you learn?`,
          category: "Failure & Learning",
          tip: "Authenticity wins here. Don't pick a fake failure. Describe what went wrong (assumptions, market, execution), what you'd do differently, and how it changed your process.",
        }
      );
    }

    if (category === "data" || category === "ai") {
      roleSpecific.push(
        {
          question: `Walk me through your approach to a new ML/data problem: from understanding the business need to production deployment.`,
          category: "End-to-End Thinking",
          tip: "Start with the business question, not the model. Show you think about data quality, feature engineering, evaluation metrics that matter to the business, and monitoring in production.",
        },
        {
          question: `Your model achieves great offline metrics but stakeholders say it's not delivering value in production. What's your debugging process?`,
          category: "ML Operations",
          tip: "Cover: data drift, train/serve skew, latency issues, wrong evaluation metric, and the possibility that the model works but the product integration is broken.",
        },
        {
          question: `How do you explain complex technical concepts (like model limitations or uncertainty) to non-technical stakeholders?`,
          category: "Communication",
          tip: "Use an example. Show you can translate 'precision vs. recall trade-off' into business language without being condescending or oversimplifying to the point of inaccuracy.",
        }
      );
    }

    if (category === "design") {
      roleSpecific.push(
        {
          question: `Walk me through a design decision you made where user research contradicted your initial intuition. What did you do?`,
          category: "Research-Driven Design",
          tip: "This tests ego vs. evidence. Show you can kill your darlings when data disagrees. Describe your process for synthesizing conflicting signals.",
        },
        {
          question: `How do you balance business goals, user needs, and engineering constraints when they conflict?`,
          category: "Design Strategy",
          tip: "Don't default to 'user always wins.' Show you understand the triangle — and that the best designs find creative ways to satisfy all three, not just compromise.",
        },
        {
          question: `Describe your process for scaling a design system from 1 product to 5 products with different needs.`,
          category: "Design Systems",
          tip: "Cover governance, component flexibility, adoption strategy, and how you handle teams that want exceptions. Show you think about systems, not just screens.",
        }
      );
    }

    if (category === "marketing") {
      roleSpecific.push(
        {
          question: `You have a $50K monthly marketing budget for a new product. Walk me through how you'd allocate it in the first 3 months.`,
          category: "Strategy & Budgeting",
          tip: "Show structured thinking: awareness vs. conversion split, channel testing framework, measurement plan, and when you'd reallocate based on data.",
        },
        {
          question: `Your highest-performing ad campaign suddenly drops 40% in ROAS. What's your diagnostic and response process?`,
          category: "Performance Marketing",
          tip: "Walk through the funnel: creative fatigue, audience saturation, landing page issues, competitor changes, platform algorithm shifts. Show systematic debugging, not panic.",
        },
        {
          question: `How do you measure the impact of brand marketing activities that don't have direct attribution?`,
          category: "Measurement",
          tip: "This is the holy grail question. Mention brand lift studies, organic search trends, direct traffic, surveys, and the honest tension between measurability and long-term brand building.",
        }
      );
    }
  } else {
    // Fallback role-specific questions
    roleSpecific.push(
      {
        question: `A ${targetRole} needs to master ${roadmapSkills.slice(0, 2).join(" and ")}. What's your concrete plan to develop these skills in the next 6 months?`,
        category: "Growth Plan",
        tip: "Be specific: name courses, projects, mentors, and milestones. Vague answers like 'I'll practice more' don't inspire confidence.",
      },
      {
        question: `Describe a time you had to influence a decision without having direct authority. How did you build alignment?`,
        category: "Influence",
        tip: "This tests soft skills. Focus on your communication strategy, how you understood others' concerns, and the outcome. Evidence of empathy wins.",
      },
      {
        question: `How would you handle a situation where you strongly disagree with your team's technical direction?`,
        category: "Collaboration",
        tip: "Show you can disagree and commit. Mention presenting your case with evidence, being open to being wrong, and supporting the decision once it's made.",
      }
    );
  }

  // Closing question everyone gets
  const closing: InterviewQuestion = {
    question: `It's 12 months from now and you've been in the ${targetRole} role. What does success look like — what have you shipped, changed, or built?`,
    category: "Vision",
    tip: "Be concrete and ambitious but realistic. Mention specific deliverables, team impact, and personal growth. Show you've thought deeply about what the role actually entails day-to-day.",
  };

  return [...core, ...roleSpecific, closing];
}
