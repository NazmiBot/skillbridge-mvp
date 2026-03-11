import { useState, useEffect, useCallback } from "react";
import type { RoadmapResponse } from "@/lib/types";
import PhaseCard from "./PhaseCard";
import Spinner from "./Spinner";

interface RoadmapResultsProps {
  result: RoadmapResponse;
  lastInput: { currentRole: string; targetRole: string; skills: string[]; experience: number } | null;
  authorityUnlocked: boolean;
  unlockEmail: string;
  unlockLoading: boolean;
  unlockError: string | null;
  shareUrl: string | null;
  shareLoading: boolean;
  copied: boolean;
  onUnlockEmailChange: (v: string) => void;
  onUnlock: (e: React.FormEvent) => void;
  onShare: () => void;
  onCopyLink: () => void;
  onReset: () => void;
}

export default function RoadmapResults({
  result,
  lastInput,
  authorityUnlocked,
  unlockEmail,
  unlockLoading,
  unlockError,
  shareUrl,
  shareLoading,
  copied,
  onUnlockEmailChange,
  onUnlock,
  onShare,
  onCopyLink,
  onReset,
}: RoadmapResultsProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [interviewPaid, setInterviewPaid] = useState(false);

  // Extract slug from share URL
  const slug = shareUrl?.split("/r/")[1] ?? null;

  // Check paid status whenever we get a slug
  const checkPaidStatus = useCallback(async (s: string) => {
    try {
      const res = await fetch(`/api/interview/${s}`);
      if (res.ok) {
        setInterviewPaid(true);
      }
    } catch {
      // Not paid
    }
  }, []);

  useEffect(() => {
    if (slug) checkPaidStatus(slug);
  }, [slug, checkPaidStatus]);

  // Self-contained checkout: saves roadmap if needed, then redirects to Stripe
  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      let checkoutSlug = slug;

      // No slug yet — save the roadmap first to get one
      if (!checkoutSlug && result && lastInput) {
        const saveRes = await fetch("/api/roadmap/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: lastInput, result }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error);
        checkoutSlug = saveData.url?.split("/r/")[1];
        if (!checkoutSlug) throw new Error("No slug returned");
      }

      if (!checkoutSlug) return;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: checkoutSlug }),
      });
      const data = await res.json();
      if (data.alreadyPaid) {
        setInterviewPaid(true);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      // Silently fail
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Timeline Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-zinc-300">
          Estimated Timeline:{" "}
          <strong className="text-white">{result.estimatedTimeline}</strong>
        </span>
      </div>

      {/* Phase Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.roadmap.map((step) => (
          <PhaseCard
            key={step.phase}
            step={step}
            authorityUnlocked={authorityUnlocked}
            unlockEmail={unlockEmail}
            unlockLoading={unlockLoading}
            unlockError={unlockError}
            onUnlockEmailChange={onUnlockEmailChange}
            onUnlock={onUnlock}
          />
        ))}
      </div>

      {/* Mock Interview CTA — always visible, primary conversion */}
      {!interviewPaid && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-8 text-center sm:p-10">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 text-5xl">🎙️</div>
            <h3 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
              Ready to Ace the Interview?
            </h3>
            <p className="mx-auto mb-3 max-w-lg text-base text-zinc-300">
              Get a personalized mock interview with questions tailored to{" "}
              <span className="font-medium text-white">your exact roadmap</span>.
              Practice before the real thing.
            </p>
            <p className="mx-auto mb-8 max-w-md text-sm text-zinc-500">
              AI-generated questions • Timed practice • Coaching tips included
            </p>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {checkoutLoading ? (
                <>
                  <Spinner />
                  Redirecting to checkout...
                </>
              ) : (
                "Unlock Mock Interview — $9"
              )}
            </button>
            <p className="mt-4 text-xs text-zinc-600">
              One-time payment • Instant access • Powered by Stripe
            </p>
          </div>
        </div>
      )}

      {/* Paid state — go straight to interview */}
      {interviewPaid && slug && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 text-center">
          <div className="mb-3 text-4xl">🎙️</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            Your Mock Interview is Ready
          </h3>
          <a
            href={`/r/${slug}/interview`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500"
          >
            Start Interview →
          </a>
        </div>
      )}

      {/* Share — secondary, below the money */}
      <div className="flex flex-col items-center gap-4">
        {!shareUrl ? (
          <button
            onClick={onShare}
            disabled={shareLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            {shareLoading ? (
              <>
                <Spinner /> Generating link...
              </>
            ) : (
              "🔗 Share This Blueprint"
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:px-4">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-400 sm:text-sm">
                {shareUrl}
              </span>
              <button
                onClick={onCopyLink}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Just mapped my career path: ${lastInput?.currentRole || "where I am"} → ${lastInput?.targetRole}\n\nSkillBridge built me a personalized 3-phase roadmap in seconds 🚀`
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-center text-sm text-zinc-400 transition active:scale-95 hover:bg-white/5 hover:text-white"
              >
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-center text-sm text-zinc-400 transition active:scale-95 hover:bg-white/5 hover:text-white"
              >
                Share on LinkedIn
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Generate another */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Generate another blueprint
        </button>
      </div>

      <p className="text-center font-mono text-xs text-zinc-600">
        Generated {new Date(result.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
