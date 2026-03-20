import { NextRequest } from "next/server";

/**
 * Verify that a request comes from Vercel Cron or an authorized manual call.
 * Accepts both `Authorization: Bearer <CRON_SECRET>` (Vercel's default)
 * and `x-cron-secret` header (for manual/testing calls).
 */
export function verifyCron(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const header = req.headers.get("x-cron-secret");
  if (header === process.env.CRON_SECRET) return true;
  return false;
}
