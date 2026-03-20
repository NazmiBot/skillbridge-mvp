"use client";

import { useState, useCallback } from "react";
import type { RoadmapStep } from "@/lib/types";

interface Props {
  slug: string;
  currentRole: string;
  targetRole: string;
  estimatedTimeline: string;
  experience: number;
  skills: string[];
  roadmap: RoadmapStep[];
}

// Strip emojis and replace Unicode arrows for jsPDF compatibility
function sanitizeForPDF(text: string): string {
  return text
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hasEmailBeenCaptured(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("skillbridge_email_captured") === "true";
}

export default function DownloadPDF({
  slug,
  currentRole,
  targetRole,
  estimatedTimeline,
  experience,
  skills,
  roadmap,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const generatePDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const margin = 20;
    const contentW = W - margin * 2;
    let y = 0;

    // ── Header bar ──
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 40, "F");
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 40, W, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SkillBridge", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Career Blueprint", margin, 27);

    doc.setFontSize(9);
    doc.text(
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      W - margin,
      27,
      { align: "right" }
    );

    y = 52;

    // ── Transition banner ──
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentW, 24, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    const transitionText = sanitizeForPDF(`${currentRole}  →  ${targetRole}`);
    const maxBannerW = contentW - 10;
    if (doc.getTextWidth(transitionText) > maxBannerW) doc.setFontSize(11);
    doc.text(transitionText, W / 2, y + 10, { align: "center", maxWidth: maxBannerW });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${estimatedTimeline}  •  ${experience} years exp  •  ${skills.length} current skills`,
      W / 2,
      y + 19,
      { align: "center" }
    );

    y += 34;

    // ── Phase cards ──
    const phaseColors: Record<string, { r: number; g: number; b: number; accent: string }> = {
      Foundation: { r: 245, g: 158, b: 11, accent: "[F]" },
      Execution: { r: 59, g: 130, b: 246, accent: "[E]" },
      Authority: { r: 168, g: 85, b: 247, accent: "[A]" },
    };

    for (const step of roadmap) {
      const color = phaseColors[step.title] || { r: 113, g: 113, b: 122, accent: "📍" };

      // Check if we need a new page
      if (y > 200) {
        doc.addPage();
        y = 25;
      }

      // Phase header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(color.r, color.g, color.b);
      doc.text(sanitizeForPDF(`${color.accent}  Phase ${step.phase}: ${step.title}`), margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(step.duration, margin + 2, y + 6);
      y += 14;

      // Skills
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122);
      doc.text("SKILLS TO DEVELOP", margin + 2, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(212, 212, 216);
      const skillText = step.skills.map((s) => `> ${sanitizeForPDF(s)}`).join("   ");
      const skillLines = doc.splitTextToSize(skillText, contentW - 4);
      doc.text(skillLines, margin + 2, y);
      y += skillLines.length * 4.5 + 4;

      // Resources
      if (step.resources.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(113, 113, 122);
        doc.text("RESOURCES", margin + 2, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(161, 161, 170);
        for (const resource of step.resources) {
          if (y > 265) { doc.addPage(); y = 25; }
          const lines = doc.splitTextToSize(`- ${sanitizeForPDF(resource)}`, contentW - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4.5 + 2;
        }
        y += 2;
      }

      // Milestone
      if (y > 255) { doc.addPage(); y = 25; }
      doc.setFillColor(24, 24, 27);
      doc.roundedRect(margin + 2, y - 1, contentW - 4, 12, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(113, 113, 122);
      doc.text("MILESTONE", margin + 6, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(212, 212, 216);
      doc.text(sanitizeForPDF(step.milestone), margin + 6, y + 9, { maxWidth: contentW - 16 });

      y += 20;

      // Divider between phases
      if (step.phase < roadmap.length) {
        doc.setDrawColor(39, 39, 42);
        doc.setLineWidth(0.3);
        doc.line(margin, y, W - margin, y);
        y += 10;
      }
    }

    // ── Current skills snapshot ──
    if (skills.length > 0) {
      y += 5;
      if (y > 240) { doc.addPage(); y = 25; }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text("YOUR CURRENT SKILLS", margin, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(161, 161, 170);
      const currentSkills = skills.map((s) => `• ${s}`).join("   ");
      const csLines = doc.splitTextToSize(currentSkills, contentW);
      doc.text(csLines, margin + 2, y);
      y += csLines.length * 4.5;
    }

    // ── Footer on all pages ──
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(39, 39, 42);
      doc.setLineWidth(0.3);
      doc.line(margin, 282, W - margin, 282);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(82, 82, 91);
      doc.text("tryskillbridge.com", margin, 289);
      doc.text(`Page ${i} of ${pageCount}`, W - margin, 289, { align: "right" });
    }

    doc.save(`SkillBridge-Blueprint-${currentRole}-to-${targetRole}.pdf`);
  }, [slug, currentRole, targetRole, estimatedTimeline, experience, skills, roadmap]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Save lead
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), roadmapSlug: slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save email");
      }

      // Flag email captured so future PDF downloads skip the modal
      localStorage.setItem("skillbridge_email_captured", "true");

      // Generate and download PDF
      await generatePDF();
      setDownloaded(true);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => (downloaded || hasEmailBeenCaptured() ? generatePDF() : setShowModal(true))}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:from-blue-600/30 hover:to-purple-600/30 hover:border-white/20"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {downloaded ? "Download Blueprint PDF" : "Download as PDF"}
      </button>

      {/* Email capture modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Get your blueprint as a PDF
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Your {currentRole} → {targetRole} roadmap, beautifully formatted and ready to reference offline.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-50"
              >
                {loading ? "Generating PDF..." : "Download Blueprint →"}
              </button>

              <p className="text-center text-xs text-zinc-600">
                We&apos;ll send you one follow-up tip. That&apos;s it.
              </p>
            </form>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 text-sm text-zinc-500 transition hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
