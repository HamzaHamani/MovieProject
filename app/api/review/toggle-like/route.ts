import { NextRequest, NextResponse } from "next/server";

import { toggleReviewLike } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { reviewId?: string };
    const reviewId = String(body?.reviewId ?? "").trim();

    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 },
      );
    }

    const result = await toggleReviewLike(reviewId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update like";
    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
