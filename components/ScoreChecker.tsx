"use client";

import { useState } from "react";
import Spinner from "./Spinner";

interface ScoreResult {
  id: string;
  score: number;
  label: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export default function ScoreChecker() {
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  async function handleCheck() {
    if (!targetRole.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRole: "",
          targetRole: targetRole.trim(),
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience: parseInt(experience) || 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const color = result
    ? result.score >= 80
      ? "text-emerald-400"
      : result.score >= 60
        ? "text-blue-400"
        : result.score >= 40
          ? "text-amber-400"
          : "text-red-400"
    : "";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <section className="mx-auto mb-12 max-w-2xl sm:mb-14">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f14] p-6 text-center">
        <h3 className="mb-1 text-lg font-bold text-white">⚡ Quick Career Gap Score</h3>
        <p className="mb-5 text-sm text-zinc-500">Find out how ready you are — takes 10 seconds</p>

        {!result ? (
          <div className="space-y-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target role (e.g. Staff Engineer)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none focus:border-blue-500/50"
            />
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Your skills (comma-separated)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none focus:border-blue-500/50"
            />
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Years of experience"
              min="0"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleCheck}
              disabled={loading || !targetRole.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Calculating...</span> : "Check My Score →"}
            </button>
          </div>
        ) : (
          <div>
            <div className={`mb-2 text-5xl font-bold ${color}`}>{result.score}</div>
            <div className="mb-4 text-sm text-zinc-500">/ 100 — {result.label}</div>

            {result.missingSkills.length > 0 && (
              <div className="mb-4 text-left">
                <p className="mb-2 text-xs font-semibold uppercase text-amber-400/70">Top skills to build:</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.slice(0, 3).map((s, i) => (
                    <span key={i} className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={`${baseUrl}/score/${result.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                Share Score
              </a>
              <button
                onClick={() => { setResult(null); setTargetRole(""); setSkills(""); setExperience(""); }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                Try Another
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
