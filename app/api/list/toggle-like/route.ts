import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getListLikeStats, toggleListLike } from "@/lib/actions";

const requestSchema = z.object({
  listId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 },
      );
    }

    const listId = parsed.data.listId;

    const toggle = await toggleListLike(listId);
    const stats = await getListLikeStats(listId);

    return NextResponse.json({
      liked: toggle.liked,
      likesCount: stats.likesCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update list like";
    if (message.toLowerCase().includes("not authenticated")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
