const CATEGORIES = [
  "💼 Business & Sales",
  "👥 Human Resources",
  "📈 Marketing & Creative",
  "🏥 Healthcare",
  "🎓 Education",
  "⚙️ Operations",
  "💰 Finance",
  "💻 Tech",
  "👔 Leadership",
];

export default function CareerPaths() {
  return (
    <section className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
      <p className="mb-4 text-sm font-medium text-zinc-500">
        Covering 25+ career paths across
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
    </section>
  );
}
