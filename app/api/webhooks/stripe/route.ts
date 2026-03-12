import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getRedis } from "@/lib/redis";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
