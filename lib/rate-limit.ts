import { getRedis } from "@/lib/redis";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(
  prefix: string,
  ip: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${prefix}:${ip}`;
  const db = getRedis();
  const count = await db.incr(key);
  if (count === 1) await db.expire(key, windowSeconds);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
