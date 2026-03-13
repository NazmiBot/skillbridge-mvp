export default function HeroSection() {
  return (
    <section className="pb-8 pt-14 text-center sm:pb-12 sm:pt-28">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        Free — no signup required
      </div>
      <h2 className="mb-5 text-3xl font-extrabold tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
        Your next career move,
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          engineered.
        </span>
      </h2>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-xl">
        Tell us where you are and where you want to be. SkillBridge generates a
        personalized 3-phase roadmap — from foundation skills to industry
        authority — with specific resources, milestones, and timelines.
      </p>
    </section>
  );
}
