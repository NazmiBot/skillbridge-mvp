const CATEGORIES = [
  "🛠 Engineering",
  "📊 Data & AI",
  "🎨 Design",
  "📋 Product",
  "☁️ DevOps & Cloud",
  "🔒 Security",
  "📱 Mobile",
  "📈 Marketing",
  "👔 Leadership",
];

export default function HowItWorks() {
  return (
    <section className="border-t border-white/5 pb-10 pt-14">
      <h3 className="mb-10 text-center text-2xl font-bold tracking-tight">
        How it works
      </h3>
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-bold text-blue-400">
            1
          </div>
          <h4 className="mb-2 font-semibold text-white">Tell us your goal</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            Enter your target role, current position, and skills. The more
            context, the more personalized your roadmap.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl font-bold text-purple-400">
            2
          </div>
          <h4 className="mb-2 font-semibold text-white">Get your blueprint</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            We generate a 3-phase plan — Foundation, Execution, Authority — with
            specific skills, real resources, and concrete milestones.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-xl font-bold text-pink-400">
            3
          </div>
          <h4 className="mb-2 font-semibold text-white">Share & execute</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            Get a shareable link with a custom OG image. Post it on LinkedIn or
            X, or keep it as your personal career compass.
          </p>
        </div>
      </div>

      {/* Trust bar */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-white/5 pt-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-500">✓</span>
          No account required
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-500">✓</span>
          AI-powered in seconds
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-500">✓</span>
          Shareable with custom link
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium text-zinc-500">
          Covering 15+ career paths across
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
          {CATEGORIES.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
