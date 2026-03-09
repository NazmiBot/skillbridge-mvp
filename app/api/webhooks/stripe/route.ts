import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getRedis } from "@/lib/redis";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      // Verify signature in production
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Dev mode — parse directly (no signature verification)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug = session.metadata?.roadmapSlug;

    if (slug) {
      const db = getRedis();
      // Mark as paid — no TTL, persists as long as the roadmap exists
      await db.set(`interview:paid:${slug}`, "true");
      // Track revenue
      await db.incr("interviews:paid:count");
      console.log(`[Stripe Webhook] Interview unlocked for roadmap: ${slug}`);
    }
  }

  return NextResponse.json({ received: true });
}
