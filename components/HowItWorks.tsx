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
          <h4 className="mb-2 font-semibold text-white">Tell us where you want to go</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            What job do you dream about? Enter it along with where you are now.
            Don&apos;t worry if you&apos;re not sure — we&apos;ll figure it out together.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl font-bold text-purple-400">
            2
          </div>
          <h4 className="mb-2 font-semibold text-white">Get your personalized roadmap</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            We&apos;ll map out 3 clear phases — Learn the Basics, Build Real
            Experience, Become the Expert — with specific courses, books, and
            milestones for each.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-xl font-bold text-pink-400">
            3
          </div>
          <h4 className="mb-2 font-semibold text-white">Start your journey</h4>
          <p className="text-sm leading-relaxed text-zinc-500">
            Save your roadmap, share it with friends, or take a mock interview
            to see how ready you are. Your career change starts here.
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
          Built for career changers
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="text-emerald-500">✓</span>
          Shareable with custom link
        </div>
      </div>

    </section>
  );
}
