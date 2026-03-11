import { notFound } from "next/navigation";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap, EvaluationResult } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import ResultsClient from "./results-client";

type Params = Promise<{ slug: string }>;

async function getData(slug: string) {
  const db = getRedis();
  const [roadmapRaw, evalRaw] = await Promise.all([
    db.get(`roadmap:${slug}`),
    db.get(`interview:evaluation:${slug}`),
  ]);

  if (!roadmapRaw || !evalRaw) return null;

  return {
    roadmap: JSON.parse(roadmapRaw) as SavedRoadmap,
    evaluation: JSON.parse(evalRaw) as EvaluationResult,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return { title: "Results Not Found — SkillBridge" };

  const { roadmap, evaluation } = data;
  return {
    title: `Interview Results: ${evaluation.score}/100 — ${roadmap.input.targetRole}`,
    description: `Mock interview evaluation for ${roadmap.input.currentRole} → ${roadmap.input.targetRole}. Score: ${evaluation.score}/100.`,
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { roadmap, evaluation } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            Interview Results
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <ResultsClient
          slug={slug}
          evaluation={evaluation}
          currentRole={roadmap.input.currentRole}
          targetRole={roadmap.input.targetRole}
          estimatedTimeline={roadmap.result.estimatedTimeline}
        />

        {/* Back links */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            href={`/r/${slug}`}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
          >
            ← Back to Roadmap
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
          >
            Generate New Blueprint
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center text-sm text-zinc-600">
          <p>
            <Link href="/" className="transition hover:text-zinc-400">
              SkillBridge
            </Link>{" "}
            — Career blueprints, engineered.
          </p>
        </div>
      </footer>
    </div>
  );
}
