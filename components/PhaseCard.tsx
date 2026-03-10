import type { RoadmapStep } from "@/lib/types";
import Spinner from "./Spinner";

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

interface PhaseCardProps {
  step: RoadmapStep;
  authorityUnlocked: boolean;
  unlockEmail: string;
  unlockLoading: boolean;
  unlockError: string | null;
  onUnlockEmailChange: (v: string) => void;
  onUnlock: (e: React.FormEvent) => void;
}

export default function PhaseCard({
  step,
  authorityUnlocked,
  unlockEmail,
  unlockLoading,
  unlockError,
  onUnlockEmailChange,
  onUnlock,
}: PhaseCardProps) {
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
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${config.gradient} ${config.border}`}
    >
      <div
        className={`transition-all duration-500 ${
          isLocked ? "pointer-events-none select-none blur-[6px]" : "blur-0"
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

        <h3 className="mb-1 text-xl font-bold text-white">{step.title}</h3>
        <p className="mb-4 font-mono text-sm text-zinc-500">{step.duration}</p>

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
              <li key={r} className="text-sm text-zinc-400 leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <p className="text-xs text-zinc-500">🏁 Milestone</p>
          <p className="text-sm font-medium text-zinc-300">{step.milestone}</p>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 p-6 backdrop-blur-sm">
          <div className="mb-3 text-3xl">🔒</div>
          <h4 className="mb-1 text-center text-lg font-bold text-white">
            Authority Blueprint
          </h4>
          <p className="mb-4 text-center text-sm text-zinc-400">
            Enter your email to unlock the final phase
          </p>
          <form onSubmit={onUnlock} className="flex w-full flex-col gap-2">
            <input
              type="email"
              value={unlockEmail}
              onChange={(e) => onUnlockEmailChange(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50"
            />
            <button
              type="submit"
              disabled={unlockLoading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
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
              <p className="text-center text-xs text-red-400">{unlockError}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
