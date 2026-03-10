import type { RoadmapResponse } from "@/lib/types";
import PhaseCard from "./PhaseCard";
import Spinner from "./Spinner";

interface RoadmapResultsProps {
  result: RoadmapResponse;
  lastInput: { currentRole: string; targetRole: string } | null;
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

      {/* Share */}
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

      {/* Mock Interview Upsell */}
      {shareUrl && (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5 text-center sm:p-8">
          <div className="mb-3 text-4xl">🎙️</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            Ready to nail the interview?
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
            Get a personalized mock interview with questions tailored to your
            roadmap. Practice before the real thing.
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition active:scale-[0.98] hover:from-emerald-500 hover:to-teal-500"
          >
            Unlock Mock Interview — $9
          </button>
          <p className="mt-3 text-xs text-zinc-600">
            One-time payment • Powered by Stripe
          </p>
        </div>
      )}

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
