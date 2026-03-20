import { notFound } from "next/navigation";
import { getRedis } from "@/lib/redis";
import type { SavedRoadmap, EvaluationResult } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

type Params = Promise<{ slug: string }>;

async function getShareData(slug: string) {
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

function scoreColor(score: number) {
  if (score >= 80) return { ring: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10", label: "Excellent", hex: "#10b981" };
  if (score >= 60) return { ring: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/10", label: "Strong", hex: "#3b82f6" };
  if (score >= 40) return { ring: "text-amber-400", bg: "from-amber-500/20 to-orange-500/10", label: "Developing", hex: "#f59e0b" };
  return { ring: "text-red-400", bg: "from-red-500/20 to-pink-500/10", label: "Needs Work", hex: "#ef4444" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getShareData(slug);
  if (!data) return { title: "Results Not Found — SkillBridge" };

  const { roadmap, evaluation } = data;
  const sc = scoreColor(evaluation.score);
  const title = `I scored ${evaluation.score}/100 on my ${roadmap.input.targetRole} mock interview`;
  const description = `${sc.label} readiness for ${roadmap.input.currentRole} → ${roadmap.input.targetRole}. Check your career readiness at tryskillbridge.com`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";
  const ogImage = `${baseUrl}/r/${slug}/share/opengraph-image`;

  return {
    title: `${title} — SkillBridge`,
    description,
    openGraph: {
      title,
      description,
      siteName: "SkillBridge",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getShareData(slug);
  if (!data) notFound();

  const { roadmap, evaluation } = data;
  const sc = scoreColor(evaluation.score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (evaluation.score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            Shared Result
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <p className="mb-3 font-mono text-sm text-zinc-500">Mock Interview Score</p>
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-zinc-400">{roadmap.input.currentRole}</span>
            <span className="mx-3 text-zinc-600">→</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {roadmap.input.targetRole}
            </span>
          </h1>
        </div>

        {/* Score Card */}
        <div className={`mb-10 rounded-2xl border border-white/[0.06] bg-gradient-to-br ${sc.bg} p-10 text-center`}>
          {/* Score Ring */}
          <div className="relative mx-auto mb-6 h-[160px] w-[160px]">
            <svg width="160" height="160" className="-rotate-90">
              <circle
                cx="80" cy="80" r="54"
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
              />
              <circle
                cx="80" cy="80" r="54"
                fill="none" stroke="currentColor" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={sc.ring}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-bold ${sc.ring}`}>{evaluation.score}</span>
                <span className="text-sm text-zinc-500">/ 100</span>
              </div>
              <span className={`mt-1 text-sm font-medium ${sc.ring}`}>{sc.label}</span>
            </div>
          </div>

          <p className="mx-auto max-w-lg text-base text-zinc-300 leading-relaxed">
            {evaluation.summary}
          </p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">💪</span>
              <h2 className="text-lg font-bold text-emerald-400">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {(evaluation.strengths ?? []).slice(0, 3).map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg font-bold text-amber-400">Growth Areas</h2>
            </div>
            <ul className="space-y-3">
              {(evaluation.weaknesses ?? []).slice(0, 3).map((w, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="mt-0.5 shrink-0 text-amber-500">▲</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">How ready are you?</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Get your personalized career roadmap and mock interview evaluation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30"
          >
            Check Your Career Readiness
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center text-sm text-zinc-600">
          <p>
            <Link href="/" className="transition hover:text-zinc-400">SkillBridge</Link>
            {" "}— Career blueprints, engineered.
          </p>
        </div>
      </footer>
    </div>
  );
}
