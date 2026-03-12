export interface RoadmapStep {
  phase: number;
  title: string;
  duration: string;
  skills: string[];
  resources: string[];
  milestone: string;
}

export interface RoadmapResponse {
  roadmap: RoadmapStep[];
  estimatedTimeline: string;
  generatedAt: string;
}

export interface SavedRoadmap {
  slug: string;
  input: {
    currentRole: string;
    targetRole: string;
    skills: string[];
    experience: number;
  };
  result: RoadmapResponse;
  createdAt: string;
}

export interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  starRewrites?: string[];    // STAR method rewrites of weak answers
  aiGenerated: boolean;       // true if Claude responded, false if fallback
  evaluatedAt: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  tip: string;
}
