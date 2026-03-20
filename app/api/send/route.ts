import { NextRequest, NextResponse } from "next/server";
import BlueprintEmail from "@/emails/BlueprintEmail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getResend } from "@/lib/resend";
import { getClientIp } from "@/lib/ip";

export async function POST(req: NextRequest) {
  try {
    const resend = getResend();
    const body = await req.json();
    const { email, targetRole, currentRole, phases, estimatedTimeline, shareUrl } = body;

    if (!email || !targetRole || !phases?.length) {
      return NextResponse.json(
        { error: "Missing required fields: email, targetRole, phases" },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const { allowed } = await checkRateLimit("send", ip, 5, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { data, error } = await resend.emails.send({
      from: "SkillBridge <hello@tryskillbridge.com>",
      to: [email],
      subject: `Your Career Blueprint: ${currentRole || "You"} → ${targetRole}`,
      react: BlueprintEmail({
        targetRole,
        currentRole: currentRole || "Career Starter",
        phases,
        estimatedTimeline: estimatedTimeline || "12–18 months",
        shareUrl,
      }),
    });

    if (error) {
      console.error("[Send] Resend error:", error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[Send] Failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
