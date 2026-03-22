"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface RoadmapSummary {
  slug: string;
  currentRole: string;
  targetRole: string;
  estimatedTimeline: string;
  phases: string[];
  createdAt: string;
}

const CATEGORIES: { label: string; icon: string; keywords: string[] }[] = [
  {
    label: "Engineering",
    icon: "🛠",
    keywords: [
      "engineer", "developer", "frontend", "backend", "fullstack",
      "full-stack", "full stack", "software", "web dev", "sre",
      "staff", "principal", "architect",
    ],
  },
  {
    label: "Data & AI",
    icon: "📊",
    keywords: [
      "data", "ai", "ml", "machine learning", "analytics", "scientist",
      "deep learning", "nlp", "llm",
    ],
  },
  {
    label: "Design",
    icon: "🎨",
    keywords: ["design", "ux", "ui", "product design", "graphic"],
  },
  {
    label: "Product",
    icon: "📋",
    keywords: ["product manager", "product owner", "pm", "product lead"],
  },
  {
    label: "DevOps & Cloud",
    icon: "☁️",
    keywords: ["devops", "cloud", "infrastructure", "platform", "sre", "kubernetes", "aws", "azure"],
  },
  {
    label: "Leadership",
    icon: "👔",
    keywords: [
      "manager", "director", "vp", "cto", "cio", "lead", "head of",
      "chief", "executive", "management",
    ],
  },
  {
    label: "Marketing",
    icon: "📈",
    keywords: ["marketing", "growth", "seo", "content", "brand"],
  },
];

function categorize(targetRole: string): string[] {
  const lower = targetRole.toLowerCase();
  const matches = CATEGORIES.filter((cat) =>
    cat.keywords.some((kw) => lower.includes(kw))
  ).map((c) => c.label);
  return matches.length > 0 ? matches : ["Other"];
}

export default function ExploreGrid({
  roadmaps,
}: {
  roadmaps: RoadmapSummary[];
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Count per category for the pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of roadmaps) {
      for (const cat of categorize(r.targetRole)) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [roadmaps]);

  // Only show categories that have at least 1 roadmap
  const visibleCategories = CATEGORIES.filter(
    (c) => (categoryCounts[c.label] || 0) > 0
  );

  const filtered = useMemo(() => {
    if (!activeFilter) return roadmaps;
    return roadmaps.filter((r) =>
      categorize(r.targetRole).includes(activeFilter)
    );
  }, [roadmaps, activeFilter]);

  if (roadmaps.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f14] p-12 text-center">
        <p className="text-lg text-zinc-500">No blueprints yet. Be the first!</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Create Blueprint →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Filter Pills */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            activeFilter === null
              ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
              : "border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
          }`}
        >
          All ({roadmaps.length})
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat.label}
            onClick={() =>
              setActiveFilter(activeFilter === cat.label ? null : cat.label)
            }
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeFilter === cat.label
                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            }`}
          >
            {cat.icon} {cat.label} ({categoryCounts[cat.label]})
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((r) => (
          <Link
            key={r.slug}
            href={`/r/${r.slug}`}
            className="group rounded-2xl border border-white/[0.06] bg-[#0f0f14] p-6 transition hover:border-blue-500/30 hover:bg-[#12121a]"
          >
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
              <span>{r.currentRole}</span>
              <span className="text-zinc-700">→</span>
              <span className="font-medium text-blue-400 group-hover:text-blue-300">
                {r.targetRole}
              </span>
            </div>
            <div className="mb-3 flex gap-2">
              {r.phases.map((p, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-500"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>⏱ {r.estimatedTimeline}</span>
              <span>
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f14] p-8 text-center">
          <p className="text-zinc-500">
            No blueprints in this category yet.{" "}
            <Link href="/" className="text-blue-400 hover:underline">
              Create the first one →
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
