export default function HowItWorks() {
  return (
    <section className="border-t border-white/5 pb-10 pt-14">
      <h3 className="mb-2 text-center text-2xl font-bold tracking-tight">
        Simple as 1-2-3
      </h3>
      <p className="mb-10 text-center text-sm text-zinc-500">
        No complicated setup. Just answer a few questions and go.
      </p>
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
            🎯
          </div>
          <h4 className="mb-2 font-semibold text-white">Share your dream</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            What career excites you? It&apos;s okay if you&apos;re not 100% sure yet — 
            even a rough idea is a great start.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl">
            🗺️
          </div>
          <h4 className="mb-2 font-semibold text-white">Get your personal roadmap</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            We&apos;ll map out clear phases with specific courses, resources, and
            milestones tailored to your background.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">
            🚀
          </div>
          <h4 className="mb-2 font-semibold text-white">Take your first step</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            Save it, share it with a friend, or try a mock interview to see
            where you stand. Every big change starts with one step.
          </p>
        </div>
      </div>

      {/* Trust bar */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/5 pt-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-400">✓</span>
          No account needed
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-400">✓</span>
          Made for real career changers
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-400">✓</span>
          Share with a custom link
        </div>
      </div>

    </section>
  );
}
