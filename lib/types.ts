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
