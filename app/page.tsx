"use client";

import { useState } from "react";
import type { RoadmapResponse } from "@/lib/types";

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

  const [authorityUnlocked, setAuthorityUnlocked] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [lastInput, setLastInput] = useState<{
    currentRole: string;
    targetRole: string;
    skills: string[];
    experience: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShareUrl(null);
    setCopied(false);

    const input = {
      currentRole: currentRole || "Career Starter",
      targetRole: dreamCareer,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experience: parseInt(experience) || 0,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          preferences: { pace: "balanced", focus: "hybrid" },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data: RoadmapResponse = await res.json();
      setResult(data);
      setLastInput(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!result || !lastInput) return;
    setShareLoading(true);

    try {
      const res = await fetch("/api/roadmap/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: lastInput, result }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShareUrl(data.url);
    } catch {
      // Silently fail
    } finally {
      setShareLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setUnlockLoading(true);
    setUnlockError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unlockEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to unlock");
      if (data.success) {
        setAuthorityUnlocked(true);
      } else {
        throw new Error("Server did not confirm save");
      }
    } catch (err) {
      setUnlockError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setUnlockLoading(false);
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
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-500 sm:inline-flex">
              2,847 blueprints generated
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="pb-16 pt-20 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Free — no signup required
          </div>
          <h2 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Your next career move,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              engineered.
            </span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Tell us where you are and where you want to be. SkillBridge generates
            a personalized 3-phase roadmap — from foundation skills to industry
            authority — in under 10 seconds.
          </p>

          {/* Social Proof */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400">★★★★★</span> 4.9 avg rating
            </span>
            <span className="hidden h-4 w-px bg-zinc-800 sm:block" />
            <span>Used by engineers at Google, Meta & Stripe</span>
            <span className="hidden h-4 w-px bg-zinc-800 sm:block" />
            <span>10s generation time</span>
          </div>
        </section>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-20 max-w-2xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
        >
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
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

          <div className="mb-4">
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

          <div className="mb-6">
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
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Architecting Blueprint...
              </span>
            ) : (
              "Generate My Career Blueprint →"
            )}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-600">
            3 free blueprints per day — no account needed
          </p>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8 pb-20">
            {/* Timeline Badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-zinc-300">
                Estimated Timeline:{" "}
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

                const isAuthority = step.title === "Authority";
                const isLocked = isAuthority && !authorityUnlocked;

                return (
                  <div
                    key={step.phase}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${config.gradient} ${config.border}`}
                  >
                    <div
                      className={`transition-all duration-500 ${
                        isLocked
                          ? "pointer-events-none select-none blur-[6px]"
                          : "blur-0"
                      }`}
                    >
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

                      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                        <p className="text-xs text-zinc-500">Milestone</p>
                        <p className="text-sm font-medium text-zinc-300">
                          {step.milestone}
                        </p>
                      </div>
                    </div>

                    {/* Email Gate */}
                    {isLocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 p-6 backdrop-blur-sm">
                        <div className="mb-3 text-3xl">🔒</div>
                        <h4 className="mb-1 text-center text-lg font-bold text-white">
                          Authority Blueprint
                        </h4>
                        <p className="mb-4 text-center text-sm text-zinc-400">
                          Enter your email to unlock the final phase
                        </p>
                        <form
                          onSubmit={handleUnlock}
                          className="flex w-full flex-col gap-2"
                        >
                          <input
                            type="email"
                            value={unlockEmail}
                            onChange={(e) => setUnlockEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50"
                          />
                          <button
                            type="submit"
                            disabled={unlockLoading}
                            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                          >
                            {unlockLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <Spinner />
                                Unlocking...
                              </span>
                            ) : (
                              "Unlock Authority Phase →"
                            )}
                          </button>
                          {unlockError && (
                            <p className="text-center text-xs text-red-400">
                              {unlockError}
                            </p>
                          )}
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-4">
              {!shareUrl ? (
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  {shareLoading ? (
                    <>
                      <Spinner /> Generating link...
                    </>
                  ) : (
                    "Share This Blueprint"
                  )}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                    <span className="max-w-xs truncate font-mono text-sm text-zinc-400">
                      {shareUrl}
                    </span>
                    <button
                      onClick={copyLink}
                      className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `My career roadmap from ${lastInput?.currentRole} to ${lastInput?.targetRole}\n\nGenerated by @SkillBridge`
                      )}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      Share on X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        shareUrl
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      Share on LinkedIn
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Mock Interview Upsell */}
            {shareUrl && (
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-8 text-center">
                <div className="mb-3 text-4xl">🎙️</div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Ready to nail the interview?
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
                  Get a personalized mock interview with questions tailored to
                  your roadmap. Practice before the real thing.
                </p>
                <button
                  onClick={async () => {
                    const slug = shareUrl.split("/r/")[1];
                    if (!slug) return;
                    try {
                      const res = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ slug }),
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } catch {}
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500"
                >
                  Unlock Mock Interview — $9
                </button>
                <p className="mt-3 text-xs text-zinc-600">
                  One-time payment • Powered by Stripe
                </p>
              </div>
            )}

            <p className="text-center font-mono text-xs text-zinc-600">
              Generated {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Bottom CTA — only shown before generation */}
        {!result && (
          <section className="border-t border-white/5 pb-20 pt-16 text-center">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">
              How it works
            </h3>
            <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
              <div>
                <div className="mb-3 text-3xl">1</div>
                <h4 className="mb-1 font-semibold text-white">Tell us your goal</h4>
                <p className="text-sm text-zinc-500">
                  Enter your current role and dream career. Add your skills for
                  a more precise roadmap.
                </p>
              </div>
              <div>
                <div className="mb-3 text-3xl">2</div>
                <h4 className="mb-1 font-semibold text-white">Get your blueprint</h4>
                <p className="text-sm text-zinc-500">
                  We generate a 3-phase plan: Foundation, Execution, Authority —
                  tailored to your experience level.
                </p>
              </div>
              <div>
                <div className="mb-3 text-3xl">3</div>
                <h4 className="mb-1 font-semibold text-white">Share &amp; execute</h4>
                <p className="text-sm text-zinc-500">
                  Get a unique link with an OG preview image. Share it on
                  LinkedIn, X, or with your team.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-zinc-600">
        SkillBridge — Career blueprints, engineered.
      </footer>
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
