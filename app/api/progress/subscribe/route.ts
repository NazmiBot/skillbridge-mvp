import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/progress";

export async function POST(req: NextRequest) {
  try {
    const { email, slug } = await req.json();

    if (!email || !slug) {
      return NextResponse.json({ error: "email and slug are required" }, { status: 400 });
    }

    await subscribe(email, slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
