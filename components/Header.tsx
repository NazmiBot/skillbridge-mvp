import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/5 px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
          <span className="text-lg">🌉</span>
          <span>
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/explore"
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            Explore
          </Link>
          <Link
            href="/blog"
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-gradient-to-r from-blue-600/20 to-violet-600/20 px-3 py-1.5 text-sm font-medium text-blue-300 transition hover:from-blue-600/30 hover:to-violet-600/30 sm:px-4 sm:py-2"
          >
            Try It Free ✨
          </Link>
        </nav>
      </div>
    </header>
  );
}
