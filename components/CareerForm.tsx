import Spinner from "./Spinner";

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

interface CareerFormProps {
  dreamCareer: string;
  currentRole: string;
  skills: string;
  experience: string;
  loading: boolean;
  onDreamCareerChange: (v: string) => void;
  onCurrentRoleChange: (v: string) => void;
  onSkillsChange: (v: string) => void;
  onExperienceChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CareerForm({
  dreamCareer,
  currentRole,
  skills,
  experience,
  loading,
  onDreamCareerChange,
  onCurrentRoleChange,
  onSkillsChange,
  onExperienceChange,
  onSubmit,
}: CareerFormProps) {
  return (
    <div className="relative mx-auto mb-12 max-w-2xl sm:mb-14">
      {/* Subtle glow behind the form */}
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-500/[0.04] via-purple-500/[0.02] to-transparent blur-2xl" />

      <form
        id="career-form"
        onSubmit={onSubmit}
        className="relative rounded-2xl border border-white/[0.08] bg-[#0f0f14] p-5 shadow-2xl shadow-black/40 sm:p-8"
      >
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">
          Dream Career <span className="text-blue-400">*</span>
        </label>
        <input
          type="text"
          value={dreamCareer}
          onChange={(e) => onDreamCareerChange(e.target.value)}
          placeholder="e.g. Staff Engineer, Product Manager, CTO..."
          required
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-lg text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
        />
        <div className="mt-2.5">
          <p className="mb-1.5 text-xs text-zinc-600">Quick suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CAREERS.map((career) => (
              <button
                key={career}
                type="button"
                onClick={() => onDreamCareerChange(career)}
                className={`rounded-full border px-3 py-1 text-xs transition active:scale-95 ${
                  dreamCareer === career
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-blue-500/20 hover:text-zinc-300"
                }`}
              >
                {career}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-400">
            Current Role
          </label>
          <input
            type="text"
            value={currentRole}
            onChange={(e) => onCurrentRoleChange(e.target.value)}
            placeholder="e.g. Junior Developer"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-400">
            Years of Experience
          </label>
          <input
            type="number"
            value={experience}
            onChange={(e) => onExperienceChange(e.target.value)}
            placeholder="e.g. 2"
            min="0"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">
          Your Skills
          <span className="text-zinc-600">
            {" "}
            (comma-separated, helps personalize your roadmap)
          </span>
        </label>
        <input
          type="text"
          value={skills}
          onChange={(e) => onSkillsChange(e.target.value)}
          placeholder="e.g. React, TypeScript, CSS, Node.js"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-zinc-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !dreamCareer.trim()}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition active:scale-[0.97] hover:from-blue-500 hover:via-blue-400 hover:to-purple-500 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Architecting Blueprint...
          </span>
        ) : (
          "Generate My Career Blueprint →"
        )}
      </button>
      <p className="mt-3 text-center text-xs text-zinc-600">
        3 free blueprints per day — no account needed
      </p>
    </form>
    </div>
  );
}
