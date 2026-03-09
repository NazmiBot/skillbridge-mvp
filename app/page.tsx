"use client";

import { useState } from "react";

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

const phaseConfig: Record<
  string,
  { icon: string; gradient: string; border: string; badge: string }
> = {
  Foundation: {
    icon: "🧱",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20 hover:border-amber-500/40",
    badge: "bg-amber-500/15 text-amber-400",
  },
  Execution: {
    icon: "⚡",
    gradient: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20 hover:border-blue-500/40",
    badge: "bg-blue-500/15 text-blue-400",
  },
  Authority: {
    icon: "👑",
    gradient: "from-purple-500/10 to-pink-500/5",
    border: "border-purple-500/20 hover:border-purple-500/40",
    badge: "bg-purple-500/15 text-purple-400",
  },
};

export default function Home() {
  const [dreamCareer, setDreamCareer] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole: currentRole || "Career Starter",
          targetRole: dreamCareer,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experience: parseInt(experience) || 0,
          preferences: { pace: "balanced", focus: "hybrid" },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data: RoadmapResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </h1>
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-500">
            v0.1 — API Engine
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Architect Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Career Blueprint
            </span>
          </h2>
          <p className="mx-auto max-w-lg text-lg text-zinc-400">
            Enter your dream role. We&apos;ll generate a personalized roadmap
            across three phases: Foundation, Execution, Authority.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-16 max-w-2xl space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Current Role
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Junior Developer"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">
                Years of Experience
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 2"
                min="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Your Skills
              <span className="text-zinc-600"> (comma-separated)</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, CSS, Node.js"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-400">
              Dream Career
            </label>
            <input
              type="text"
              value={dreamCareer}
              onChange={(e) => setDreamCareer(e.target.value)}
              placeholder="e.g. Staff Engineer, Engineering Manager, CTO..."
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !dreamCareer.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Architecting Blueprint...
              </span>
            ) : (
              "Generate Career Blueprint"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Bento Grid Results */}
        {result && (
          <div className="space-y-8">
            {/* Timeline Badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-zinc-300">
                ⏱ Estimated Timeline:{" "}
                <strong className="text-white">
                  {result.estimatedTimeline}
                </strong>
              </span>
            </div>

            {/* Bento Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.roadmap.map((step) => {
                const config = phaseConfig[step.title] ?? {
                  icon: "📍",
                  gradient: "from-zinc-500/10 to-zinc-500/5",
                  border: "border-zinc-500/20",
                  badge: "bg-zinc-500/15 text-zinc-400",
                };

                return (
                  <div
                    key={step.phase}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${config.gradient} ${config.border}`}
                  >
                    {/* Phase Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-2xl">{config.icon}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium ${config.badge}`}
                      >
                        Phase {step.phase}
                      </span>
                    </div>

                    <h3 className="mb-1 text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mb-4 font-mono text-sm text-zinc-500">
                      {step.duration}
                    </p>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Skills to Develop
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-xs text-zinc-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Resources
                      </p>
                      <ul className="space-y-1">
                        {step.resources.map((r) => (
                          <li
                            key={r}
                            className="flex items-center gap-2 text-sm text-zinc-400"
                          >
                            <span className="text-zinc-600">→</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Milestone */}
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <p className="text-xs text-zinc-500">🏁 Milestone</p>
                      <p className="text-sm font-medium text-zinc-300">
                        {step.milestone}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generated timestamp */}
            <p className="text-center font-mono text-xs text-zinc-600">
              Generated {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
