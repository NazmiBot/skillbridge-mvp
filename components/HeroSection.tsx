"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.blueprints > 0) setCount(d.blueprints);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="pb-8 pt-14 text-center sm:pb-12 sm:pt-28">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-sm text-amber-300">
        <span className="text-base">✨</span>
        100% free — no signup, no catch
      </div>
      <h2 className="mb-5 text-3xl font-extrabold tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
        You deserve a career
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
          you actually love.
        </span>
      </h2>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-xl">
        Thinking about a career change? You&apos;re not alone, and you don&apos;t have to
        figure it out by yourself. Tell us where you are and where you want
        to go — we&apos;ll create a personalized, step-by-step plan just for you.
      </p>

      {count !== null && count > 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          🎉{" "}
          <span className="font-semibold text-zinc-300">
            {count.toLocaleString()}+
          </span>{" "}
          people are already building their next chapter
        </p>
      )}
    </section>
  );
}
