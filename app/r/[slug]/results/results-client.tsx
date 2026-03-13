"use client";

import { useRef, useCallback } from "react";
import type { EvaluationResult } from "@/lib/types";

interface Props {
  slug: string;
  evaluation: EvaluationResult;
  currentRole: string;
  targetRole: string;
  estimatedTimeline: string;
}

function scoreColor(score: number) {
  if (score >= 80) return { ring: "text-emerald-400", bg: "from-emerald-500/20 to-teal-500/10", label: "Excellent" };
  if (score >= 60) return { ring: "text-blue-400", bg: "from-blue-500/20 to-cyan-500/10", label: "Strong" };
  if (score >= 40) return { ring: "text-amber-400", bg: "from-amber-500/20 to-orange-500/10", label: "Developing" };
  return { ring: "text-red-400", bg: "from-red-500/20 to-pink-500/10", label: "Needs Work" };
}

function ScoreRing({ score }: { score: number }) {
  const { ring, label } = scoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70" cy="70" r="54"
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
        />
        <circle
          cx="70" cy="70" r="54"
          fill="none" stroke="currentColor" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${ring} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${ring}`}>{score}</span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
        <span className={`text-xs font-medium ${ring}`}>{label}</span>
      </div>
    </div>
  );
}

export default function ResultsClient({
  slug,
  evaluation,
  currentRole,
  targetRole,
  estimatedTimeline,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const margin = 20;
    const contentW = W - margin * 2;
    let y = 0;

    // -- Header bar --
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, W, 40, "F");
    doc.setFillColor(59, 130, 246); // blue-500 accent line
    doc.rect(0, 40, W, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SkillBridge", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Premium Readiness Report", margin, 27);

    doc.setFontSize(9);
    doc.text(
      new Date(evaluation.evaluatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      W - margin,
      27,
      { align: "right" }
    );

    y = 52;

    // -- Transition banner --
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(margin, y, contentW, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    // Truncate long role names to fit the banner
    const transitionText = `${currentRole}  >  ${targetRole}`;
    const maxBannerW = contentW - 10;
    doc.setFontSize(13);
    if (doc.getTextWidth(transitionText) > maxBannerW) {
      doc.setFontSize(10);
    }
    doc.text(transitionText, W / 2, y + 10, { align: "center", maxWidth: maxBannerW });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Estimated timeline: ${estimatedTimeline}`, W / 2, y + 17, { align: "center" });

    y += 30;

    // -- Score section --
    const scoreStr = String(evaluation.score);
    const { label } = scoreColor(evaluation.score);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("READINESS SCORE", margin, y);
    y += 8;

    doc.setFontSize(42);
    if (evaluation.score >= 60) {
      doc.setTextColor(16, 185, 129); // emerald
    } else if (evaluation.score >= 40) {
      doc.setTextColor(245, 158, 11); // amber
    } else {
      doc.setTextColor(239, 68, 68); // red
    }
    doc.text(scoreStr, margin, y + 12);
    const scoreStrWidth = doc.getTextWidth(scoreStr);

    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184);
    doc.text(`/ 100  —  ${label}`, margin + scoreStrWidth + 3, y + 12);

    y += 22;

    // -- Summary --
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    const summaryLines = doc.splitTextToSize(evaluation.summary, contentW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 10;

    // -- Divider --
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    y += 12;

    // Ensure enough room before starting strengths
    if (y > 200) { doc.addPage(); y = 25; }

    // -- Strengths --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text("[+]  STRENGTHS", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    for (const s of (evaluation.strengths ?? [])) {
      if (y > 265) { doc.addPage(); y = 25; }
      const lines = doc.splitTextToSize(`-  ${s}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5 + 3;
    }

    y += 12;

    // -- Weaknesses --
    if (y > 265) { doc.addPage(); y = 25; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(245, 158, 11);
    doc.text("[!]  AREAS FOR IMPROVEMENT", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    for (const w of (evaluation.weaknesses ?? [])) {
      if (y > 265) { doc.addPage(); y = 25; }
      const lines = doc.splitTextToSize(`-  ${w}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5 + 3;
    }

    y += 12;

    // -- Next Steps --
    if (y > 265) { doc.addPage(); y = 25; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(99, 102, 241); // indigo
    doc.text("[>]  NEXT STEPS", margin, y);
    y += 8;

    const nextSteps = [
      "Practice with the STAR framework (Situation, Task, Action, Result) to structure your answers clearly.",
      "Research the target role's key competencies and prepare specific examples for each.",
      "Record yourself answering common questions and review for clarity, pace, and confidence.",
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    for (const step of nextSteps) {
      if (y > 265) { doc.addPage(); y = 25; }
      const lines = doc.splitTextToSize(`-  ${step}`, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5 + 3;
    }

    // -- STAR Rewrites (if available) --
    if (evaluation.starRewrites && evaluation.starRewrites.length > 0) {
      y += 12;
      if (y > 265) { doc.addPage(); y = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(139, 92, 246); // purple
      doc.text("[*]  HOW TO IMPROVE - STAR REWRITES", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      for (const rewrite of evaluation.starRewrites) {
        if (y > 240) { doc.addPage(); y = 25; }
        const lines = doc.splitTextToSize(rewrite, contentW - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5 + 6;
      }
    }

    // -- Learning Roadmap --
    if (evaluation.learningRoadmap) {
      const lr = evaluation.learningRoadmap;
      y += 12;
      if (y > 240) { doc.addPage(); y = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246); // blue-500
      doc.text("[*]  YOUR CUSTOM LEARNING ROADMAP", margin, y);
      y += 10;

      // What to Study
      if (lr.topicsToStudy.length > 0) {
        if (y > 255) { doc.addPage(); y = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(96, 165, 250); // blue-400
        doc.text("What to Study", margin + 2, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        for (const topic of lr.topicsToStudy) {
          if (y > 265) { doc.addPage(); y = 25; }
          const lines = doc.splitTextToSize(`-  ${topic}`, contentW - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 5 + 3;
        }
        y += 4;
      }

      // What to Watch
      if (lr.resourcesToWatch.length > 0) {
        if (y > 255) { doc.addPage(); y = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(96, 165, 250);
        doc.text("What to Watch", margin + 2, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        for (const resource of lr.resourcesToWatch) {
          if (y > 265) { doc.addPage(); y = 25; }
          const lines = doc.splitTextToSize(`-  ${resource}`, contentW - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 5 + 3;
        }
        y += 4;
      }

      // Action Plan
      if (lr.milestones.length > 0) {
        if (y > 255) { doc.addPage(); y = 25; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(96, 165, 250);
        doc.text("Action Plan", margin + 2, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        for (const milestone of lr.milestones) {
          if (y > 265) { doc.addPage(); y = 25; }
          const lines = doc.splitTextToSize(`-  ${milestone}`, contentW - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 5 + 3;
        }
      }
    }

    // -- Footer --
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, 282, W - margin, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("tryskillbridge.com", margin, 289);
      doc.text(`Page ${i} of ${pageCount}`, W - margin, 289, { align: "right" });
    }

    doc.save(`SkillBridge-Report-${slug}.pdf`);
  }, [slug, evaluation, currentRole, targetRole, estimatedTimeline]);

  const sc = scoreColor(evaluation.score);

  return (
    <div ref={reportRef}>
      {/* Hero */}
      <div className="mb-10 text-center">
        <p className="mb-2 font-mono text-sm text-zinc-500">Mock Interview Evaluation</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-zinc-400">{currentRole}</span>
          <span className="mx-3 text-zinc-600">→</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {targetRole}
          </span>
        </h1>
        <p className="text-sm text-zinc-500">
          Evaluated on{" "}
          {new Date(evaluation.evaluatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Score Card */}
      <div className={`mb-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br ${sc.bg} p-8 text-center`}>
        <ScoreRing score={evaluation.score} />
        <p className="mx-auto mt-6 max-w-xl text-base text-zinc-300 leading-relaxed">
          {evaluation.summary}
        </p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h2 className="text-lg font-bold text-emerald-400">Strengths</h2>
          </div>
          <ul className="space-y-3">
            {(evaluation.strengths ?? []).length > 0 ? (
              (evaluation.strengths ?? []).map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-500 italic">No strengths data available.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h2 className="text-lg font-bold text-amber-400">Areas to Improve</h2>
          </div>
          <ul className="space-y-3">
            {(evaluation.weaknesses ?? []).length > 0 ? (
              (evaluation.weaknesses ?? []).map((w, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="mt-0.5 text-amber-500">▲</span>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-500 italic">No improvement areas identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* STAR Rewrites */}
      {evaluation.starRewrites && evaluation.starRewrites.length > 0 && (
        <div className="mb-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h2 className="text-lg font-bold text-purple-400">How to Improve — STAR Rewrites</h2>
          </div>
          <div className="space-y-4">
            {evaluation.starRewrites.map((r, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Roadmap */}
      {evaluation.learningRoadmap && (
        <div className="mb-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-6">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-lg font-bold text-blue-400">Your Custom Learning Roadmap</h2>
          </div>
          <div className="space-y-6">
            {/* What to Study */}
            {evaluation.learningRoadmap.topicsToStudy.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">What to Study</h3>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.topicsToStudy.map((t, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                      <span className="mt-0.5 text-blue-500">📘</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* What to Watch */}
            {evaluation.learningRoadmap.resourcesToWatch.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">What to Watch</h3>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.resourcesToWatch.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                      <span className="mt-0.5 text-red-500">▶</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Action Plan */}
            {evaluation.learningRoadmap.milestones.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-300/70">Action Plan</h3>
                <ul className="space-y-2">
                  {evaluation.learningRoadmap.milestones.map((m, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                      <span className="mt-0.5 text-emerald-500">✓</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Download or AI failure notice */}
      <div className="flex justify-center">
        {evaluation.aiGenerated === false ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <p className="text-amber-400 font-medium mb-2">Premium Report Unavailable</p>
            <p className="text-sm text-zinc-400">Our AI engine couldn&apos;t generate your personalized evaluation. Your report will be ready shortly — please refresh this page in 30 seconds.</p>
          </div>
        ) : (
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Premium Readiness Report
          </button>
        )}
      </div>
    </div>
  );
}
