import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getRedis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing roadmap slug" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit("checkout", ip, 10, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Verify roadmap exists
    const db = getRedis();
    const exists = await db.exists(`roadmap:${slug}`);
    if (!exists) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // Check if already paid
    const paid = await db.get(`interview:paid:${slug}`);
    if (paid === "true") {
      return NextResponse.json({ error: "Already purchased", alreadyPaid: true }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 100, // TEMP $1.00 for live payment test — revert to 900 ($9.00) before launch
            product_data: {
              name: "SkillBridge Mock Interview",
              description: "AI-powered mock interview tailored to your career roadmap",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { roadmapSlug: slug },
      success_url: `${baseUrl}/r/${slug}?paid=true`,
      cancel_url: `${baseUrl}/r/${slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Checkout] Failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
