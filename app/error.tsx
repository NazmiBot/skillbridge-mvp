"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
      <div className="mb-6 text-6xl">⚡</div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-md text-zinc-400">
        An unexpected error occurred. Try again — your career blueprint is still
        waiting.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500"
      >
        Try Again →
      </button>
    </div>
  );
}
