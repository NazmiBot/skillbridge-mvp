import { analytics } from "@/lib/analytics";

const POPULAR_CAREERS = [
  "Senior Frontend Engineer",
  "Staff Engineer",
  "Engineering Manager",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "AI/ML Engineer",
  "CTO",
];

interface HeroSectionProps {
  onCareerSelect: (career: string) => void;
}

export default function HeroSection({ onCareerSelect }: HeroSectionProps) {
  function selectPopularCareer(career: string) {
    onCareerSelect(career);
    analytics.popularCareerClick(career);
    document
      .getElementById("career-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="pb-16 pt-20 text-center sm:pt-28">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        Free — no signup required
      </div>
      <h2 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
        Your next career move,
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          engineered.
        </span>
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
        Tell us where you are and where you want to be. SkillBridge generates a
        personalized 3-phase roadmap — from foundation skills to industry
        authority — with specific resources, milestones, and timelines.
      </p>

      <div className="mb-12">
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Popular career paths
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_CAREERS.map((career) => (
            <button
              key={career}
              onClick={() => selectPopularCareer(career)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-zinc-400 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300"
            >
              {career}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
