export default function Header() {
  return (
    <header className="border-b border-white/5 px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-white">Skill</span>
          <span className="text-blue-400">Bridge</span>
        </h1>
        <nav className="hidden items-center gap-4 sm:flex">
          <a href="/explore" className="text-sm text-zinc-500 transition hover:text-zinc-300">
            Explore
          </a>
          <a
            href="#career-form"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
          >
            Get Started →
          </a>
        </nav>
      </div>
    </header>
  );
}
