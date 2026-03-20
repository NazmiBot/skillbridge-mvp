import { NextRequest } from "next/server";

/**
 * Extract the client IP from a Vercel/Next.js request.
 * Falls back to "unknown" if no IP header is present.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
