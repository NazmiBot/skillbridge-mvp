"use client";

interface LearningRoadmap {
  topicsToStudy: string[];
  resourcesToWatch: string[];
  milestones: string[];
}

interface EvaluationData {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  starRewrites?: string[];
  learningRoadmap?: LearningRoadmap;
  aiGenerated: boolean;
  evaluatedAt: string;
}

interface Props {
  evaluation: EvaluationData;
  currentRole: string;
  targetRole: string;
  estimatedTimeline: string;
}

function scoreColor(score: number) {
  if (score >= 80)
    return {
      ring: "text-emerald-400",
      bg: "from-emerald-500/20 to-teal-500/10",
      label: "Excellent",
    };
  if (score >= 60)
    return {
      ring: "text-blue-400",
      bg: "from-blue-500/20 to-cyan-500/10",
      label: "Strong",
    };
  if (score >= 40)
    return {
      ring: "text-amber-400",
      bg: "from-amber-500/20 to-orange-500/10",
      label: "Developing",
    };
  return {
    ring: "text-red-400",
    bg: "from-red-500/20 to-pink-500/10",
    label: "Needs Work",
  };
}

function ScoreRing({ score }: { score: number }) {
  const { ring, label } = scoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${ring} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${ring}`}>{score}</span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
        <span className={`text-xs font-medium ${ring}`}>{label}</span>
      </div>
    </div>
  );
}

export default function SampleReportClient({
  evaluation,
  currentRole,
  targetRole,
}: Props) {
  const sc = scoreColor(evaluation.score);

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <p className="mb-2 font-mono text-sm text-zinc-500">
          Mock Interview Evaluation
        </p>
        <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="text-zinc-400">{currentRole}</span>
          <span className="mx-3 text-zinc-600">→</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {targetRole}
          </span>
        </h2>
        <p className="text-sm text-zinc-500">
          Evaluated on{" "}
          {new Date(evaluation.evaluatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Score Card */}
      <div
        className={`mb-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br ${sc.bg} p-8 text-center`}
      >
        <ScoreRing score={evaluation.score} />
        <p className="mx-auto mt-6 max-w-xl text-base text-zinc-300 leading-relaxed">
          {evaluation.summary}
        </p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h3 className="text-lg font-bold text-emerald-400">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {evaluation.strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-zinc-300 leading-relaxed"
              >
                <span className="mt-0.5 text-emerald-500">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="text-lg font-bold text-amber-400">
              Areas to Improve
            </h3>
          </div>
          <ul className="space-y-3">
            {evaluation.weaknesses.map((w, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm text-zinc-300 leading-relaxed"
              >
                <span className="mt-0.5 text-amber-500">▲</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* STAR Rewrites */}
      {evaluation.starRewrites && evaluation.starRewrites.length > 0 && (
        <div className="mb-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h3 className="text-lg font-bold text-purple-400">
              How to Improve — STAR Rewrites
            </h3>
          </div>
          <div className="space-y-4">
            {evaluation.starRewrites.map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line"
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Roadmap */}
      {evaluation.learningRoadmap && (
        <div className="mb-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-6">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h3 className="text-lg font-bold text-blue-400">
              Your Custom Learning Roadmap
            </h3>
          </div>
          <div className="space-y-6">
            {/* What to Study */}
            {evaluation.learningRoadmap.topicsToStudy.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">
                  What to Study
                </h4>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.topicsToStudy.map((t, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-zinc-300 leading-relaxed"
                    >
                      <span className="mt-0.5 text-blue-500">📘</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* What to Watch */}
            {evaluation.learningRoadmap.resourcesToWatch.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">
                  What to Watch
                </h4>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.resourcesToWatch.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-zinc-300 leading-relaxed"
                    >
                      <span className="mt-0.5 text-red-500">▶</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Action Plan */}
            {evaluation.learningRoadmap.milestones.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">
                  Action Plan
                </h4>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.milestones.map((m, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-zinc-300 leading-relaxed"
                    >
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
