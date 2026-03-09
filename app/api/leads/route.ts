import { NextRequest, NextResponse } from "next/server";

// Lead Capture API — stores email for Authority phase unlock
// Uses Vercel KV when available, falls back to in-memory store for dev

let memoryStore: Map<string, { email: string; timestamp: string }> | null =
  null;

function getMemoryStore() {
  if (!memoryStore) memoryStore = new Map();
  return memoryStore;
}

async function storeWithKV(
  email: string,
  roadmapSlug?: string
): Promise<boolean> {
  try {
    // Dynamic import — only loads if KV env vars exist
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return false;
    }
    const { kv } = await import("@vercel/kv");
    const key = `lead:${email}`;
    await kv.set(key, {
      email,
      roadmapSlug: roadmapSlug ?? null,
      capturedAt: new Date().toISOString(),
    });
    // Track total leads count
    await kv.incr("leads:count");
    return true;
  } catch {
    return false;
  }
}

function storeInMemory(email: string): void {
  const store = getMemoryStore();
  store.set(email, {
    email,
    timestamp: new Date().toISOString(),
  });
  console.log(`[Leads] Stored in memory (dev mode). Total: ${store.size}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = body.email?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Try KV first, fall back to memory
    const storedInKV = await storeWithKV(email, body.roadmapSlug);
    if (!storedInKV) {
      storeInMemory(email);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authority Blueprint unlocked",
        storage: storedInKV ? "kv" : "memory",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Leads] Capture failed:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
