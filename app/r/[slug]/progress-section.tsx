"use client";

import { useEffect, useState } from "react";
import ProgressTracker from "@/components/ProgressTracker";
import type { RoadmapStep } from "@/lib/types";

interface ProgressSectionProps {
  roadmap: RoadmapStep[];
  slug: string;
}

export default function ProgressSection({ roadmap, slug }: ProgressSectionProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sb_progress_email");
    setEmail(stored);
    setReady(true);

    // Handle unsubscribe from email link
    const params = new URLSearchParams(window.location.search);
    if (params.get("unsubscribe") === "true") {
      const unsEmail = params.get("email");
      if (unsEmail) {
        fetch("/api/progress/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: unsEmail, slug }),
        }).catch(() => {});
      }
    }
  }, [slug]);

  if (!ready) return null;

  return (
    <div className="mb-12">
      <ProgressTracker roadmap={roadmap} slug={slug} initialEmail={email || undefined} />
    </div>
  );
}
