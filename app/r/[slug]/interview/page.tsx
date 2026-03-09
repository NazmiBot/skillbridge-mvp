"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface InterviewQuestion {
  question: string;
  category: string;
  tip: string;
}

interface InterviewState {
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: string[];
  phase: "loading" | "ready" | "active" | "review";
  error: string | null;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [state, setState] = useState<InterviewState>({
    questions: [],
    currentIndex: 0,
    answers: [],
    phase: "loading",
    error: null,
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 min per question
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/interview/${slug}`);
        if (!res.ok) {
          const data = await res.json();
          if (data.requiresPayment) {
            router.replace(`/r/${slug}`);
            return;
          }
          throw new Error(data.error || "Failed to load interview");
        }
        const data = await res.json();
        setState((s) => ({
          ...s,
          questions: data.questions,
          answers: new Array(data.questions.length).fill(""),
          phase: "ready",
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          phase: "loading",
          error: err instanceof Error ? err.message : "Something went wrong",
        }));
      }
    }
    load();
  }, [slug, router]);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  const startInterview = useCallback(() => {
    setState((s) => ({ ...s, phase: "active" }));
    setTimerActive(true);
    setTimeLeft(120);
  }, []);

  const nextQuestion = useCallback(() => {
    setState((s) => {
      const newAnswers = [...s.answers];
      newAnswers[s.currentIndex] = currentAnswer;

      if (s.currentIndex >= s.questions.length - 1) {
        return { ...s, answers: newAnswers, phase: "review" };
      }

      return {
        ...s,
        answers: newAnswers,
        currentIndex: s.currentIndex + 1,
      };
    });
    setCurrentAnswer("");
    setTimeLeft(120);
  }, [currentAnswer]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p className="mb-4 text-red-400">{state.error}</p>
          <Link href={`/r/${slug}`} className="text-blue-400 underline">
            Back to roadmap
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-zinc-400">Loading interview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Mock Interview
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Ready Phase */}
        {state.phase === "ready" && (
          <div className="text-center">
            <div className="mb-6 text-5xl">🎙️</div>
            <h1 className="mb-3 text-3xl font-bold">Your Mock Interview</h1>
            <p className="mb-2 text-zinc-400">
              {state.questions.length} questions tailored to your career roadmap
            </p>
            <p className="mb-8 text-sm text-zinc-600">
              2 minutes per question • Type your answers • Review at the end
            </p>
            <button
              onClick={startInterview}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-500"
            >
              Start Interview →
            </button>
          </div>
        )}

        {/* Active Phase */}
        {state.phase === "active" && (
          <div>
            {/* Progress */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-zinc-500">
                  Q{state.currentIndex + 1}/{state.questions.length}
                </span>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                    style={{
                      width: `${((state.currentIndex + 1) / state.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <span
                className={`font-mono text-sm ${timeLeft <= 30 ? "text-red-400" : "text-zinc-500"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Question Card */}
            <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <span className="mb-2 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {state.questions[state.currentIndex].category}
              </span>
              <h2 className="mb-4 text-xl font-bold leading-relaxed">
                {state.questions[state.currentIndex].question}
              </h2>
              <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-2">
                <p className="text-xs text-amber-400">
                  💡 {state.questions[state.currentIndex].tip}
                </p>
              </div>
            </div>

            {/* Answer Input */}
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
            />

            <button
              onClick={nextQuestion}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500"
            >
              {state.currentIndex >= state.questions.length - 1
                ? "Finish Interview"
                : "Next Question →"}
            </button>
          </div>
        )}

        {/* Review Phase */}
        {state.phase === "review" && (
          <div>
            <div className="mb-8 text-center">
              <div className="mb-4 text-5xl">✅</div>
              <h1 className="mb-2 text-3xl font-bold">Interview Complete</h1>
              <p className="text-zinc-400">
                Review your answers below
              </p>
            </div>

            <div className="space-y-6">
              {state.questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <span className="mb-2 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                    {q.category}
                  </span>
                  <h3 className="mb-3 font-bold">{q.question}</h3>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-sm text-zinc-300">
                      {state.answers[i] || (
                        <span className="italic text-zinc-600">No answer provided</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href={`/r/${slug}`}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
              >
                Back to Roadmap
              </Link>
              <button
                onClick={() => {
                  setState((s) => ({
                    ...s,
                    currentIndex: 0,
                    answers: new Array(s.questions.length).fill(""),
                    phase: "ready",
                  }));
                  setCurrentAnswer("");
                }}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500"
              >
                Retake Interview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
