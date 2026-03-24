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
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        Free — no signup required
      </div>
      <h2 className="mb-5 text-3xl font-extrabold tracking-tight sm:mb-6 sm:text-5xl lg:text-7xl">
        Your next career move,
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          mapped out.
        </span>
      </h2>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-xl">
        Changing careers? Not sure what to learn first? Tell us where you are
        and where you want to go — we&apos;ll build you a personalized step-by-step
        roadmap with the exact skills, resources, and milestones you need.
      </p>

      {count !== null && count > 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          Join{" "}
          <span className="font-semibold text-zinc-300">
            {count.toLocaleString()}+
          </span>{" "}
          career changers building their next chapter
        </p>
      )}
    </section>
  );
}
