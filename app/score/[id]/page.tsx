import { getRedis } from "@/lib/redis";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

interface ScoreResult {
  id: string;
  score: number;
  label: string;
  currentRole: string;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  createdAt: string;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = getRedis();
  const raw = await db.get(`score:${id}`);
  if (!raw) return { title: "Score Not Found" };
  const data: ScoreResult = JSON.parse(raw);
  return {
    title: `${data.score}/100 — Career Gap Score | SkillBridge`,
    description: `I'm ${data.score}% ready to become a ${data.targetRole}. Check your career readiness score.`,
    openGraph: {
      title: `I'm ${data.score}% ready for ${data.targetRole}`,
      description: `Career Gap Score: ${data.score}/100 (${data.label}). Find out yours at tryskillbridge.com`,
    },
  };
}

export default async function ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getRedis();
  const raw = await db.get(`score:${id}`);
  if (!raw) notFound();
  const data: ScoreResult = JSON.parse(raw);

  const color =
    data.score >= 80 ? "text-emerald-400" : data.score >= 60 ? "text-blue-400" : data.score >= 40 ? "text-amber-400" : "text-red-400";
  const ringColor =
    data.score >= 80 ? "stroke-emerald-400" : data.score >= 60 ? "stroke-blue-400" : data.score >= 40 ? "stroke-amber-400" : "stroke-red-400";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-2 font-mono text-sm text-zinc-500">Career Gap Score</p>
        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
          <span className="text-zinc-400">{data.currentRole}</span>
          <span className="mx-2 text-zinc-600">→</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {data.targetRole}
          </span>
        </h1>

        <div className="mx-auto my-10 flex justify-center">
          <div className="relative">
            <svg width="160" height="160" className="-rotate-90">
              <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="80" cy="80" r="54"
                fill="none" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${ringColor} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${color}`}>{data.score}</span>
              <span className="text-xs text-zinc-500">/ 100</span>
              <span className={`text-xs font-medium ${color}`}>{data.label}</span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 text-left sm:grid-cols-2">
          {data.matchedSkills.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-emerald-400">✓ Skills You Have</h3>
              <ul className="space-y-1.5">
                {data.matchedSkills.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-300">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {data.missingSkills.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-amber-400">▲ Skills to Build</h3>
              <ul className="space-y-1.5">
                {data.missingSkills.map((s, i) => (
                  <li key={i} className="text-sm text-zinc-300">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/?dream=${encodeURIComponent(data.targetRole)}`}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-purple-500"
          >
            Get Full Career Blueprint →
          </Link>
          <button
            onClick={undefined}
            className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Share Score on X
          </button>
        </div>

        <p className="mt-8 text-xs text-zinc-600">
          Score based on {data.totalRequired} skills analyzed for {data.targetRole}
        </p>
      </main>
    </div>
  );
}
