"use client";

import { useState } from "react";
import Link from "next/link";

export default function InterviewCTA({
  slug,
  paid,
}: {
  slug: string;
  paid: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (data.alreadyPaid) {
        window.location.reload();
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <div className="mb-12 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 text-center">
        <div className="mb-3 text-4xl">🎙️</div>
        <h3 className="mb-2 text-xl font-bold text-white">
          Your Mock Interview is Ready
        </h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
          Jump in and practice with questions tailored to your roadmap.
        </p>
        <Link
          href={`/r/${slug}/interview`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-500 hover:to-teal-500"
        >
          Start Interview →
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mb-12 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-10 text-center sm:p-12">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 text-5xl">🎙️</div>
        <h3 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          Ready to Ace the Interview?
        </h3>
        <p className="mx-auto mb-3 max-w-lg text-base text-zinc-300">
          Get a personalized mock interview with questions tailored to{" "}
          <span className="font-medium text-white">your exact roadmap</span>.
          Practice before the real thing.
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-zinc-500">
          AI-generated questions • Timed practice • Coaching tips included
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Spinner />
              Redirecting to checkout...
            </>
          ) : (
            "Unlock Mock Interview — $9"
          )}
        </button>
        <p className="mt-4 text-xs text-zinc-600">
          One-time payment • Instant access • Powered by Stripe
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
