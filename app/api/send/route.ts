import { NextResponse } from "next/server";
import { Resend } from "resend";
import BlueprintEmail from "@/emails/BlueprintEmail";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function POST(req: Request) {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
