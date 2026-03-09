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

  return (
    <div className="mb-12 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-8 text-center">
      <div className="mb-3 text-4xl">🎙️</div>
      <h3 className="mb-2 text-xl font-bold text-white">Mock Interview</h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-zinc-400">
        Practice with tailored interview questions based on your roadmap.
        Get ready for the real thing.
      </p>

      {paid ? (
        <Link
          href={`/r/${slug}/interview`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500"
        >
          Start Interview →
        </Link>
      ) : (
        <>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
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
          <p className="mt-3 text-xs text-zinc-600">
            One-time payment • Powered by Stripe
          </p>
        </>
      )}
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
