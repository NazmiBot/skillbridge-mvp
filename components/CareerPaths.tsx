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

export default function CareerPaths() {
  return (
    <section className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
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
    </section>
  );
}
