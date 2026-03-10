import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
      <div className="mb-6 text-6xl">🗺️</div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-zinc-400">
        This roadmap doesn&apos;t exist — but yours could. Generate a free
        career blueprint in 10 seconds.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
      >
        Generate Your Blueprint →
      </Link>
    </div>
  );
}
