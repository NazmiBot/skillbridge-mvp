import { NextRequest, NextResponse } from "next/server";
import { loadProgress } from "@/lib/progress";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email query param is required" }, { status: 400 });
    }

    const data = await loadProgress(email, slug);
    if (!data) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Progress load error:", err);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}
