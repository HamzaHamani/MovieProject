import { NextRequest, NextResponse } from "next/server";

import { getListLikeStats, toggleListLike } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { listId?: string };
    const listId = String(body?.listId ?? "").trim();

    if (!listId) {
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 },
      );
    }

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
