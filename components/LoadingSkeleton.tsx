const skeletonPhases = [
  { icon: "🧱", gradient: "from-amber-500/10 to-orange-500/5", border: "border-amber-500/20" },
  { icon: "⚡", gradient: "from-blue-500/10 to-cyan-500/5", border: "border-blue-500/20" },
  { icon: "👑", gradient: "from-purple-500/10 to-pink-500/5", border: "border-purple-500/20" },
];

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-20">
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-zinc-300">
              Building your personalized blueprint...
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Analyzing career paths, identifying skill gaps, finding resources
          </p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonPhases.map((config, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-2xl border bg-gradient-to-br p-6 ${config.gradient} ${config.border}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-2xl">{config.icon}</span>
              <div className="h-6 w-16 rounded-full bg-white/5" />
            </div>
            <div className="mb-1 h-6 w-24 rounded bg-white/10" />
            <div className="mb-4 h-4 w-16 rounded bg-white/5" />
            <div className="mb-4 space-y-2">
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="flex flex-wrap gap-1.5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-5 w-20 rounded-md bg-white/5" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-white/5" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 w-full rounded bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
