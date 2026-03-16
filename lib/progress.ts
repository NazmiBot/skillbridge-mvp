import { getRedis } from "./redis";

export interface ProgressData {
  email: string;
  slug: string;
  completedSkills: string[];
  completedMilestones: number[];
  startedAt: string;
  lastActivityAt: string;
  phase: number;
}

function progressKey(email: string, slug: string) {
  return `progress:${email.toLowerCase()}:${slug}`;
}

const SUBSCRIBERS_KEY = "progress:subscribers";

export async function saveProgress(
  email: string,
  slug: string,
  completedSkills: string[],
  completedMilestones: number[]
): Promise<ProgressData> {
  const db = getRedis();
  const key = progressKey(email, slug);
  const existing = await db.get(key);

  const now = new Date().toISOString();
  let data: ProgressData;

  if (existing) {
    data = JSON.parse(existing) as ProgressData;
    data.completedSkills = completedSkills;
    data.completedMilestones = completedMilestones;
    data.lastActivityAt = now;
    // Compute current phase from completed milestones
    data.phase = completedMilestones.length > 0 ? Math.max(...completedMilestones) + 1 : 1;
  } else {
    data = {
      email: email.toLowerCase(),
      slug,
      completedSkills,
      completedMilestones,
      startedAt: now,
      lastActivityAt: now,
      phase: 1,
    };
  }

  await db.set(key, JSON.stringify(data));
  return data;
}

export async function loadProgress(
  email: string,
  slug: string
): Promise<ProgressData | null> {
  const db = getRedis();
  const raw = await db.get(progressKey(email, slug));
  if (!raw) return null;
  return JSON.parse(raw) as ProgressData;
}

export async function subscribe(email: string, slug: string): Promise<void> {
  const db = getRedis();
  await db.sadd(SUBSCRIBERS_KEY, `${email.toLowerCase()}:${slug}`);
}

export async function unsubscribe(email: string, slug: string): Promise<void> {
  const db = getRedis();
  await db.srem(SUBSCRIBERS_KEY, `${email.toLowerCase()}:${slug}`);
}

export async function getSubscribers(): Promise<{ email: string; slug: string }[]> {
  const db = getRedis();
  const members = await db.smembers(SUBSCRIBERS_KEY);
  return members.map((m) => {
    const idx = m.indexOf(":");
    return { email: m.slice(0, idx), slug: m.slice(idx + 1) };
  });
}
