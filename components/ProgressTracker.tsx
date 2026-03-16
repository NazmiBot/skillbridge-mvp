"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RoadmapStep } from "@/lib/types";

interface ProgressTrackerProps {
  roadmap: RoadmapStep[];
  slug: string;
  initialEmail?: string;
}

const phaseConfig: Record<string, { icon: string; color: string; barColor: string }> = {
  Foundation: { icon: "🧱", color: "text-amber-400", barColor: "bg-amber-500" },
  Execution: { icon: "⚡", color: "text-blue-400", barColor: "bg-blue-500" },
  Authority: { icon: "👑", color: "text-purple-400", barColor: "bg-purple-500" },
};

export default function ProgressTracker({ roadmap, slug, initialEmail }: ProgressTrackerProps) {
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [completedSkills, setCompletedSkills] = useState<string[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [celebratePhase, setCelebratePhase] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load email from localStorage or prop
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("sb_progress_email") : null;
    const e = initialEmail || stored || "";
    if (e) {
      setEmail(e);
      setEmailConfirmed(true);
    }
  }, [initialEmail]);

  // Load progress when email is confirmed
  const loadProgress = useCallback(async () => {
    if (!emailConfirmed || !email) return;
    try {
      const res = await fetch(`/api/progress/${slug}?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.data) {
        setCompletedSkills(json.data.completedSkills || []);
        setCompletedMilestones(json.data.completedMilestones || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoaded(true);
    }
  }, [email, emailConfirmed, slug]);

  useEffect(() => {
    if (emailConfirmed) loadProgress();
  }, [emailConfirmed, loadProgress]);

  // Debounced save
  const debouncedSave = useCallback(
    (skills: string[], milestones: number[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch("/api/progress/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              slug,
              completedSkills: skills,
              completedMilestones: milestones,
            }),
          });
        } catch {
          // Silently fail
        } finally {
          setSaving(false);
        }
      }, 800);
    },
    [email, slug]
  );

  function toggleSkill(skill: string, phase: number) {
    setCompletedSkills((prev) => {
      const next = prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill];

      // Check if phase is now complete
      const step = roadmap.find((s) => s.phase === phase);
      if (step) {
        const allSkillsDone = step.skills.every((s) => next.includes(s));
        const milestonesDone = completedMilestones.includes(phase);
        if (allSkillsDone && milestonesDone) {
          setCelebratePhase(phase);
          setTimeout(() => setCelebratePhase(null), 3000);
        }
      }

      debouncedSave(next, completedMilestones);
      return next;
    });
  }

  function toggleMilestone(phase: number) {
    setCompletedMilestones((prev) => {
      const next = prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase];

      // Check if phase is now complete
      const step = roadmap.find((s) => s.phase === phase);
      if (step) {
        const allSkillsDone = step.skills.every((s) => completedSkills.includes(s));
        const milestonesDone = next.includes(phase);
        if (allSkillsDone && milestonesDone) {
          setCelebratePhase(phase);
          setTimeout(() => setCelebratePhase(null), 3000);
        }
      }

      debouncedSave(completedSkills, next);
      return next;
    });
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("sb_progress_email", email);
    setEmailConfirmed(true);

    // Subscribe to nudges
    fetch("/api/progress/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, slug }),
    }).catch(() => {});
  }

  // Compute stats
  const totalSkills = roadmap.reduce((n, s) => n + s.skills.length, 0);
  const overallPercent = totalSkills > 0 ? Math.round((completedSkills.length / totalSkills) * 100) : 0;

  // Check Phase 1 complete
  const phase1 = roadmap.find((s) => s.phase === 1);
  const phase1Complete =
    phase1 &&
    phase1.skills.every((s) => completedSkills.includes(s)) &&
    completedMilestones.includes(1);

  if (!emailConfirmed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <div className="mb-3 text-3xl">📊</div>
        <h3 className="mb-1 text-lg font-bold text-white">Track Your Progress</h3>
        <p className="mb-4 text-sm text-zinc-400">
          Enter your email to track skills, milestones, and get weekly nudges.
        </p>
        <form onSubmit={handleEmailSubmit} className="mx-auto flex max-w-sm gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-emerald-500/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500"
          >
            Start Tracking
          </button>
        </form>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <div className="text-sm text-zinc-500">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">📊 Your Progress</h3>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-zinc-500">Saving...</span>
            )}
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-sm font-semibold text-emerald-400">
              {overallPercent}%
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {completedSkills.length} of {totalSkills} skills completed
        </p>
      </div>

      {/* Per-phase progress */}
      {roadmap.map((step) => {
        const config = phaseConfig[step.title] ?? {
          icon: "📍",
          color: "text-zinc-400",
          barColor: "bg-zinc-500",
        };
        const phaseSkillsDone = step.skills.filter((s) => completedSkills.includes(s)).length;
        const phasePercent = step.skills.length > 0 ? Math.round((phaseSkillsDone / step.skills.length) * 100) : 0;
        const milestoneDone = completedMilestones.includes(step.phase);
        const phaseComplete = phaseSkillsDone === step.skills.length && milestoneDone;
        const isCelebrating = celebratePhase === step.phase;

        return (
          <div
            key={step.phase}
            className={`relative rounded-2xl border bg-white/[0.02] p-5 transition-all duration-300 ${
              phaseComplete ? "border-emerald-500/30" : "border-white/10"
            } ${isCelebrating ? "ring-2 ring-emerald-500/50" : ""}`}
          >
            {/* Celebration overlay */}
            {isCelebrating && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-emerald-500/5">
                <span className="text-2xl font-bold text-emerald-400">
                  🎉 Phase Complete!
                </span>
              </div>
            )}

            {/* Phase header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <span className={`text-sm font-semibold ${config.color}`}>
                  Phase {step.phase}: {step.title}
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {phasePercent}%
              </span>
            </div>

            {/* Phase progress bar */}
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
                style={{ width: `${phasePercent}%` }}
              />
            </div>

            {/* Skills checkboxes */}
            <div className="space-y-2">
              {step.skills.map((skill) => {
                const checked = completedSkills.includes(skill);
                return (
                  <label
                    key={skill}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.03]"
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        checked
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-white/20 bg-white/5"
                      }`}
                      onClick={() => toggleSkill(skill, step.phase)}
                    >
                      {checked && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm transition ${
                        checked ? "text-zinc-500 line-through" : "text-zinc-300"
                      }`}
                      onClick={() => toggleSkill(skill, step.phase)}
                    >
                      {skill}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Milestone checkbox */}
            <div className="mt-4 border-t border-white/5 pt-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.03]">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                    milestoneDone
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-white/20 bg-white/5"
                  }`}
                  onClick={() => toggleMilestone(step.phase)}
                >
                  {milestoneDone && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition ${
                    milestoneDone ? "text-zinc-500 line-through" : "text-zinc-300"
                  }`}
                  onClick={() => toggleMilestone(step.phase)}
                >
                  🏁 {step.milestone}
                </span>
              </label>
            </div>
          </div>
        );
      })}

      {/* Phase 1 complete CTA */}
      {phase1Complete && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 text-center">
          <div className="mb-2 text-3xl">🎙️</div>
          <h3 className="mb-1 text-lg font-bold text-white">
            Ready to test your knowledge?
          </h3>
          <p className="mb-4 text-sm text-zinc-400">
            You&apos;ve completed the Foundation phase. Time to practice!
          </p>
          <a
            href={`/r/${slug}/interview`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500"
          >
            Try the Mock Interview →
          </a>
        </div>
      )}
    </div>
  );
}
