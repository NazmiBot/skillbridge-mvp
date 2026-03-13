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

export interface LearningRoadmap {
  topicsToStudy: string[];    // 3 technical concepts the user failed to demonstrate
  resourcesToWatch: string[];  // 3 YouTube search terms or channel recommendations
  milestones: string[];        // 3-step action plan (e.g., "Week 1: Build X")
}

export interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  starRewrites?: string[];    // STAR method rewrites of weak answers
  learningRoadmap?: LearningRoadmap; // Targeted study plan based on weaknesses
  aiGenerated: boolean;       // true if Claude responded, false if fallback
  evaluatedAt: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  tip: string;
}
