"use client";

import { useState } from "react";
import type { RoadmapResponse } from "@/lib/types";
import { analytics } from "@/lib/analytics";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CareerForm from "@/components/CareerForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import RoadmapResults from "@/components/RoadmapResults";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

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
      analytics.generateBlueprint(input.targetRole);
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
      analytics.shareCreated(lastInput?.targetRole || "");
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
    analytics.linkCopied();
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
        analytics.emailUnlock();

        // Fire blueprint email in the background (non-blocking)
        if (result && lastInput) {
          fetch("/api/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: unlockEmail,
              targetRole: lastInput.targetRole,
              currentRole: lastInput.currentRole,
              phases: result.roadmap.map((p) => ({
                title: p.title,
                duration: p.duration,
                skills: p.skills,
                milestone: p.milestone,
              })),
              estimatedTimeline: result.estimatedTimeline,
              shareUrl: shareUrl || undefined,
            }),
          }).catch(() => {});
        }
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

  function handleReset() {
    setResult(null);
    setShareUrl(null);
    setAuthorityUnlocked(false);
    setUnlockEmail("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <HeroSection />

        {!result && <HowItWorks />}

        {!result && (
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-medium text-zinc-500">
              Popular career paths
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "Senior Frontend Engineer",
                "Staff Engineer",
                "Engineering Manager",
                "Data Scientist",
                "Product Manager",
                "DevOps Engineer",
                "AI/ML Engineer",
                "CTO",
              ].map((career) => (
                <button
                  key={career}
                  onClick={() => {
                    setDreamCareer(career);
                    document
                      .getElementById("career-form")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 transition active:scale-95 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300 sm:py-1.5"
                >
                  {career}
                </button>
              ))}
            </div>
          </div>
        )}

        <CareerForm
          dreamCareer={dreamCareer}
          currentRole={currentRole}
          skills={skills}
          experience={experience}
          loading={loading}
          onDreamCareerChange={setDreamCareer}
          onCurrentRoleChange={setCurrentRole}
          onSkillsChange={setSkills}
          onExperienceChange={setExperience}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && !result && <LoadingSkeleton />}

        {result && (
          <RoadmapResults
            result={result}
            lastInput={lastInput}
            authorityUnlocked={authorityUnlocked}
            unlockEmail={unlockEmail}
            unlockLoading={unlockLoading}
            unlockError={unlockError}
            shareUrl={shareUrl}
            shareLoading={shareLoading}
            copied={copied}
            onUnlockEmailChange={setUnlockEmail}
            onUnlock={handleUnlock}
            onShare={handleShare}
            onCopyLink={copyLink}
            onReset={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
