import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toggleReviewLike } from "@/lib/actions";

const requestSchema = z.object({
  reviewId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 },
      );
    }

    const reviewId = parsed.data.reviewId;

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
