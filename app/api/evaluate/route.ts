import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap, EvaluationResult, InterviewQuestion } from "@/lib/types";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { slug, answers } = (await request.json()) as {
      slug: string;
      answers: string[];
    };

    if (!slug || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing slug or answers" },
        { status: 400 }
      );
    }

    const db = getRedis();

    // Verify payment
    const paid = await db.get(`interview:paid:${slug}`);
    if (paid !== "true") {
      return NextResponse.json(
        { error: "Interview not purchased" },
        { status: 403 }
      );
    }

    // Check for existing evaluation (idempotent)
    const existing = await db.get(`interview:evaluation:${slug}`);
    if (existing) {
      return NextResponse.json(JSON.parse(existing));
    }

    // Load questions and roadmap
    const [questionsRaw, roadmapRaw] = await Promise.all([
      db.get(`interview:questions:${slug}`),
      db.get(`roadmap:${slug}`),
    ]);

    if (!questionsRaw || !roadmapRaw) {
      return NextResponse.json(
        { error: "Interview data not found" },
        { status: 404 }
      );
    }

    const { questions } = JSON.parse(questionsRaw) as {
      questions: InterviewQuestion[];
    };
    const roadmap: SavedRoadmap = JSON.parse(roadmapRaw);

    // Build the Q&A transcript
    const transcript = questions
      .map((q, i) => {
        const answer = answers[i] || "(No answer provided)";
        return `[${q.category}] Q: ${q.question}\nA: ${answer}`;
      })
      .join("\n\n");

    const evaluation = await evaluateInterview(
      transcript,
      roadmap.input.currentRole,
      roadmap.input.targetRole,
      questions.length
    );

    // Save to Redis (no TTL — persists with the roadmap)
    await db.set(
      `interview:evaluation:${slug}`,
      JSON.stringify(evaluation)
    );

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("[Evaluate] Failed:", error);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}

async function evaluateInterview(
  transcript: string,
  currentRole: string,
  targetRole: string,
  questionCount: number
): Promise<EvaluationResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert interview evaluator. Analyze a mock interview transcript and produce a structured evaluation.

Output a JSON object with exactly these fields:
- "score": number 0-100 (be honest and calibrated — 50 is average, 70+ is strong, 90+ is exceptional)
- "summary": 2-3 sentence overall assessment (specific, actionable, encouraging but honest)
- "strengths": array of 3-5 specific strengths demonstrated (each 1-2 sentences, reference specific answers)
- "weaknesses": array of 3-5 specific areas for improvement (each 1-2 sentences, with actionable advice)

Scoring guidelines:
- Unanswered questions: significant penalty
- Vague/generic answers: moderate penalty
- Specific examples, frameworks (STAR), and quantified results: bonus
- Self-awareness and growth mindset: bonus
- Technical accuracy for the target role: important

Be constructive in weaknesses — frame them as growth opportunities with specific advice.
Output ONLY the JSON object, no markdown.`,
        },
        {
          role: "user",
          content: `Evaluate this mock interview for a ${currentRole} → ${targetRole} career transition (${questionCount} questions):

${transcript}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);

    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      summary: parsed.summary || "Evaluation complete.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
      evaluatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Evaluate AI] Falling back:", error);
    return fallbackEvaluation(transcript);
  }
}

function fallbackEvaluation(transcript: string): EvaluationResult {
  // Count answered vs unanswered
  const lines = transcript.split("\nA: ");
  const answered = lines.filter(
    (l) => !l.includes("(No answer provided)") && l.trim().length > 20
  ).length;
  const total = Math.max(1, lines.length - 1);
  const ratio = answered / total;

  const score = Math.round(ratio * 60 + 20); // 20-80 range based on completion

  return {
    score,
    summary: `You answered ${answered} of ${total} questions. ${ratio >= 0.8 ? "Strong completion rate — the foundation is there." : "Consider taking more time to answer each question fully."}`,
    strengths: [
      "You completed the mock interview, which shows commitment to preparation.",
      ...(ratio >= 0.5
        ? ["You engaged with the majority of questions."]
        : []),
    ],
    weaknesses: [
      "AI evaluation was unavailable — review your answers manually for specificity.",
      ...(ratio < 0.8
        ? ["Some questions were left unanswered. Practice responding under pressure."]
        : []),
      "Consider using the STAR framework (Situation, Task, Action, Result) for behavioral questions.",
    ],
    evaluatedAt: new Date().toISOString(),
  };
}
